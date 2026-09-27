// Settings that live in the code.

// Chromecast app ID from the Google Cast developer console.
// Leave empty until the receiver is registered. It can also be pasted
// into the host screen, which saves it on that device.
window.CAST_APP_ID = "26A63765";

// Message channel name shared by the phone (sender) and the TV (receiver).
window.CAST_NS = "urn:x-cast:com.jacobalicious.jeopardy";

// Optional: replace any built-in sound with your own file.
// Drop the file in the sounds/ folder and list it here, e.g.
//   ding: "sounds/ding.mp3",
window.SOUND_FILES = {};
