// The built-in question bank. The editor (editor.html) starts from this and
// saves your changes in the browser. To make edits permanent for everyone,
// send Claude a "Send to phone" link or a backup file.
window.DEFAULT_LIBRARY = {
  "title": "Brain Damage Jeopardy",
  "rows": 6,
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
          "q": "How big is space?\nA) Big\nB) Pretty big\nC) Super crazy very big\nD) Unbelievably crazy impossibly big",
          "a": "B) Pretty big.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "space-stuff-6",
          "q": "This object in our solar system is roughly one million times bigger than Earth.",
          "a": "The Sun.",
          "note": "Real. By volume it's about 1.3 million. Close enough.",
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
          "q": "How many holes are in a polo shirt?",
          "a": "4.",
          "note": "Neck, two arms, bottom. Changed from Noah's \"how many holes in the word Polo\".",
          "src": "Noah (changed)",
          "use": false
        }
      ]
    },
    {
      "id": "shrek-2",
      "name": "Shrek 2",
      "onBoard": true,
      "questions": [
        {
          "id": "shrek-2-1",
          "q": "This movie is a sequel to Shrek.",
          "a": "Shrek 3.",
          "note": "\"Shrek 2\" is wrong. It's a sequel to Shrek... 2.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "shrek-2-2",
          "q": "Is grapefruit a fruit?",
          "a": "No.",
          "note": "According to this game show. Is the game show based on reality? No.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "shrek-2-3",
          "q": "Who is the main character in the first Donkey Kong?",
          "a": "Donkey Kong.",
          "note": "It's in the name. Mario is technically right and therefore WRONG.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "shrek-2-4",
          "q": "Why are all of the outer planets gas giants and all of the inner planets rocky?",
          "a": "Near the Sun it was too hot for gases to condense onto the planets.",
          "note": "It's a real answer. Whoever gets it right still gets the reward.",
          "reward": "Reward: every team that answered loses 500 points. You're welcome for the fun fact.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "shrek-2-5",
          "q": "Rock, paper or scissors?",
          "a": "Everyone writes one down. Host picks theirs AFTER seeing the answers.",
          "note": "You go last. Obviously.",
          "kind": "minigame",
          "src": "Noah",
          "use": true
        },
        {
          "id": "shrek-2-6",
          "q": "This is the main character of a movie about a boy who makes and sells pots while living with his abusive aunt and uncle.",
          "a": "Harry Potter.",
          "src": "Noah",
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
          "q": "AUTOMATIC WIN",
          "a": "They win 100.",
          "kind": "chaos",
          "src": "Noah",
          "use": true
        },
        {
          "id": "gambling-2",
          "q": "AUTOMATIC WIN",
          "a": "They win 200.",
          "note": "Let them get comfortable.",
          "kind": "chaos",
          "src": "Noah",
          "use": true
        },
        {
          "id": "gambling-3",
          "q": "AUTOMATIC WIN",
          "a": "They win 300.",
          "note": "Now everyone wants Gambling.",
          "kind": "chaos",
          "src": "Noah",
          "use": true
        },
        {
          "id": "gambling-4",
          "q": "AUTOMATIC LOSS",
          "a": "They lose 400.",
          "kind": "chaos",
          "src": "Noah",
          "use": true
        },
        {
          "id": "gambling-5",
          "q": "AUTOMATIC LOSS",
          "a": "They lose 500.",
          "note": "\"I still think the last one is a win.\" It is not.",
          "kind": "chaos",
          "src": "Noah",
          "use": true
        },
        {
          "id": "gambling-6",
          "q": "GAMBLE\nAny team may bet any amount. Heads or tails?",
          "a": "Flip the coin.",
          "note": "Bets are all-or-nothing. Negative bets are allowed, which makes no sense. Good.",
          "kind": "coin",
          "src": "Noah",
          "use": true
        },
        {
          "id": "gambling-7",
          "q": "Heads or tails?",
          "a": "Flip the coin.",
          "reward": "Correct: +200. Wrong: nothing.",
          "kind": "coin",
          "src": "Noah",
          "use": false
        }
      ]
    },
    {
      "id": "mind-games",
      "name": "Mind Games",
      "onBoard": true,
      "questions": [
        {
          "id": "mind-games-1",
          "q": "Do not say ding.",
          "a": "(Anyone who dinged loses.)",
          "note": "Read it slowly. Someone WILL ding.",
          "reward": "Everyone who said ding loses 100 points.",
          "src": "Ours",
          "use": true
        },
        {
          "id": "mind-games-2",
          "q": "What was the answer to the very first question of tonight's game?",
          "a": "(Shown automatically below.)",
          "note": "Nobody will remember. You barely remember.",
          "kind": "callback",
          "src": "Noah (changed)",
          "use": true
        },
        {
          "id": "mind-games-3",
          "q": "What is the least common answer to \"pick a random number from 1 to 10\"?",
          "a": "u cant bc its the least common",
          "note": "Who would ever pick that number? Exactly.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "mind-games-4",
          "q": "Everyone close your eyes. What color is the host's shirt?",
          "a": "Whatever color it is. Check.",
          "note": "Actually make them close their eyes first. Put a jacket on if you're feeling evil.",
          "src": "Ours",
          "use": true
        },
        {
          "id": "mind-games-5",
          "q": "What should this game show not do?",
          "a": "Drag on.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "mind-games-6",
          "q": "True or false: this statement is false.",
          "a": "Yes.",
          "src": "Classic",
          "use": true
        },
        {
          "id": "mind-games-7",
          "q": "Whenever A is true, B is always true. If A is false, what do we know about B?",
          "a": "Nothing.",
          "note": "Real logic.",
          "src": "Noah",
          "use": false
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
          "q": "How many astronomical units is the Earth from the Sun?",
          "a": "1.",
          "note": "Genuinely real. They'll be suspicious.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "science-real-7",
          "q": "Why is a circle 360 degrees?",
          "a": "Because it's really hot.",
          "note": "The real-ish answer is the Babylonians and ~360 days in a year. \"Really hot\" is funnier, so that's correct.",
          "src": "Noah (changed)",
          "use": false
        }
      ]
    },
    {
      "id": "mythical-creatures",
      "name": "Mythical Creatures",
      "onBoard": false,
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
          "q": "What is the correct answer to any question in D&D?",
          "a": "Fireball.",
          "src": "Noah",
          "use": false
        },
        {
          "id": "mythical-creatures-8",
          "q": "What did Hagrid name his dragon in Harry Potter?",
          "a": "Norbert.",
          "note": "Actually real.",
          "src": "Noah",
          "use": false
        }
      ]
    },
    {
      "id": "economics",
      "name": "Economics",
      "onBoard": false,
      "questions": [
        {
          "id": "economics-1",
          "q": "All teams win 100 points.",
          "a": "Everyone +100.",
          "note": "Net effect on the game: none. Point it out.",
          "kind": "chaos",
          "src": "Noah",
          "use": true
        },
        {
          "id": "economics-2",
          "q": "What is 100 minus 200?",
          "a": "-100.",
          "reward": "Reward: gain -100 points.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "economics-3",
          "q": "Choose a team to lose 300 points.",
          "a": "They pick.",
          "note": "Allow bribery. Encourage bribery.",
          "kind": "chaos",
          "src": "Noah",
          "use": true
        },
        {
          "id": "economics-4",
          "q": "FREE LOSS.",
          "a": "They lose 400.",
          "note": "Too bad. Should've been quicker.",
          "kind": "chaos",
          "src": "Noah",
          "use": true
        },
        {
          "id": "economics-5",
          "q": "Choose another team to win 500 points.",
          "a": "They pick.",
          "kind": "chaos",
          "src": "Noah",
          "use": true
        },
        {
          "id": "economics-6",
          "q": "Choose another team to win.",
          "a": "(They pick a team.)",
          "reward": "Reward: that team gains -100 points.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "economics-7",
          "q": "INVESTMENT OPPORTUNITY\nAny player may invest any amount of points now. Investments pay out at the end of the game.",
          "a": "(Take everyone's investments off their score now.)",
          "note": "At the end of the game, reveal that the market crashed and it's all gone.",
          "reward": "Update: the market crashed. Your investments are gone.",
          "kind": "chaos",
          "src": "Noah",
          "use": false
        }
      ]
    },
    {
      "id": "health",
      "name": "Health",
      "onBoard": false,
      "questions": [
        {
          "id": "health-1",
          "q": "Doctors recommend doing this every 3 seconds.",
          "a": "Breathing.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "health-2",
          "q": "What is the laziest organ in the human body?",
          "a": "The brain.",
          "note": "Also accept anyone pointing at another contestant.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "health-3",
          "q": "Bob is fighting three doctors. How many apples must he eat to keep them away for a day?",
          "a": "3.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "health-4",
          "q": "A person's head becomes detached from their body, but they don't die. Why?",
          "a": "They were already dead",
          "note": "Also accept \"they're a Lego\" if it made you laugh.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "health-5",
          "q": "Powerhouse.",
          "a": "The mitochondria.",
          "note": "That's the whole question. Don't add anything.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "health-6",
          "q": "Is water good at removing blood from a carpet?",
          "a": "No.",
          "note": "Follow up with: why do you know that?",
          "src": "Noah",
          "use": true
        },
        {
          "id": "health-7",
          "q": "What should you do when brought in for questioning about your involvement in a murder?",
          "a": "Say nothing and ask for a lawyer.",
          "src": "Noah",
          "use": false
        },
        {
          "id": "health-8",
          "q": "True or false, explain your answer: a human can survive without a stomach.",
          "a": "True.",
          "note": "Real. Surgeons can attach the esophagus to the small intestine.",
          "src": "Noah",
          "use": false
        },
        {
          "id": "health-9",
          "q": "Exercising this muscle can help strengthen the bicep.",
          "a": "The bicep.",
          "src": "Noah",
          "use": false
        }
      ]
    },
    {
      "id": "computer-science",
      "name": "Computer Science",
      "onBoard": false,
      "questions": [
        {
          "id": "computer-science-1",
          "q": "x = 23\nx = x + 7\nWhat is the value of x?",
          "a": "30.",
          "note": "This one's real. People will argue that it makes no sense. It does, in code.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "computer-science-2",
          "q": "Are computers good at swimming?",
          "a": "No.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "computer-science-3",
          "q": "What will this line of code do?\n// this function doesn't work, it needs to be fixed",
          "a": "Nothing. It's a comment.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "computer-science-4",
          "q": "How do I fix my computer?",
          "a": "Turn it off and on again.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "computer-science-5",
          "q": "What does CPU stand for?",
          "a": "Central Processing Unit.",
          "note": "Real. A breather.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "computer-science-6",
          "q": "Who invented the Turing machine?",
          "a": "Alan Turing.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "computer-science-7",
          "q": "During what decade was the first computer designed?",
          "a": "The 1820s.",
          "note": "Charles Babbage's Difference Engine, 1822. Real.",
          "src": "Noah",
          "use": false
        }
      ]
    },
    {
      "id": "video-games",
      "name": "Video Games",
      "onBoard": false,
      "questions": [
        {
          "id": "video-games-1",
          "q": "This plumber is known for going on adventures to save the princess and jumping through the Mushroom Kingdom.",
          "a": "Luigi.",
          "note": "Mario is wrong. Duh.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "video-games-2",
          "q": "In this game, the player is a yellow circle with a mouth that eats white pellets and is chased by ghosts.",
          "a": "Ms. Pac-Man.",
          "note": "Pac-Man is wrong.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "video-games-3",
          "q": "How do I get an extra life?",
          "a": "Up Up Down Down Left Right Left Right",
          "note": "Must say BOTH ups. If they say one up, it's wrong. Check the recording.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "video-games-4",
          "q": "How many hammers are there in Warhammer 40K?",
          "a": "40,000.",
          "note": "The key is to not think like a smart person.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "video-games-5",
          "q": "A healer, a wizard and a tank walk into a bar. What's wrong with this statement?",
          "a": "The tank should have gone in first.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "video-games-6",
          "q": "Unscramble these letters into a video game title:\nNET FOR IT",
          "a": "Fortnite.",
          "note": "A breather. Also sounds like a fishing simulator.",
          "src": "Noah",
          "use": true
        }
      ]
    },
    {
      "id": "english-class",
      "name": "English Class",
      "onBoard": false,
      "questions": [
        {
          "id": "english-class-1",
          "q": "How many letters are in the alphabet?",
          "a": "11.",
          "note": "T-H-E A-L-P-H-A-B-E-T. 26 is wrong.",
          "src": "Classic",
          "use": true
        },
        {
          "id": "english-class-2",
          "q": "What is the only word in English that is always pronounced wrong?",
          "a": "\"Wrong.\"",
          "src": "Classic",
          "use": true
        },
        {
          "id": "english-class-3",
          "q": "What word is spelled incorrectly in every single dictionary?",
          "a": "\"Incorrectly.\"",
          "src": "Classic",
          "use": true
        },
        {
          "id": "english-class-4",
          "q": "What is TACO CAT backwards?",
          "a": "Cat taco.",
          "note": "\"Taco cat\" is wrong.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "english-class-5",
          "q": "Unscramble these letters:\nLOGARITHM",
          "a": "ALGORITHM.",
          "note": "\"Logarithm\" is not unscrambled. It's a perfect anagram, which is hilarious.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "english-class-6",
          "q": "What five-letter word becomes shorter when you add two letters to it?",
          "a": "\"Short.\" (Shorter.)",
          "src": "Classic",
          "use": true
        }
      ]
    },
    {
      "id": "the-host",
      "name": "The Host",
      "onBoard": false,
      "questions": [
        {
          "id": "the-host-1",
          "q": "Who is the host's favorite team?",
          "a": "Whoever didn't answer.",
          "src": "Ours",
          "use": true
        },
        {
          "id": "the-host-2",
          "q": "This person is slightly above average at Magic: The Gathering.",
          "a": "The host.",
          "src": "Noah (changed)",
          "use": true
        },
        {
          "id": "the-host-3",
          "q": "Rate the host's intelligence from 1 to 10.",
          "a": "Higher.",
          "note": "Whatever they say, it's higher. If they say 10, it's 11.",
          "src": "Ours",
          "use": true
        },
        {
          "id": "the-host-4",
          "q": "What is the host's favorite ice cream?",
          "a": "Whatever they didn't say.",
          "note": "If someone gets it right, it changed this morning.",
          "src": "Noah (changed)",
          "use": true
        },
        {
          "id": "the-host-5",
          "q": "What is the host's star sign?",
          "a": "Not that one.",
          "note": "Whatever they guess, you lied. You're actually something else.",
          "src": "Noah (changed)",
          "use": true
        },
        {
          "id": "the-host-6",
          "q": "What number is the host thinking of?",
          "a": "Not that one.",
          "note": "Whatever they say, it was one higher.",
          "src": "Ours",
          "use": true
        }
      ]
    },
    {
      "id": "riddles-for-babies",
      "name": "Riddles For Babies",
      "onBoard": false,
      "questions": [
        {
          "id": "riddles-for-babies-1",
          "q": "How many months have 28 days?",
          "a": "All 12.",
          "src": "Classic",
          "use": true
        },
        {
          "id": "riddles-for-babies-2",
          "q": "You're in a race and you pass the person in second place. What place are you in?",
          "a": "Second.",
          "note": "First is wrong.",
          "src": "Classic",
          "use": true
        },
        {
          "id": "riddles-for-babies-3",
          "q": "How many animals of each kind did Moses take on the ark?",
          "a": "Zero. It was Noah.",
          "note": "Two is wrong. Fitting, given who we stole this game from.",
          "src": "Classic",
          "use": true
        },
        {
          "id": "riddles-for-babies-4",
          "q": "A plane crashes exactly on the border of the US and Canada. Where do they bury the survivors?",
          "a": "You don't bury survivors.",
          "src": "Classic",
          "use": true
        },
        {
          "id": "riddles-for-babies-5",
          "q": "Before Mount Everest was discovered, what was the tallest mountain in the world?",
          "a": "Mount Everest.",
          "note": "It was still there. Nobody had measured it yet.",
          "src": "Classic",
          "use": true
        },
        {
          "id": "riddles-for-babies-6",
          "q": "What has a head and a tail, but no body?",
          "a": "A coin. Now flip it: heads or tails?",
          "kind": "coin",
          "note": "After they answer, everyone calls heads or tails. Flip the coin. Correct call gets the points too.",
          "src": "Classic",
          "use": true
        },
        {
          "id": "riddles-for-babies-7",
          "q": "A father gives his first son a quarter and his second son a nickel. What time is it?",
          "a": "A quarter to five.",
          "note": "Also accept \"time to get a watch\" if it's funny.",
          "src": "Noah",
          "use": false
        }
      ]
    },
    {
      "id": "animals",
      "name": "Animals",
      "onBoard": false,
      "questions": [
        {
          "id": "animals-1",
          "q": "What animal can hold its breath underwater the longest?",
          "a": "A fish.",
          "note": "It never has to come up. Whale is wrong.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "animals-2",
          "q": "What do you call a fish with no eyes?",
          "a": "A fsh.",
          "src": "Classic",
          "use": true
        },
        {
          "id": "animals-3",
          "q": "What is a group of crows called?",
          "a": "A murder.",
          "note": "Real.",
          "src": "Ours",
          "use": true
        },
        {
          "id": "animals-4",
          "q": "What does the fox say?",
          "a": "It screams. Look it up.",
          "note": "Accept any impression committed to fully.",
          "src": "Classic",
          "use": true
        },
        {
          "id": "animals-5",
          "q": "A farmer has 17 sheep. All but 9 die. How many are left?",
          "a": "9.",
          "src": "Classic",
          "use": true
        },
        {
          "id": "animals-6",
          "q": "Where is a shrimp's heart?",
          "a": "In its head.",
          "note": "Real. They will think you made it up.",
          "src": "Ours",
          "use": true
        }
      ]
    },
    {
      "id": "history-trust-me",
      "name": "History (Trust Me)",
      "onBoard": false,
      "questions": [
        {
          "id": "history-trust-me-1",
          "q": "Who was the first president of the United States?",
          "a": "George Washington.",
          "note": "Real. Watch them second-guess it.",
          "src": "Ours",
          "use": true
        },
        {
          "id": "history-trust-me-2",
          "q": "How long did the Hundred Years' War last?",
          "a": "116 years.",
          "note": "Real. 100 is wrong.",
          "src": "Classic",
          "use": true
        },
        {
          "id": "history-trust-me-3",
          "q": "Name someone who signed the Declaration of Independence.",
          "a": "Nicolas Cage.",
          "note": "Thomas Jefferson is wrong. Cage stole it in National Treasure.",
          "src": "Noah (changed)",
          "use": true
        },
        {
          "id": "history-trust-me-4",
          "q": "In what year did the year 2000 happen?",
          "a": "2000.",
          "src": "Ours",
          "use": true
        },
        {
          "id": "history-trust-me-5",
          "q": "How much was one dollar worth in 1976?",
          "a": "One dollar.",
          "src": "Noah",
          "use": true
        },
        {
          "id": "history-trust-me-6",
          "q": "Who lived closer in time to the Moon landing: Cleopatra, or the people who built the Great Pyramid?",
          "a": "Cleopatra.",
          "note": "Real. The pyramid was already ancient to her.",
          "src": "Classic",
          "use": true
        },
        {
          "id": "history-trust-me-7",
          "q": "Name any person other than Archduke Franz Ferdinand who died on June 28, 1914.",
          "a": "His wife, Sophie.",
          "note": "They were shot together.",
          "src": "Noah",
          "use": false
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
          "q": "Thumb war: pick one player from each team.",
          "a": "Winner gets the points.",
          "reward": "The loser also loses 200 points.",
          "kind": "minigame",
          "src": "Ours",
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
          "q": "Play the host in tic-tac-toe.",
          "a": "Play it on paper or a whiteboard.",
          "reward": "Reward: nothing.",
          "kind": "minigame",
          "src": "Noah",
          "use": true
        },
        {
          "id": "minigames-7",
          "q": "Play the host in Connect Four.",
          "a": "Host plays for real.",
          "kind": "minigame",
          "src": "Noah",
          "use": false
        },
        {
          "id": "minigames-8",
          "q": "Play the host in rock paper scissors.",
          "a": "Host plays for real.",
          "kind": "minigame",
          "src": "Noah",
          "use": false
        }
      ]
    },
    {
      "id": "from-noahs-videos",
      "name": "From Noah's Videos (Sort Me)",
      "onBoard": false,
      "questions": [
        {
          "id": "noah-video-1",
          "q": "This attraction in the US is very popular because there's nothing there.",
          "a": "The Grand Canyon.",
          "reward": "Reward: pick a team to lose 200 points.",
          "src": "Noah",
          "use": false
        },
        {
          "id": "noah-video-2",
          "q": "I couldn't think of a question for this one.",
          "a": "(Whoever dings first.)",
          "reward": "Reward: nothing.",
          "src": "Noah",
          "use": false
        },
        {
          "id": "noah-video-3",
          "kind": "chaos",
          "q": "The team to your left wins.",
          "a": "The team to their left gets the points.",
          "src": "Noah",
          "use": false
        },
        {
          "id": "noah-video-4",
          "q": "Which of these is a D&D character the host has played?\nA) The Rat King\nB) The Soup God\nC) Zelor, Destroyer of Worlds and Slayer of Puppies\nD) A literal bear",
          "a": "A) The Rat King.",
          "note": "Change these to your own characters, or just keep A.",
          "src": "Noah",
          "use": false
        },
        {
          "id": "noah-video-5",
          "q": "What are the first six digits of pi?",
          "a": "3.14159",
          "note": "Someone will say 3.14159265. That's more than six. Wrong.",
          "src": "Noah",
          "use": false
        },
        {
          "id": "noah-video-6",
          "q": "This country looks like the side view of a person with curly hair, an open mouth and a crooked nose.",
          "a": "Germany.",
          "note": "Every country looks like that if you try hard enough.",
          "src": "Noah",
          "use": false
        },
        {
          "id": "noah-video-7",
          "q": "How much time is in a light year?",
          "a": "None. It's a distance.",
          "note": "\"One year\" is wrong.",
          "src": "Noah",
          "use": false
        },
        {
          "id": "noah-video-8",
          "q": "What is wrong with this sentence?\n\"After finishing his work on the computer the host decided to take a break and go for a walk.\"",
          "a": "It needs a comma after \"computer\".",
          "note": "\"The host doesn't go outside\" is also correct, emotionally.",
          "src": "Noah",
          "use": false
        },
        {
          "id": "noah-video-9",
          "q": "If Mount Everest were as many millimeters tall as your credit card number (with the expiry date and security code), how tall would it be?",
          "a": "Any list of numbers.",
          "note": "Do not let anyone actually read out their card.",
          "src": "Noah",
          "use": false
        },
        {
          "id": "noah-video-10",
          "kind": "chaos",
          "q": "Whoever is winning wins.",
          "a": "The leading team gets the points.",
          "src": "Noah",
          "use": false
        },
        {
          "id": "noah-video-11",
          "kind": "chaos",
          "q": "Whoever is losing wins.",
          "a": "The last-place team gets the points.",
          "src": "Noah",
          "use": false
        },
        {
          "id": "noah-video-12",
          "q": "What acts as the speed limit of the universe?",
          "a": "Light speed.",
          "reward": "Reward: pick a team to lose 100 points every turn until they get a question right.",
          "src": "Noah",
          "use": false
        },
        {
          "id": "noah-video-13",
          "kind": "coin",
          "q": "Heads or tails?",
          "a": "Flip the coin.",
          "reward": "Reward: -400 for the right answer.",
          "src": "Noah",
          "use": false
        },
        {
          "id": "noah-video-14",
          "q": "How many protons are in carbon?",
          "a": "6.",
          "note": "Real.",
          "src": "Noah",
          "use": false
        },
        {
          "id": "noah-video-15",
          "q": "What is the biggest rock on Earth?",
          "a": "Earth.",
          "src": "Noah",
          "use": false
        },
        {
          "id": "noah-video-16",
          "kind": "chaos",
          "q": "SACRIFICE\nAny team may sacrifice any number of points to make another team lose that many.",
          "a": "Take their points and the other team's.",
          "reward": "Everyone who sacrificed gains 400.",
          "src": "Noah",
          "use": false
        },
        {
          "id": "noah-video-17",
          "q": "A question.",
          "a": "Fireball.",
          "note": "\"An answer\" is wrong.",
          "src": "Noah",
          "use": false
        },
        {
          "id": "noah-video-18",
          "q": "What is the 19th letter of the alphabet?",
          "a": "S.",
          "note": "Real.",
          "src": "Noah",
          "use": false
        },
        {
          "id": "noah-video-19",
          "kind": "chaos",
          "q": "Every team votes for a winner. You can't vote for yourself.",
          "a": "Most votes wins.",
          "reward": "The winner gains -500 points.",
          "src": "Noah",
          "use": false
        },
        {
          "id": "noah-video-20",
          "kind": "chaos",
          "q": "AUTOMATIC LOSS",
          "a": "They lose the points.",
          "src": "Noah",
          "use": false
        },
        {
          "id": "noah-video-21",
          "q": "What is this?\n(Show the Saha equation.)",
          "a": "The Saha equation.",
          "note": "Needs a picture, and the site can't show pictures yet. Hold up your phone, or skip it.",
          "src": "Noah",
          "use": false
        },
        {
          "id": "noah-video-22",
          "q": "Find the length of C.\n(Show a right triangle.)",
          "a": "Whatever the picture says.",
          "note": "Needs a picture, and the site can't show pictures yet. Hold up your phone, or skip it.",
          "src": "Noah",
          "use": false
        },
        {
          "id": "noah-video-23",
          "q": "Name the country.\n(Show a map of North Korea.)",
          "a": "North Korea.",
          "note": "Needs a picture, and the site can't show pictures yet. Hold up your phone, or skip it.",
          "src": "Noah",
          "use": false
        },
        {
          "id": "noah-video-24",
          "q": "True or false, explain your answer: there's a hole in your heart you couldn't live without.",
          "a": "True.",
          "note": "Blood vessels. Accept any explanation that sounds confident.",
          "src": "Noah",
          "use": false
        },
        {
          "id": "noah-video-25",
          "q": "How many holes are in the word \"Polo\"?",
          "a": "4.",
          "note": "Noah's original version of the polo shirt one. Just say 4 with confidence.",
          "src": "Noah",
          "use": false
        },
        {
          "id": "noah-video-26",
          "q": "This country's leader is famous for having the smallest... hands.",
          "a": "Russia.",
          "note": "Noah's version was ruder. Adjust to taste.",
          "src": "Noah",
          "use": false
        },
        {
          "id": "noah-video-27",
          "q": "Roll a D20. What will it land on?",
          "a": "Whatever they didn't say.",
          "note": "Actually roll one if you have it.",
          "src": "Noah",
          "use": false
        },
        {
          "id": "noah-video-28",
          "q": "What is this?\n(Show a picture of a bird.)",
          "a": "A bird.",
          "note": "Needs a picture, and the site can't show pictures yet. Hold up your phone, or skip it. The joke is it's just a bird.",
          "src": "Noah",
          "use": false
        },
        {
          "id": "noah-video-29",
          "q": "What's your favorite Pokémon?",
          "a": "Dragonite.",
          "note": "Accept anything. Or don't.",
          "src": "Noah",
          "use": false
        },
        {
          "id": "noah-video-30",
          "q": "While some people are born without this, those born with it usually cut it for hygiene reasons.",
          "a": "Fingernails.",
          "note": "It is not what they're thinking. Watch them say it anyway.",
          "src": "Noah",
          "use": false
        },
        {
          "id": "noah-video-31",
          "q": "This red liquid is located inside your body.",
          "a": "Blood.",
          "src": "Noah",
          "use": false
        },
        {
          "id": "noah-video-32",
          "q": "True or false, explain your answer: there are four states of matter, and your body has plasma in it.",
          "a": "True. There's plasma in your blood.",
          "src": "Noah",
          "use": false
        },
        {
          "id": "noah-video-33",
          "q": "Why don't protons in an atom push each other away?",
          "a": "The strong nuclear force beats the electromagnetic force at close range.",
          "note": "Real. Nobody will get it.",
          "src": "Noah",
          "use": false
        },
        {
          "id": "noah-video-34",
          "q": "Do you think I have schizophrenia?",
          "a": "I wasn't talking to you.",
          "reward": "Everyone who answered loses points.",
          "src": "Noah",
          "use": false
        },
        {
          "id": "noah-video-35",
          "q": "This MOBA is known for being an anti-antidepressant.",
          "a": "League of Legends.",
          "src": "Noah",
          "use": false
        },
        {
          "id": "noah-video-36",
          "q": "This person is not good at Magic: The Gathering.",
          "a": "The host.",
          "note": "Noah's answer was himself. Put in whoever deserves it.",
          "src": "Noah",
          "use": false
        },
        {
          "id": "noah-video-37",
          "q": "What is the host's favorite animated movie?",
          "a": "Not that one.",
          "note": "Noah's was Puss in Boots: The Last Wish. Pick yours.",
          "src": "Noah",
          "use": false
        },
        {
          "id": "noah-video-38",
          "q": "What does this say? You may use the internet.\n(Show unreadable handwriting.)",
          "a": "I don't know.",
          "note": "Needs a picture, and the site can't show pictures yet. Hold up your phone, or skip it.",
          "src": "Noah",
          "use": false
        },
        {
          "id": "noah-video-39",
          "q": "What are the three macronutrients?",
          "a": "Protein, carbohydrates and fat.",
          "note": "Real.",
          "src": "Noah",
          "use": false
        },
        {
          "id": "noah-video-40",
          "q": "Who is the main character in Super Mario Bros. 2?",
          "a": "Mario.",
          "note": "Real. They'll say Peach or Luigi.",
          "src": "Noah",
          "use": false
        },
        {
          "id": "noah-video-41",
          "q": "This company makes the Assassin's Creed games and puts all its effort into making the most mediocre AAA games possible.",
          "a": "Ubisoft.",
          "src": "Noah",
          "use": false
        },
        {
          "id": "noah-video-42",
          "q": "What is the host's favorite starter Pokémon from FireRed and LeafGreen?",
          "a": "Charmander.",
          "note": "Noah's answer. Change to yours.",
          "src": "Noah",
          "use": false
        },
        {
          "id": "noah-video-43",
          "kind": "chaos",
          "q": "AUTOMATIC WIN",
          "a": "They win the points.",
          "note": "Noah's Gambling had 8 of these.",
          "src": "Noah",
          "use": false
        },
        {
          "id": "noah-video-44",
          "kind": "minigame",
          "q": "Play the host in Connect Four.",
          "a": "Host plays for real.",
          "src": "Noah",
          "use": false
        },
        {
          "id": "noah-video-45",
          "q": "What is the host's favorite fantasy creature?",
          "a": "A dragon.",
          "note": "Noah's answer. Change to yours.",
          "src": "Noah",
          "use": false
        },
        {
          "id": "noah-video-46",
          "q": "How tall is Jace?",
          "a": "5'10\".",
          "note": "Magic: The Gathering lore.",
          "src": "Noah",
          "use": false
        },
        {
          "id": "noah-video-47",
          "q": "How much does Jace weigh, within five pounds?",
          "a": "165 lb.",
          "note": "Magic: The Gathering lore.",
          "src": "Noah",
          "use": false
        },
        {
          "id": "noah-video-48",
          "q": "What color is Jace?",
          "a": "White.",
          "note": "Everyone will say blue. It's white now.",
          "src": "Noah",
          "use": false
        },
        {
          "id": "noah-video-49",
          "q": "This Magic: The Gathering creature is capable of beating every Eldrazi in a fight.",
          "a": "Colossal Dreadmaw.",
          "src": "Noah",
          "use": false
        },
        {
          "id": "noah-video-50",
          "q": "This creature was printed in Rivals of Ixalan.",
          "a": "Colossal Dreadmaw.",
          "note": "It's always Colossal Dreadmaw.",
          "src": "Noah",
          "use": false
        },
        {
          "id": "noah-video-51",
          "q": "Which Magic: The Gathering YouTuber was quickest to reach 100K subscribers?",
          "a": "Magic the Noah.",
          "src": "Noah",
          "use": false
        },
        {
          "id": "noah-video-52",
          "q": "What is the most-viewed Magic: The Gathering video on YouTube?",
          "a": "The Ikoria: Lair of Behemoths trailer.",
          "note": "True when Noah made it. May have changed.",
          "src": "Noah",
          "use": false
        },
        {
          "id": "noah-video-53",
          "q": "What has been the most popular Magic commander in the past two years?",
          "a": "Atraxa, Praetors' Voice.",
          "note": "True when Noah made it. Googling allowed.",
          "src": "Noah",
          "use": false
        },
        {
          "id": "noah-video-54",
          "q": "This character's iconic design features two oversized metal gauntlets and pink hair.",
          "a": "Vi, from League of Legends.",
          "note": "Filed under Magic lore. It is not Magic lore.",
          "src": "Noah",
          "use": false
        },
        {
          "id": "noah-video-55",
          "q": "Beyblade, Beyblade, let it...",
          "a": "RIP!",
          "src": "Noah",
          "use": false
        },
        {
          "id": "noah-video-56",
          "q": "What's the play?\n(Show an Uno hand.)",
          "a": "Say \"Uno\".",
          "note": "Needs a picture, and the site can't show pictures yet. Hold up your phone, or skip it.",
          "src": "Noah",
          "use": false
        },
        {
          "id": "noah-video-57",
          "q": "Black to move.\n(Show a chess puzzle.)",
          "a": "Whatever the puzzle's answer is.",
          "note": "Needs a picture, and the site can't show pictures yet. Hold up your phone, or skip it.",
          "src": "Noah",
          "use": false
        },
        {
          "id": "noah-video-58",
          "q": "What is this creature?\n(Show a picture of a drake.)",
          "a": "A drake.",
          "note": "Needs a picture, and the site can't show pictures yet. Hold up your phone, or skip it. Dragons have arms. Drakes' arms are part of their wings.",
          "src": "Noah",
          "use": false
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
