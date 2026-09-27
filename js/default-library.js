// The built-in question bank. The editor (editor.html) starts from this and
// saves your changes in the browser. To make edits permanent for everyone,
// send Claude a "Send to phone" link or a backup file.
window.DEFAULT_LIBRARY = {
  "title": "Brain Damage Jeopardy",
  "rows": 9,
  "categories": [
    {
      "id": "geography",
      "name": "Geography",
      "onBoard": true,
      "questions": [
        {
          "id": "geography-1",
          "q": "More than 75% of the Earth's surface is covered in this.",
          "a": "Air.",
          "note": "Water is WRONG. The atmosphere covers 100% of it, so honestly 75% is generous.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "geography-2",
          "q": "What country could be used to answer BOTH \"How are you feeling?\" and \"What kind of car do you drive?\"",
          "a": "Madagascar.",
          "note": "\"Mad. A gas car.\"",
          "src": "Noah",
          "use": true
        },
        {
          "id": "geography-3",
          "q": "If you travel 24,901 miles west of Brazil, you will end up in this country.",
          "a": "Brazil.",
          "note": "24,901 miles is the circumference of the Earth.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "geography-4",
          "q": "What country is located north of South Korea?",
          "a": "North Korea.",
          "note": "This is the only real question on the board. Watch them overthink it.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "geography-5",
          "q": "This country is known for being a stew with meat, peppers and tomatoes.",
          "a": "Chile.",
          "note": "Chili. Accept it spelled either way, they can't see your spelling.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "geography-6",
          "q": "Despite what many people believe, this is the real tallest mountain in the world.",
          "a": "Mount Everest.",
          "note": "People expect a trick. There is no trick.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "geography-7",
          "q": "This pile of trash is roughly 1/3 the size of texas and is located in the Atlantic ocean",
          "a": "The United Kingdom",
          "src": "Jacob",
          "use": true
        },
        {
          "id": "geography-8",
          "q": "This attraction in the US is very popular because there's nothing there.",
          "a": "The Grand Canyon.",
          "reward": "Reward: pick a team to lose 200 points.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "geography-9",
          "q": "This country's leader is famous for having the smallest... hands.",
          "a": "Russia.",
          "note": "Noah's version was ruder. Adjust to taste.",
          "src": "Noah",
          "use": true
        }
      ]
    },
    {
      "id": "space-stuff",
      "name": "Space Stuff",
      "onBoard": true,
      "questions": [
        {
          "id": "space-stuff-1",
          "q": "What is the Moon made of?",
          "a": "Moon.",
          "note": "The Earth is made of Earth. Simple logic. Cheese is wrong, rock is wrong.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "space-stuff-2",
          "q": "On a scale of 1 to 10, how big is space?",
          "a": "7.",
          "note": "Pretty big. 10 and \"infinite\" are wrong.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "space-stuff-3",
          "q": "What was the first planet astronomers discovered?",
          "a": "Earth.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "space-stuff-4",
          "q": "To within 10 decimal places, how many solar luminosities is the Sun?",
          "a": "1.",
          "note": "It's only as luminous as one sun.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "space-stuff-5",
          "q": "This object in our solar system is roughly one million times bigger than Earth.",
          "a": "The Sun.",
          "note": "Real. By volume it's about 1.3 million. Close enough.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "space-stuff-6",
          "q": "How many astronomical units is the Earth from the Sun?",
          "a": "1.",
          "note": "Genuinely real. They'll be suspicious.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "space-stuff-7",
          "q": "How much time is in a light year?",
          "a": "None. It's a distance.",
          "note": "\"One year\" is wrong.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "space-stuff-8",
          "q": "What is the biggest rock on Earth?",
          "a": "Earth.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "space-stuff-9",
          "q": "What is this?",
          "a": "The Saha equation.",
          "note": "Needs a picture: the Saha equation. Add it with Edit, then Picture.",
          "src": "Noah",
          "use": true
        }
      ]
    },
    {
      "id": "quantum-physics",
      "name": "Quantum Physics",
      "onBoard": true,
      "questions": [
        {
          "id": "quantum-physics-1",
          "q": "Name a big number.",
          "a": "Any number greater than one trillion.",
          "note": "Anything smaller is not big. Do not explain this rule beforehand.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "quantum-physics-2",
          "q": "John has 10 candles. Each candle burns for 10 minutes. John lights all of them at once. How long do the candles burn for?",
          "a": "100 minutes.",
          "note": "Candle-minutes stack, like YouTube watch time. Do NOT back down. 10 minutes is wrong.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "quantum-physics-3",
          "q": "What rough estimate is commonly used for the speed of light?",
          "a": "C.",
          "note": "Any actual number is wrong. \"Fast\" is wrong.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "quantum-physics-4",
          "q": "How long does it take light to travel one light year?",
          "a": "One year.",
          "note": "It's in the name.",
          "reward": "Reward: a Point Shield. Blocks your next loss of points.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "quantum-physics-5",
          "q": "You're in a car going 50 mph. Another car passes going 50 mph the opposite way. How fast does that car appear to be moving?",
          "a": "Pretty fast.",
          "note": "100 mph is wrong. 161 km/h is also wrong.",
          "src": "Noah (changed)",
          "use": true
        },
        {
          "id": "quantum-physics-6",
          "q": "A bullet travels at half the speed of light. A laser pointer is fired the opposite direction. How fast do you observe the laser's light moving?",
          "a": "C. The speed of light.",
          "note": "Actually real. \"You see.\"",
          "src": "Noah",
          "use": true
        },
        {
          "id": "quantum-physics-7",
          "q": "What are the first six digits of pi?",
          "a": "3.14159",
          "note": "Someone will say 3.14159265. That's more than six. Wrong.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "quantum-physics-8",
          "q": "Why is a circle 360 degrees?",
          "a": "Because it's really hot.",
          "note": "The real-ish answer is the Babylonians and ~360 days in a year. \"Really hot\" is funnier, so that's correct.",
          "src": "Noah (changed)",
          "use": true
        },
        {
          "id": "quantum-physics-9",
          "q": "How many holes are in a polo shirt?",
          "a": "4.",
          "note": "Neck, two arms, bottom. Changed from Noah's \"how many holes in the word Polo\".",
          "src": "Noah (changed)",
          "use": true
        }
      ]
    },
    {
      "id": "mythical-creatures",
      "name": "Mythical Creatures",
      "onBoard": true,
      "questions": [
        {
          "id": "mythical-creatures-1",
          "q": "This creature is known for flying.",
          "a": "A fly.",
          "note": "Bird, dragon, fairy: all wrong.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "mythical-creatures-2",
          "q": "This four-legged creature is known for the horn on its head.",
          "a": "A rhinoceros.",
          "note": "Unicorn is wrong. Narwhal is wrong and has no legs.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "mythical-creatures-3",
          "q": "This large, ferocious creature has many dragon-like qualities.",
          "a": "A dragon.",
          "note": "It's actually a dragon. They will not say dragon because they've learned. Enjoy.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "mythical-creatures-4",
          "q": "Name a five-headed dragon from Yu-Gi-Oh.",
          "a": "Five-Headed Dragon.",
          "note": "That is its actual name. Any other dragon is wrong.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "mythical-creatures-5",
          "q": "This mythological creature has scales, and a lizard-like appearance",
          "a": "A Hydra.",
          "note": "Real. They'll say dragon.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "mythical-creatures-6",
          "q": "This tabletop role-playing game has players act out fantasy characters and roll dice.",
          "a": "Monopoly",
          "note": "Dungeons & Dragons is wrong.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "mythical-creatures-7",
          "q": "How many hammers are there in Warhammer 40K?",
          "a": "40,000.",
          "note": "The key is to not think like a smart person.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "mythical-creatures-8",
          "q": "A healer, a wizard and a tank walk into a bar. What's wrong with this statement?",
          "a": "The tank should have gone in first.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "mythical-creatures-9",
          "q": "What is this?",
          "a": "A bird.",
          "note": "Needs a picture of a bird. Add it with Edit, then Picture. The joke is that it's just a bird.",
          "src": "Noah",
          "use": true
        }
      ]
    },
    {
      "id": "riddles-mind-games",
      "name": "Riddles & Mind Games",
      "onBoard": true,
      "questions": [
        {
          "id": "riddles-mind-games-1",
          "q": "What was the answer to the very first question of tonight's game?",
          "a": "(Shown automatically below.)",
          "note": "Nobody will remember. You barely remember.",
          "kind": "callback",
          "src": "Noah (changed)",
          "use": true
        },
        {
          "id": "riddles-mind-games-2",
          "q": "What is the least common answer to \"pick a random number from 1 to 10\"?",
          "a": "u cant bc its the least common",
          "note": "Who would ever pick that number? Exactly.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "riddles-mind-games-3",
          "q": "True or false: this statement is false.",
          "a": "Yes.",
          "src": "Classic",
          "use": true
        },
        {
          "id": "riddles-mind-games-4",
          "q": "Rate the host's intelligence from 1 to 10.",
          "a": "Higher.",
          "note": "Whatever they say, it's higher. If they say 10, it's 11.",
          "src": "Ours",
          "use": true
        },
        {
          "id": "riddles-mind-games-5",
          "q": "How many animals of each kind did Moses take on the ark?",
          "a": "Zero. It was Noah.",
          "note": "Two is wrong. Fitting, given who we stole this game from.",
          "src": "Classic",
          "use": true
        },
        {
          "id": "riddles-mind-games-6",
          "q": "A plane crashes exactly on the border of the US and Canada. Where do they bury the survivors?",
          "a": "You don't bury survivors.",
          "src": "Classic",
          "use": true
        },
        {
          "id": "riddles-mind-games-7",
          "q": "Before Mount Everest was discovered, what was the tallest mountain in the world?",
          "a": "Mount Everest.",
          "note": "It was still there. Nobody had measured it yet.",
          "src": "Classic",
          "use": true
        },
        {
          "id": "riddles-mind-games-8",
          "q": "What has a head and a tail, but no body?",
          "a": "A coin. Now flip it: heads or tails?",
          "kind": "coin",
          "note": "After they answer, if they call the coin correct then they get the points if not then minus that points",
          "src": "Classic",
          "use": true
        },
        {
          "id": "riddles-mind-games-9",
          "q": "A farmer has 17 sheep. All but 9 die. How many are left?",
          "a": "9.",
          "src": "Classic",
          "use": true
        }
      ]
    },
    {
      "id": "gambling",
      "name": "Gambling",
      "onBoard": true,
      "questions": [
        {
          "id": "gambling-1",
          "q": "GAMBLE\nAny team may bet any amount. Heads or tails?",
          "a": "Flip the coin.",
          "note": "Bets are all-or-nothing. Negative bets are allowed, which makes no sense. Good.",
          "kind": "coin",
          "src": "Noah",
          "use": true
        },
        {
          "id": "gambling-2",
          "q": "Pick a Team to win",
          "a": "-300",
          "note": "that team loses 300",
          "kind": "chaos",
          "src": "Noah",
          "use": true
        },
        {
          "id": "gambling-3",
          "q": "What is 100 minus 200?",
          "a": "-100.",
          "reward": "Reward: gain -100 points.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "gambling-4",
          "kind": "chaos",
          "q": "The team to your left wins.",
          "a": "The team to their left gets the points.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "gambling-5",
          "kind": "chaos",
          "q": "Whoever is losing wins.",
          "a": "The last-place team gets the points.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "gambling-6",
          "kind": "chaos",
          "q": "AUTOMATIC LOSS",
          "a": "They lose the points.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "gambling-7",
          "kind": "chaos",
          "q": "Manual WIN",
          "a": "They win the points.",
          "note": "Noah's Gambling had 8 of these.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "gambling-8",
          "q": "How much was one dollar worth in 1976?",
          "a": "One dollar.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "gambling-9",
          "kind": "chaos",
          "q": "SWAP\nTrade scores with any team you want.",
          "a": "They pick a team and swap scores.",
          "note": "Watch the leading team get picked every time.",
          "src": "Ours",
          "use": true
        }
      ]
    },
    {
      "id": "science-real",
      "name": "Science (Real)",
      "onBoard": false,
      "questions": [
        {
          "id": "science-real-1",
          "q": "Which is heavier: a kilogram of steel or a kilogram of feathers?",
          "a": "The steel.",
          "note": "Because steel is heavier than feathers. Do NOT accept \"they're the same\". Hold this position under any amount of pressure.",
          "src": "Classic",
          "use": true
        },
        {
          "id": "science-real-2",
          "q": "How many sides does a circle have?",
          "a": "2. Inside and outside.",
          "note": "Zero, one, and infinity are all wrong.",
          "src": "Classic",
          "use": true
        },
        {
          "id": "science-real-3",
          "q": "Which came first: the chicken or the egg?",
          "a": "The egg.",
          "note": "Dinosaurs laid eggs long before chickens existed. This one's legit.",
          "src": "Classic",
          "use": true
        },
        {
          "id": "science-real-4",
          "q": "What is the most common element in the universe?",
          "a": "Hydrogen.",
          "note": "A completely real question. The panic is the point.",
          "src": "Ours",
          "use": true
        },
        {
          "id": "science-real-5",
          "q": "In a room of 23 people, what are the odds that two of them share a birthday?",
          "a": "About 50%.",
          "note": "Real. The birthday paradox. Accept 45-55%.",
          "src": "Classic",
          "use": true
        },
        {
          "id": "science-real-6",
          "q": "Powerhouse.",
          "a": "The mitochondria.",
          "note": "That's the whole question. Don't add anything.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "science-real-7",
          "q": "While some people are born without this, those born with it usually cut it for hygiene reasons.",
          "a": "Fingernails.",
          "note": "It is not what they're thinking. Watch them say it anyway.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "science-real-8",
          "q": "What animal can hold its breath underwater the longest?",
          "a": "A fish.",
          "note": "It never has to come up. Whale is wrong.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "science-real-9",
          "q": "What does the fox say?",
          "a": "It screams. Look it up.",
          "note": "Accept any impression committed to fully.",
          "src": "Classic",
          "use": true
        }
      ]
    },
    {
      "id": "nerd-stuff",
      "name": "Nerd Stuff",
      "onBoard": false,
      "questions": [
        {
          "id": "nerd-stuff-1",
          "q": "This plumber is known for going on adventures to save the princess and jumping through the Mushroom Kingdom.",
          "a": "Luigi.",
          "note": "Mario is wrong. Duh.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "nerd-stuff-2",
          "q": "In this game, the player is a yellow circle with a mouth that eats white pellets and is chased by ghosts.",
          "a": "Ms. Pac-Man.",
          "note": "Pac-Man is wrong.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "nerd-stuff-3",
          "q": "How do I get an extra life?",
          "a": "Up Up Down Down Left Right Left Right",
          "note": "Must say BOTH ups. If they say one up, it's wrong. Check the recording.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "nerd-stuff-4",
          "q": "x = 23\nx = x + 7\nWhat is the value of x?",
          "a": "30.",
          "note": "This one's real. People will argue that it makes no sense. It does, in code.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "nerd-stuff-5",
          "q": "Are computers good at swimming?",
          "a": "No.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "nerd-stuff-6",
          "q": "What will this line of code do?\n// this function doesn't work, it needs to be fixed",
          "a": "Nothing. It's a comment.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "nerd-stuff-7",
          "q": "How do I fix my computer?",
          "a": "Turn it off and on again.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "nerd-stuff-8",
          "q": "Beyblade, Beyblade, let it...",
          "a": "RIP!",
          "src": "Noah",
          "use": true
        },
        {
          "id": "nerd-stuff-9",
          "q": "Unscramble these letters:\nLOGARITHM",
          "a": "ALGORITHM.",
          "note": "\"Logarithm\" is not unscrambled. It's a perfect anagram, which is hilarious.",
          "src": "Noah",
          "use": true
        }
      ]
    },
    {
      "id": "back-to-school",
      "name": "Back To School",
      "onBoard": false,
      "questions": [
        {
          "id": "back-to-school-1",
          "q": "How many letters are in the alphabet?",
          "a": "11.",
          "note": "T-H-E A-L-P-H-A-B-E-T. 26 is wrong.",
          "src": "Classic",
          "use": true
        },
        {
          "id": "back-to-school-2",
          "q": "What is the only word in English that is always pronounced wrong?",
          "a": "\"Wrong.\"",
          "src": "Classic",
          "use": true
        },
        {
          "id": "back-to-school-3",
          "q": "What word is spelled incorrectly in every single dictionary?",
          "a": "\"Incorrectly.\"",
          "src": "Classic",
          "use": true
        },
        {
          "id": "back-to-school-4",
          "q": "What is TACO CAT backwards?",
          "a": "Cat taco.",
          "note": "\"Taco cat\" is wrong.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "back-to-school-5",
          "q": "What five-letter word becomes shorter when you add two letters to it?",
          "a": "\"Short.\" (Shorter.)",
          "src": "Classic",
          "use": true
        },
        {
          "id": "back-to-school-6",
          "q": "Who was the first president of the United States?",
          "a": "George Washington.",
          "note": "Real. Watch them second-guess it.",
          "src": "Ours",
          "use": true
        },
        {
          "id": "back-to-school-7",
          "q": "How long did the Hundred Years' War last?",
          "a": "116 years.",
          "note": "Real. 100 is wrong.",
          "src": "Classic",
          "use": true
        },
        {
          "id": "back-to-school-8",
          "q": "Name someone who signed the Declaration of Independence.",
          "a": "Nicolas Cage.",
          "note": "Thomas Jefferson is wrong. Cage stole it in National Treasure.",
          "src": "Noah (changed)",
          "use": true
        },
        {
          "id": "back-to-school-9",
          "q": "In what year did the year 2000 happen?",
          "a": "2000.",
          "src": "Ours",
          "use": true
        }
      ]
    },
    {
      "id": "minigames",
      "name": "Minigames",
      "onBoard": false,
      "questions": [
        {
          "id": "minigames-1",
          "q": "Play the host in tic-tac-toe.",
          "a": "Play it on paper or a whiteboard.",
          "reward": "Reward: nothing.",
          "kind": "minigame",
          "src": "Noah",
          "use": true
        },
        {
          "id": "minigames-2",
          "q": "First player to touch something blue wins.",
          "a": "Host judges what counts as blue.",
          "note": "The TV screen is blue. That counts. Don't tell them.",
          "kind": "minigame",
          "src": "Ours",
          "use": true
        },
        {
          "id": "minigames-3",
          "q": "Play the host in chess. You have 10 seconds.",
          "a": "Nobody wins in 10 seconds.",
          "note": "Reward nobody. Or give it to whoever complains the least.",
          "kind": "minigame",
          "src": "Noah (changed)",
          "use": true
        },
        {
          "id": "minigames-4",
          "q": "Beat the host in rock paper scissors.\n(The host goes second.)",
          "a": "The host wins.",
          "kind": "minigame",
          "src": "Ours",
          "use": true
        },
        {
          "id": "minigames-5",
          "q": "Staring contest with the host.",
          "a": "Host decides who blinked.",
          "kind": "minigame",
          "src": "Ours",
          "use": true
        },
        {
          "id": "minigames-6",
          "q": "Black to move.",
          "a": "Whatever the puzzle's answer is.",
          "note": "Needs a picture: a chess puzzle. Add it with Edit, then Picture.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "minigames-7",
          "q": "Play the host in Connect Four.",
          "a": "Host plays for real.",
          "kind": "minigame",
          "src": "Noah",
          "use": true
        },
        {
          "id": "minigames-8",
          "q": "Play the host in rock paper scissors.",
          "a": "Host plays for real.",
          "kind": "minigame",
          "src": "Noah",
          "use": true
        },
        {
          "id": "minigames-9",
          "kind": "minigame",
          "q": "Hum a song. First team to name it wins.",
          "a": "Host picks the song and hums it.",
          "note": "Hum badly on purpose.",
          "src": "Ours",
          "use": true
        }
      ]
    }
  ],
  "finals": [
    {
      "q": "Heads or tails?",
      "a": "Flip the coin.",
      "note": "Everyone bets first, THEN you reveal the question. Write answers down secretly.",
      "kind": "coin",
      "category": "The Western Roman Empire",
      "id": "final-1"
    },
    {
      "q": "Final question.",
      "a": "AUTOMATIC LOSS. Everyone loses what they bet.",
      "note": "Get bets first. Someone will bet a negative number. Let them.",
      "kind": "chaos",
      "category": "Everything",
      "id": "final-2"
    },
    {
      "q": "What was the answer to the very first question of tonight's game?",
      "a": "(Shown automatically.)",
      "note": "Bets first. This is a callback. If the Mind Games one was already played, this is double evil.",
      "kind": "callback",
      "category": "Tonight's Game",
      "id": "final-3"
    },
    {
      "category": "Food",
      "q": "Is a hot dog a sandwich?",
      "a": "Whatever the most confident team said is wrong.",
      "note": "Let them argue for a full minute before revealing.",
      "src": "Ours",
      "id": "final-4"
    }
  ],
  "finalId": "final-1"
};
