// Connects the host and a TV anywhere (any smart-TV browser, a laptop, a
// projector) through a free public MQTT message relay, using a room code.
//
// This is a tiny MQTT 3.1.1 client over WebSocket (connect, subscribe,
// publish, ping) so it runs on old TV browsers without a library.
// Only what's already visible on the TV goes through it: answers are only
// sent once the host reveals them.

const RELAY_BROKERS = ["wss://broker.hivemq.com:8884/mqtt", "wss://broker.emqx.io:8084/mqtt"];
const RELAY_ROOT = "jacobalicious-jeopardy/v1/";
const ROOM_LETTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ";

function newRoomCode() {
  let s = "";
  for (let i = 0; i < 4; i++) s += ROOM_LETTERS[Math.floor(Math.random() * ROOM_LETTERS.length)];
  return s;
}

function cleanRoomCode(s) {
  return String(s || "")
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, 4);
}

// Relay(code, { subscribe: [suffixes], onMessage(suffix, data), onStatus(connected) })
function Relay(code, opts) {
  const enc = new TextEncoder();
  const dec = new TextDecoder();
  const base = RELAY_ROOT + code + "/";
  let ws = null;
  let broker = 0;
  let pinger = null;
  let closed = false;
  let connected = false;
  let packetId = 1;
  let retryMs = 1000;
  let pending = new Uint8Array(0);

  function str(s) {
    const b = enc.encode(s);
    return [b.length >> 8, b.length & 255, ...b];
  }

  function packet(type, body) {
    const len = [];
    let n = body.length;
    do {
      let d = n % 128;
      n = Math.floor(n / 128);
      if (n > 0) d |= 128;
      len.push(d);
    } while (n > 0);
    const out = new Uint8Array(1 + len.length + body.length);
    out[0] = type;
    out.set(len, 1);
    out.set(body, 1 + len.length);
    return out;
  }

  function raw(bytes) {
    if (ws && ws.readyState === 1) ws.send(bytes);
  }

  function setConnected(v) {
    if (connected === v) return;
    connected = v;
    if (opts.onStatus) opts.onStatus(v);
  }

  function open() {
    if (closed) return;
    try {
      ws = new WebSocket(RELAY_BROKERS[broker], "mqtt");
    } catch (e) {
      return retry();
    }
    ws.binaryType = "arraybuffer";
    const giveUp = setTimeout(() => {
      if (!connected && ws) ws.close();
    }, 6000);
    ws.onopen = () => {
      const clientId = "jp-" + Math.random().toString(36).slice(2, 12);
      const body = [...str("MQTT"), 4, 0x02, 0, 60, ...str(clientId)];
      raw(packet(0x10, body));
    };
    ws.onmessage = (e) => {
      const incoming = new Uint8Array(e.data);
      const buf = new Uint8Array(pending.length + incoming.length);
      buf.set(pending);
      buf.set(incoming, pending.length);
      pending = readPackets(buf);
    };
    ws.onclose = () => {
      clearTimeout(giveUp);
      clearInterval(pinger);
      const was = connected;
      setConnected(false);
      if (!was) broker = (broker + 1) % RELAY_BROKERS.length; // try the other relay
      retry();
    };
    ws.onerror = () => {};
  }

  function retry() {
    if (closed) return;
    setTimeout(open, retryMs);
    retryMs = Math.min(retryMs * 2, 10000);
  }

  // Parses as many whole MQTT packets as the buffer holds; returns the leftover.
  function readPackets(buf) {
    let i = 0;
    while (i < buf.length) {
      const type = buf[i] >> 4;
      let len = 0;
      let mult = 1;
      let j = i + 1;
      let byte;
      do {
        if (j >= buf.length) return buf.slice(i);
        byte = buf[j++];
        len += (byte & 127) * mult;
        mult *= 128;
      } while (byte & 128);
      if (j + len > buf.length) return buf.slice(i);
      const body = buf.subarray(j, j + len);
      if (type === 2) onConnack(body);
      if (type === 3) onPublish(buf[i], body);
      i = j + len;
    }
    return new Uint8Array(0);
  }

  function onConnack(body) {
    if (body[1] !== 0) return ws.close();
    retryMs = 1000;
    (opts.subscribe || []).forEach((suffix) => {
      const id = packetId++ & 0xffff || 1;
      raw(packet(0x82, [id >> 8, id & 255, ...str(base + suffix), 0]));
    });
    pinger = setInterval(() => raw(new Uint8Array([0xc0, 0])), 30000);
    setConnected(true);
  }

  function onPublish(header, body) {
    const tlen = (body[0] << 8) | body[1];
    const topic = dec.decode(body.subarray(2, 2 + tlen));
    let p = 2 + tlen;
    if ((header >> 1) & 3) p += 2; // QoS > 0 has a packet id
    const text = dec.decode(body.subarray(p));
    if (!text || !topic.startsWith(base)) return;
    try {
      opts.onMessage(topic.slice(base.length), JSON.parse(text));
    } catch (e) {}
  }

  function send(suffix, data, retain) {
    if (!connected) return false;
    const payload = enc.encode(JSON.stringify(data));
    const t = str(base + suffix);
    const body = new Uint8Array(t.length + payload.length);
    body.set(t);
    body.set(payload, t.length);
    raw(packet(retain ? 0x31 : 0x30, body));
    return true;
  }

  open();
  return {
    code,
    send,
    isConnected: () => connected,
    close() {
      closed = true;
      clearInterval(pinger);
      if (ws) ws.close();
    },
  };
}
