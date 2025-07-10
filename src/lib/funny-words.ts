// Funny word generator for Reddit verification
const adjectives = [
  'Gigantic', 'Tiny', 'Sparkly', 'Bouncy', 'Fluffy', 'Wobbly', 'Sneaky', 'Dancing', 
  'Magical', 'Invisible', 'Flying', 'Singing', 'Laughing', 'Tickled', 'Dizzy', 'Wiggly',
  'Bubbly', 'Squishy', 'Jumpy', 'Silly', 'Goofy', 'Crazy', 'Fuzzy', 'Slippery',
  'Bumpy', 'Shiny', 'Glowing', 'Twinkling', 'Bouncing', 'Spinning', 'Floating', 'Zany',
  'Speedy', 'Lazy', 'Grumpy', 'Happy', 'Sleepy', 'Sneezy', 'Bashful', 'Dopey',
  'Mighty', 'Clever', 'Brave', 'Bold', 'Swift', 'Gentle', 'Fierce', 'Proud',
  'Elegant', 'Graceful', 'Nimble', 'Agile', 'Strong', 'Powerful', 'Majestic', 'Noble',
  'Playful', 'Mischievous', 'Curious', 'Adventurous', 'Mysterious', 'Enchanted', 'Charming', 'Delightful',
  'Radiant', 'Brilliant', 'Vibrant', 'Luminous', 'Dazzling', 'Gleaming', 'Shimmering', 'Glittering',
  'Colossal', 'Enormous', 'Massive', 'Gigantic', 'Miniature', 'Petite', 'Compact', 'Vast',
  'Mysterious', 'Enigmatic', 'Puzzling', 'Bewildering', 'Astonishing', 'Amazing', 'Incredible', 'Fantastic',
  'Legendary', 'Epic', 'Heroic', 'Legendary', 'Mythical', 'Fabulous', 'Spectacular', 'Extraordinary'
];

const nouns = [
  // Land Animals
  'Unicorn', 'Dragon', 'Llama', 'Elephant', 'Giraffe', 'Zebra', 'Lion', 'Tiger', 'Bear', 'Wolf',
  'Fox', 'Rabbit', 'Squirrel', 'Chipmunk', 'Raccoon', 'Hedgehog', 'Sloth', 'Panda', 'Koala', 'Kangaroo',
  'Hamster', 'Ferret', 'Monkey', 'Gorilla', 'Chimpanzee', 'Orangutan', 'Lemur', 'Meerkat', 'Wombat', 'Capybara',
  'Alpaca', 'Vicuna', 'Deer', 'Elk', 'Moose', 'Reindeer', 'Caribou', 'Antelope', 'Gazelle', 'Impala',
  'Rhino', 'Hippo', 'Cheetah', 'Leopard', 'Jaguar', 'Lynx', 'Bobcat', 'Cougar', 'Panther', 'Ocelot',
  'Mongoose', 'Badger', 'Wolverine', 'Otter', 'Beaver', 'Porcupine', 'Armadillo', 'Anteater', 'Aardvark', 'Tapir',
  
  // Sea Animals
  'Dolphin', 'Whale', 'Narwhal', 'Seal', 'Walrus', 'Manatee', 'Dugong', 'Orca', 'Beluga', 'Humpback',
  'Octopus', 'Squid', 'Jellyfish', 'Starfish', 'Seahorse', 'Crab', 'Lobster', 'Shrimp', 'Clam', 'Oyster',
  'Shark', 'Barracuda', 'Tuna', 'Marlin', 'Swordfish', 'Manta', 'Stingray', 'Angelfish', 'Clownfish', 'Grouper',
  
  // Birds
  'Penguin', 'Flamingo', 'Parrot', 'Toucan', 'Peacock', 'Swan', 'Owl', 'Eagle', 'Hawk', 'Falcon',
  'Hummingbird', 'Robin', 'Cardinal', 'Bluejay', 'Woodpecker', 'Pelican', 'Seagull', 'Albatross', 'Condor', 'Vulture',
  'Ostrich', 'Emu', 'Cassowary', 'Kiwi', 'Roadrunner', 'Quail', 'Pheasant', 'Turkey', 'Goose', 'Duck',
  'Crane', 'Heron', 'Stork', 'Ibis', 'Spoonbill', 'Kingfisher', 'Bee-eater', 'Hornbill', 'Cockatoo', 'Macaw',
  
  // Reptiles & Amphibians
  'Turtle', 'Tortoise', 'Lizard', 'Iguana', 'Gecko', 'Chameleon', 'Snake', 'Python', 'Cobra', 'Viper',
  'Alligator', 'Crocodile', 'Frog', 'Toad', 'Salamander', 'Newt', 'Axolotl', 'Tadpole', 'Bullfrog', 'Treefrog',
  
  // Insects & Small Creatures
  'Butterfly', 'Dragonfly', 'Ladybug', 'Beetle', 'Firefly', 'Grasshopper', 'Cricket', 'Mantis', 'Caterpillar', 'Moth',
  'Spider', 'Scorpion', 'Centipede', 'Millipede', 'Snail', 'Slug', 'Worm', 'Ant', 'Bee', 'Wasp',
  
  // Mythical & Fantasy
  'Phoenix', 'Griffin', 'Sphinx', 'Pegasus', 'Centaur', 'Minotaur', 'Kraken', 'Leviathan', 'Basilisk', 'Chimera',
  'Yeti', 'Bigfoot', 'Sasquatch', 'Wendigo', 'Banshee', 'Kelpie', 'Selkie', 'Pixie', 'Sprite', 'Fairy'
];

const numbers = [
  '42', '99', '777', '123', '456', '789', '2024', '2025', '88', '33', '55', '77', '11', '22', '44', '66',
  '111', '222', '333', '444', '555', '666', '888', '999', '007', '101', '404', '808', '909', '1337',
  '360', '720', '1080', '144', '256', '512', '1024', '2048', '369', '147', '258', '963', '741', '852',
  '1234', '5678', '9876', '4321', '1111', '2222', '3333', '4444', '5555', '6666', '7777', '8888', '9999'
];

export function generateFunnyWord(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = numbers[Math.floor(Math.random() * numbers.length)];
  
  return `${adjective}${noun}${number}`;
}

export function generateMultipleFunnyWords(count: number = 3): string[] {
  const words = new Set<string>();
  
  while (words.size < count) {
    words.add(generateFunnyWord());
  }
  
  return Array.from(words);
}

export function getTotalPossibleCombinations(): number {
  return adjectives.length * nouns.length * numbers.length;
}

// Export the counts for reference
export const wordCounts = {
  adjectives: adjectives.length,
  nouns: nouns.length,
  numbers: numbers.length,
  totalCombinations: adjectives.length * nouns.length * numbers.length
};