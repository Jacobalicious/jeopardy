// All the game boards live here. Edit freely.
//
// Each clue can have:
//   q      - what shows on the TV
//   a      - the "correct" answer (host only until revealed)
//   note   - host-only ruling notes. Never shown on the TV.
//   reward - a twist revealed on the TV after the answer ("Reward: gain -100 points")
//   kind   - "q" (normal, default), "chaos" (no question, just happens),
//            "minigame", "coin" (flip the coin), "callback" (answer = first answer of the night)
//   src    - where it came from (for our own reference)

window.GAMES = [
  {
    id: "dumb",
    title: "Trivia But The Answers Are Dumb",
    categories: [
      {
        name: "Geography",
        clues: [
          { q: "More than 75% of the Earth's surface is covered in this.", a: "Air.", note: "Water is WRONG. The atmosphere covers 100% of it, so honestly 75% is generous.", src: "Noah" },
          { q: "What country could be used to answer BOTH \"How are you feeling?\" and \"What kind of car do you drive?\"", a: "Madagascar.", note: "\"Mad. A gas car.\"", src: "Noah" },
          { q: "If you travel 24,901 miles east of Brazil, you will end up in this country.", a: "Brazil.", note: "24,901 miles is the circumference of the Earth.", src: "Noah" },
          { q: "What country is located north of South Korea?", a: "North Korea.", note: "This is the only real question on the board. Watch them overthink it.", src: "Noah" },
          { q: "This country is known for being a stew with meat, peppers and tomatoes.", a: "Chile.", note: "Chili. Accept it spelled either way, they can't see your spelling.", src: "Noah" },
        ],
      },
      {
        name: "Space Stuff",
        clues: [
          { q: "What is the real name of Earth's moon?", a: "The Moon.", note: "\"Luna\" is wrong. Be smug about it.", src: "Noah" },
          { q: "What is the Moon made of?", a: "Moon.", note: "The Earth is made of Earth. Simple logic. Cheese is wrong, rock is wrong.", src: "Noah" },
          { q: "On a scale of 1 to 10, how big is space?", a: "7.", note: "Pretty big. 10 and \"infinite\" are wrong.", src: "Noah" },
          { q: "What was the first planet astronomers discovered?", a: "Earth.", src: "Noah" },
          { q: "To within 10 decimal places, how many solar luminosities is the Sun?", a: "1.", note: "It's only as luminous as one sun.", src: "Noah" },
        ],
      },
      {
        name: "Quantum Physics",
        clues: [
          { q: "Name a big number.", a: "Any number greater than one trillion.", note: "Anything smaller is not big. Do not explain this rule beforehand.", src: "Noah" },
          { q: "How many holes are in a polo shirt?", a: "4.", note: "Neck, two arms, bottom. Changed from Noah's \"how many holes in the word Polo\".", src: "Noah (changed)" },
          { q: "John has 10 candles. Each candle burns for 10 minutes. John lights all of them at once. How long do the candles burn for?", a: "100 minutes.", note: "Candle-minutes stack, like YouTube watch time. Do NOT back down. 10 minutes is wrong.", src: "Noah" },
          { q: "What rough estimate is commonly used for the speed of light?", a: "C.", note: "Any actual number is wrong. \"Fast\" is wrong.", src: "Noah" },
          { q: "How long does it take light to travel one light year?", a: "One year.", note: "It's in the name.", reward: "Reward: a Point Shield. Blocks your next loss of points.", src: "Noah" },
        ],
      },
      {
        name: "Mythical Creatures",
        clues: [
          { q: "This creature is known for flying.", a: "A fly.", note: "Bird, dragon, fairy: all wrong.", src: "Noah" },
          { q: "This four-legged creature is known for the horn on its head.", a: "A rhinoceros.", note: "Unicorn is wrong. Narwhal is wrong and has no legs.", src: "Noah" },
          { q: "This large, ferocious creature has many dragon-like qualities.", a: "A dragon.", note: "It's actually a dragon. They will not say dragon because they've learned. Enjoy.", src: "Noah" },
          { q: "Name a five-headed dragon from Yu-Gi-Oh.", a: "Five-Headed Dragon.", note: "That is its actual name. Any other dragon is wrong.", src: "Noah" },
          { kind: "minigame", q: "Everyone: draw a monster. The strongest monster wins.", a: "Host picks the winner.", note: "Give everyone 60 seconds and paper. Judge on vibes.", reward: "Reward: the winner gains 1 point.", src: "Noah" },
        ],
      },
      {
        name: "Economics",
        clues: [
          { q: "Choose another player to win.", a: "(They pick someone.)", reward: "Reward: that player gains -100 points.", src: "Noah" },
          { q: "What is 100 minus 200?", a: "-100.", reward: "Reward: gain -100 points.", src: "Noah" },
          { q: "How much was one dollar worth in 1976?", a: "One dollar.", src: "Noah" },
          { kind: "chaos", q: "INVESTMENT OPPORTUNITY\nAny player may invest any amount of points now. Investments pay out at the end of the game.", a: "(Take everyone's investments off their score now.)", note: "At the end of the game, reveal that the market crashed and it's all gone.", reward: "Update: the market crashed. Your investments are gone.", src: "Noah" },
          { kind: "coin", q: "ROULETTE\nAnyone may bet any amount. Red or black?", a: "Flip the coin. Heads = red, tails = black.", note: "Bets are all-or-nothing. Negative bets are allowed, which makes no sense. Good.", src: "Noah" },
        ],
      },
      {
        name: "Health",
        clues: [
          { q: "Doctors recommend doing this every 3 seconds.", a: "Breathing.", src: "Noah" },
          { q: "What is the laziest organ in the human body?", a: "The brain.", note: "Also accept anyone pointing at another contestant.", src: "Noah" },
          { q: "Bob is fighting three doctors. How many apples must he eat to keep them away for a day?", a: "3.", src: "Noah" },
          { q: "A person's head becomes detached from their body, but they don't die. Why?", a: "They haven't died YET.", note: "Also accept \"they're a Lego\" if it made you laugh.", src: "Noah" },
          { q: "What should you do when brought in for questioning about your involvement in a murder?", a: "Say nothing and ask for a lawyer.", src: "Noah" },
        ],
      },
    ],
    final: {
      category: "The Western Roman Empire",
      q: "Heads or tails?",
      a: "Flip the coin.",
      kind: "coin",
      note: "Everyone bets first, THEN you reveal the question. Write answers down secretly.",
    },
  },

  {
    id: "lie",
    title: "Trivia But I Lie",
    categories: [
      {
        name: "Shrek 2",
        clues: [
          { q: "This movie is a sequel to Shrek.", a: "Shrek 3.", note: "\"Shrek 2\" is wrong. It's a sequel to Shrek... 2.", src: "Noah" },
          { q: "Is grapefruit a fruit?", a: "No.", note: "According to this game show. Is the game show based on reality? No.", src: "Noah" },
          { q: "Who is the main character in the first Donkey Kong?", a: "Donkey Kong.", note: "It's in the name. Mario is technically right and therefore WRONG.", src: "Noah" },
          { q: "Why are all of the outer planets gas giants and all of the inner planets rocky?", a: "Near the Sun it was too hot for gases to condense onto the planets.", note: "It's a real answer. Whoever gets it right still gets the reward.", reward: "Reward: everyone who answered loses 500 points. You're welcome for the fun fact.", src: "Noah" },
          { kind: "minigame", q: "Rock, paper or scissors?", a: "Everyone writes one down. Host picks theirs AFTER seeing the answers.", note: "You go last. Obviously.", src: "Noah" },
        ],
      },
      {
        name: "Gambling",
        clues: [
          { kind: "chaos", q: "AUTOMATIC WIN", a: "They win 100.", src: "Noah" },
          { kind: "chaos", q: "AUTOMATIC WIN", a: "They win 200.", note: "Let them get comfortable.", src: "Noah" },
          { kind: "chaos", q: "AUTOMATIC WIN", a: "They win 300.", note: "Now everyone wants Gambling.", src: "Noah" },
          { kind: "chaos", q: "AUTOMATIC LOSS", a: "They lose 400.", src: "Noah" },
          { kind: "chaos", q: "AUTOMATIC LOSS", a: "They lose 500.", note: "\"I still think the last one is a win.\" It is not.", src: "Noah" },
        ],
      },
      {
        name: "Computer Science",
        clues: [
          { q: "x = 23\nx = x + 7\nWhat is the value of x?", a: "30.", note: "This one's real. People will argue that it makes no sense. It does, in code.", src: "Noah" },
          { q: "Are computers good at swimming?", a: "No.", src: "Noah" },
          { q: "What will this line of code do?\n// this function doesn't work, it needs to be fixed", a: "Nothing. It's a comment.", src: "Noah" },
          { q: "How do I fix my computer?", a: "Turn it off and on again.", src: "Noah" },
          { q: "Unscramble these letters:\nLOGARITHM", a: "ALGORITHM.", note: "\"Logarithm\" is not unscrambled. It's a perfect anagram, which is hilarious.", src: "Noah" },
        ],
      },
      {
        name: "Video Games",
        clues: [
          { q: "This plumber is known for going on adventures to save the princess and jumping through the Mushroom Kingdom.", a: "Luigi.", note: "Mario is wrong. Duh.", src: "Noah" },
          { q: "In this game, the player is a yellow circle with a mouth that eats white pellets and is chased by ghosts.", a: "Ms. Pac-Man.", note: "Pac-Man is wrong.", src: "Noah" },
          { q: "Unscramble these letters into a video game title:\nNET FOR IT", a: "Fortnite.", note: "A breather. Also sounds like a fishing simulator.", src: "Noah" },
          { q: "How do I get an extra life?", a: "Up Up Down Down Left Right Left Right B A.", note: "Must say BOTH ups. If they say one up, it's wrong. Check the recording.", src: "Noah" },
          { kind: "minigame", q: "Play the host in tic-tac-toe.", a: "Play it on paper or a whiteboard.", reward: "Reward: nothing.", src: "Noah" },
        ],
      },
      {
        name: "Astronomy",
        clues: [
          { q: "How many astronomical units is the Earth from the Sun?", a: "1.", note: "Genuinely real. They'll be suspicious.", src: "Noah" },
          { q: "You're in a car going 50 mph. Another car passes going 50 mph the opposite way. How fast does that car appear to be moving?", a: "Pretty fast.", note: "100 mph is wrong. 161 km/h is also wrong.", src: "Noah (changed)" },
          { q: "A bullet travels at half the speed of light. A laser pointer is fired the opposite direction. How fast do you observe the laser's light moving?", a: "C. The speed of light.", note: "Actually real. \"You see.\"", src: "Noah" },
          { q: "How big is space?\nA) Big\nB) Pretty big\nC) Super crazy very big\nD) Unbelievably crazy impossibly big", a: "B) Pretty big.", src: "Noah" },
          { q: "This object in our solar system is roughly one million times bigger than Earth.", a: "The Sun.", note: "Real. By volume it's about 1.3 million. Close enough.", src: "Noah" },
        ],
      },
      {
        name: "The Host",
        clues: [
          { q: "Who is the host's favorite contestant?", a: "Whoever didn't answer.", src: "Ours" },
          { q: "This person is slightly above average at Magic: The Gathering.", a: "The host.", src: "Noah (changed)" },
          { q: "Rate the host's intelligence from 1 to 10.", a: "Higher.", note: "Whatever they say, it's higher. If they say 10, it's 11.", src: "Ours" },
          { q: "What is the host's favorite ice cream?", a: "Whatever they didn't say.", note: "If someone gets it right, it changed this morning.", src: "Noah (changed)" },
          { q: "What is the host's star sign?", a: "Not that one.", note: "Whatever they guess, you lied. You're actually something else.", src: "Noah (changed)" },
        ],
      },
    ],
    final: {
      category: "Everything",
      q: "Final question.",
      a: "AUTOMATIC LOSS. Everyone loses what they bet.",
      kind: "chaos",
      note: "Get bets first. Someone will bet a negative number. Let them.",
    },
  },

  {
    id: "tea",
    title: "Tea Time With The Host",
    categories: [
      {
        name: "Tea Time",
        clues: [
          { kind: "chaos", q: "All players win 100 points.", a: "Everyone +100.", note: "Net effect on the game: none. Point it out.", src: "Noah" },
          { kind: "coin", q: "Heads or tails?", a: "Flip the coin.", reward: "Correct: +200. Wrong: nothing.", src: "Noah" },
          { kind: "chaos", q: "Choose a player to lose 300 points.", a: "They pick.", note: "Allow bribery. Encourage bribery.", src: "Noah" },
          { kind: "chaos", q: "FREE LOSS.", a: "They lose 400.", note: "Too bad. Should've been quicker.", src: "Noah" },
          { kind: "chaos", q: "Choose another player to win 500 points.", a: "They pick.", src: "Noah" },
        ],
      },
      {
        name: "Riddles For Babies",
        clues: [
          { q: "How many months have 28 days?", a: "All 12.", src: "Ours" },
          { q: "You're in a race and you pass the person in second place. What place are you in?", a: "Second.", note: "First is wrong.", src: "Ours" },
          { q: "How many animals of each kind did Moses take on the ark?", a: "Zero. It was Noah.", note: "Two is wrong. Fitting, given who we stole this game from.", src: "Ours" },
          { q: "A plane crashes exactly on the border of the US and Canada. Where do they bury the survivors?", a: "You don't bury survivors.", src: "Ours" },
          { q: "Before Mount Everest was discovered, what was the tallest mountain in the world?", a: "Mount Everest.", note: "It was still there. Nobody had measured it yet.", src: "Ours" },
        ],
      },
      {
        name: "Science (Real)",
        clues: [
          { q: "Which is heavier: a kilogram of steel or a kilogram of feathers?", a: "The steel.", note: "Because steel is heavier than feathers. Do NOT accept \"they're the same\". Hold this position under any amount of pressure.", src: "Ours" },
          { q: "How many sides does a circle have?", a: "2. Inside and outside.", note: "Zero, one, and infinity are all wrong.", src: "Ours" },
          { q: "Which came first: the chicken or the egg?", a: "The egg.", note: "Dinosaurs laid eggs long before chickens existed. This one's legit.", src: "Ours" },
          { q: "What is the most common element in the universe?", a: "Hydrogen.", note: "A completely real question. The panic is the point.", src: "Ours" },
          { q: "In a room of 23 people, what are the odds that two of them share a birthday?", a: "About 50%.", note: "Real. The birthday paradox. Accept 45-55%.", src: "Ours" },
        ],
      },
      {
        name: "English Class",
        clues: [
          { q: "What is the capital of France?", a: "F.", note: "Paris is wrong.", src: "Ours" },
          { q: "How many letters are in the alphabet?", a: "11.", note: "T-H-E A-L-P-H-A-B-E-T. 26 is wrong.", src: "Ours" },
          { q: "Everyone spell SILK out loud. Now: what do cows drink?", a: "Water.", note: "Milk is wrong. Make them all spell it first.", src: "Ours" },
          { q: "What is the only word in English that is always pronounced wrong?", a: "\"Wrong.\"", src: "Ours" },
          { q: "What word is spelled incorrectly in every single dictionary?", a: "\"Incorrectly.\"", src: "Ours" },
        ],
      },
      {
        name: "Mind Games",
        clues: [
          { q: "Do not say ding.", a: "(Anyone who dinged loses.)", note: "Read it slowly. Someone WILL ding.", reward: "Everyone who said ding loses 100 points.", src: "Ours" },
          { q: "Everyone close your eyes. What color is the host's shirt?", a: "Whatever color it is. Check.", note: "Actually make them close their eyes first. Put a jacket on if you're feeling evil.", src: "Ours" },
          { kind: "callback", q: "What was the answer to the very first question of tonight's game?", a: "(Shown automatically below.)", note: "Nobody will remember. You barely remember.", src: "Noah (changed)" },
          { q: "What is the least common answer to \"pick a random number from 1 to 10\"?", a: "7,658,205.", note: "Who would ever pick that number? Exactly.", src: "Noah" },
          { q: "What number is the host thinking of?", a: "Not that one.", note: "Whatever they say, it was one higher.", src: "Ours" },
        ],
      },
      {
        name: "Minigames",
        clues: [
          { kind: "minigame", q: "Staring contest with the host.", a: "Host decides who blinked.", src: "Ours" },
          { kind: "minigame", q: "Thumb war with the player to your left.", a: "Winner gets the points.", reward: "The loser also loses 200 points.", src: "Ours" },
          { kind: "minigame", q: "First player to touch something blue wins.", a: "Host judges what counts as blue.", note: "The TV screen is blue. That counts. Don't tell them.", src: "Ours" },
          { kind: "minigame", q: "Play the host in chess. You have 10 seconds.", a: "Nobody wins in 10 seconds.", note: "Reward nobody. Or give it to whoever complains the least.", src: "Noah (changed)" },
          { kind: "minigame", q: "Beat the host in rock paper scissors.\n(The host goes second.)", a: "The host wins.", src: "Ours" },
        ],
      },
    ],
    final: {
      category: "Tonight's Game",
      q: "What was the answer to the very first question of tonight's game?",
      a: "(Shown automatically.)",
      kind: "callback",
      note: "Bets first. This is a callback. If the Mind Games one was already played, this is double evil.",
    },
  },
];

// The two wheels. "label" is what's written on the wheel.
// "reveal" is optional small print that shows up AFTER it lands.
window.WHEELS = {
  good: {
    name: "The Good Wheel",
    segments: [
      { label: "Gain 500" },
      { label: "Nothing", reveal: "That's pretty good compared to everything else." },
      { label: "DOUBLE YOUR POINTS*", reveal: "*gain 200 points" },
      { label: "Steal 200" },
      { label: "Make someone spin the Bad Wheel" },
      { label: "Point Shield", reveal: "Blocks your next loss of points." },
      { label: "QUADRUPLE YOUR POINTS*", reveal: "*gain 200 points" },
      { label: "Gain 1 point" },
    ],
  },
  bad: {
    name: "The Bad Wheel",
    segments: [
      { label: "Lose 100" },
      { label: "Give away 300", reveal: "You pick who gets it." },
      { label: "Nothing" },
      { label: "+2", reveal: "Spin the Bad Wheel two more times." },
      { label: "Suffer With Friends", reveal: "Spin again, then pick someone else to spin too." },
      { label: "Lose 500 if you miss the next question" },
      { label: "You can't answer the next question" },
      { label: "Everyone else gains 200" },
      { label: "Move Left", reveal: "There is no board. Lose 300." },
      { label: "The Shadow Realm", reveal: "Sit on the floor until you get a question right." },
    ],
  },
};
