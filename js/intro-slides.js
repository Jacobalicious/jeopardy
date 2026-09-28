// The fake "About Me" slideshow that opens the game. It starts as a normal,
// boring slide deck and falls apart one slide at a time until it gives up and
// becomes Jeopardy.
//
// Each slide:
//   layout   "title" | "bullets" | "crisis" (small lonely text) | "big" | "crash"
//   title    heading text          lines  bullet points / lines of text
//   counter  the slide number shown in the corner (it lies)
//   sag      0..1  how far the words tip over while the slide is up
//   fall     0..1  share of letters that drop to the bottom of the slide
//   fallOver seconds the falling is spread across
//   clink    play a little sound when a letter hits the floor
//   bg / ink slide colours
//   note     what the host should say (only the host sees this)
//
// Spelling mistakes and weird capitals are typed in on purpose.

const INTRO_SLIDES = [
  {
    name: "About Me",
    layout: "title",
    title: "About Me",
    lines: ["Jacob"],
    counter: "1 / 1",
    note: "Completely straight face. \"Hi, I'm Jacob. I made some slides about myself.\"",
  },
  {
    name: "Education",
    layout: "bullets",
    title: "Education",
    lines: ["Studying: Computer Engineering", "GPA: yes", "study habits: Excelent"],
    counter: "2 / 1",
    sag: 0.12,
    note: "Read it like a normal slide. Don't acknowledge that it says 2 of 1.",
  },
  {
    name: "Hobbies",
    layout: "bullets",
    title: "HobbIES",
    lines: [
      "electronics (they work Sometimes)",
      "rock clmbing (the rocks are winning)",
      "ICE cream",
      "ice creem again bc it is that good",
      "websites liek THIS ONE?????",
    ],
    counter: "3 / 1",
    sag: 0.45,
    fall: 0.05,
    fallOver: 14,
    clink: true,
    note: "Keep going like nothing is wrong. Letters will start falling off. Ignore them.",
  },
  {
    name: "Fun facts",
    layout: "bullets",
    title: "fUn FaCtS abt mE",
    lines: [
      "i made thees slides at 3:07 AM",
      "i have not slept",
      "the mitochondira is the powerhouse of teh",
      "i can name all 50 states (i canot)",
      "i am doing GREAT",
    ],
    counter: "4 / 1",
    sag: 0.85,
    fall: 0.3,
    fallOver: 20,
    clink: true,
    note: "Start sounding less sure of yourself. Trail off on the mitochondria one.",
  },
  {
    name: "why",
    layout: "crisis",
    lines: ["u know what,", "why am i telling you this"],
    counter: "5 / 1",
    bg: "#e4e4e4",
    ink: "#555",
    note: "Long pause. Just look at the slide.",
  },
  {
    name: "meat rock",
    layout: "crisis",
    lines: ["really we are all just meat", "on a rock", "spinning around a big fire", "in the dark"],
    counter: "",
    bg: "#1c1c1c",
    ink: "#8a8a8a",
    sag: 0.2,
    note: "Let it land.",
  },
  {
    name: "you know what",
    layout: "big",
    lines: ["you know what"],
    counter: "",
    bg: "#000",
    ink: "#fff",
    note: "Snap out of it.",
  },
  {
    name: "who cares",
    layout: "big",
    lines: ["who even the f*ck cares"],
    counter: "",
    bg: "#fff",
    ink: "#000",
    note: "Say it with your whole chest.",
  },
  {
    name: "LET'S PLAY JEOPARDY INSTEAD",
    layout: "crash",
    lines: ["LET'S PLAY JEOPARDY INSTEAD"],
    counter: "",
    note: "The slide falls off the screen and the game appears. Next goes to the board.",
  },
];
