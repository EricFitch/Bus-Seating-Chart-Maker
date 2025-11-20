// Bus Seating Chart Themes
// Exported as THEMES object

const THEMES = {
  Default: {},
  Animals: { '1': '🦁 Lion', '2': '🐯 Tiger', '3': '🐻 Bear', '4': '🐼 Panda', '5': '🦊 Fox', '6': '🐺 Wolf', '7': '🐴 Horse', '8': '🐮 Cow', '9': '🦓 Zebra', '10': '🦒 Giraffe', '11': '🐘 Elephant', '12': '🦏 Rhino', '13': '🦛 Hippo', '14': '🐊 Crocodile', '15': '🐸 Frog', '16': '🐍 Snake', '17': '🦅 Eagle', '18': '🦉 Owl', '19': '🐧 Penguin', '20': '🦆 Duck', '21': '🐬 Dolphin', '22': '🐋 Whale', '23': '🦈 Shark', '24': '🐙 Octopus', '25': '🦀 Crab', '26': '🐢 Turtle' },
  Space: { '1': '☀️ Sun', '2': '☄️ Comet', '3': '🪐 Saturn', '4': '🌎 Earth', '5': '🌕 Moon', '6': '🚀 Rocket', '7': '✨ Sparkle', '8': '👾 Alien', '9': '🌌 Galaxy', '10': '🔭 Telescope', '11': '🛰️ Satellite', '12': '🌠 Shooting Star', '13': '🌑 New Moon', '14': '⭐ Star', '15': '🌟 Bright Star', '16': '🛸 UFO', '17': '🌗 Last Quarter', '18': '🌘 Waning Crescent', '19': '🕳️ Wormhole', '20': '🪐 Planet', '21': '🌙 Crescent Moon', '22': '🌖 Gibbous Moon', '23': '🌌 Galaxy', '24': '🌃 Night', '25': '🌠 Meteor', '26': '🛰️ Orbiter' },
  Vehicles: { '1': '🚗 Car', '2': '🚕 Taxi', '3': '🚙 SUV', '4': '🚌 Bus', '5': '🏎️ Racecar', '6': '🚘 Sedan', '7': '🚑 Ambulance', '8': '🚒 Firetruck', '9': '🚐 Minivan', '10': '🚚 Truck', '11': '🚛 Lorry', '12': '🚜 Tractor', '13': '✈️ Plane', '14': '🛩️ Sm Plane', '15': '🚁 Helicopter', '16': '🚂 Train', '17': '🛥️ Boat', '18': '⛵ Sailboat', '19': '🚢 Ship', '20': '🚲 Bike', '21': '🛵 Scooter', '22': '🏍️ Motorbike', '23': '🛶 Canoe', '24': '🚠 Cable Car', '25': '🚡 Gondola', '26': '🚀 Rocket' },
  Fruits: { '1': '🍎 Apple', '2': '🍌 Banana', '3': '🍊 Orange', '4': '🍇 Grapes', '5': '🍉 Watermelon', '6': '🍓 Strawberry', '7': '🍍 Pineapple', '8': '🥭 Mango', '9': '🫐 Blueberries', '10': '🍑 Peach', '11': '🍐 Pear', '12': '🍒 Cherries', '13': '🥥 Coconut', '14': '🍋 Lemon', '15': '🥝 Kiwi', '16': '🍈 Melon', '17': '🫒 Olive', '18': '🌰 Chestnut', '19': '🍅 Tomato', '20': '🌽 Corn', '21': '🥕 Carrot', '22': '🥔 Potato', '23': '🥬 Lettuce', '24': '🧄 Garlic', '25': '🧅 Onion', '26': '🥑 Avocado' },
  Colors: { '1': '🔴 Red', '2': '🔵 Blue', '3': '🟢 Green', '4': '🟡 Yellow', '5': '🟣 Purple', '6': '🟠 Orange', '7': '⚫ Filled Circle', '8': '⚪ Hollow Circle', '9': '🟥 Red Square', '10': '🟦 Blue Square', '11': '🟩 Green Square', '12': '🟨 Yellow Square', '13': '🟪 Purple Square', '14': '🟧 Orange Square', '15': '🟫 Brown Square', '16': '⬛ Solid Square', '17': '⬜ Open Square', '18': '🔺 Triangle Up', '19': '🔻 Triangle Down', '20': '⬤ Circle', '21': '◯ Hollow Circle', '22': '🔶 Diamond', '23': '🔷 Blue Diamond', '24': '🟦 Blue Diamond', '25': '🟩 Green Diamond', '26': '⭐ Star' },
  Nature: { '1': '🌳 Tree', '2': '🌲 Pine', '3': '🌵 Cactus', '4': '🌼 Flower', '5': '🌸 Blossom', '6': '🍁 Maple', '7': '🍂 Leaf', '8': '🍃 Leaf', '9': '🌞 Sun', '10': '🌧️ Rain', '11': '☁️ Cloud', '12': '🌈 Rainbow', '13': '🏔️ Mountain', '14': '🪵 Log', '15': '🐚 Shell', '16': '🪺 Nest', '17': '🪨 Rock', '18': '🌊 Wave', '19': '🔥 Flame', '20': '🪴 Plant', '21': '🌻 Sunflower', '22': '🌺 Hibiscus', '23': '🍀 Clover', '24': '🌙 Moon', '25': '⭐ Star', '26': '⛅ Sun-Cloud' },
  Christmas: { '1': '🎄 Tree', '2': '🎅 Santa', '3': '🤶 Mrs. Claus', '4': '🦌 Reindeer', '5': '⛄ Snowman', '6': '🎁 Gift', '7': '🧦 Stocking', '8': '🕯️ Candle', '9': '🌟 Star', '10': '🍪 Cookie', '11': '🛷 Sleigh', '12': '❄️ Snowflake', '13': '🦜 Partridge', '14': '🦢 Swan', '15': '🦚 Peacock', '16': '🦃 Turkey', '17': '🧸 Teddy', '18': '🧤 Mitten', '19': '🧣 Scarf', '20': '🥛 Milk', '21': '🍫 Chocolate', '22': '🍬 Candy', '23': '🍭 Lollipop', '24': '� Balloon', '25': '🍎 Apple', '26': '🍊 Orange' },
  Thanksgiving: { '1': '🦃 Turkey', '2': '🥧 Pie', '3': '🍂 Leaf', '4': '🌽 Corn', '5': '🍁 Maple', '6': '🍠 Yam', '7': '🥔 Potato', '8': '🥕 Carrot', '9': '🍞 Bread', '10': '🍎 Apple', '11': '🍇 Grapes', '12': '🥤 Drink', '13': '🥬 Lettuce', '14': '🥦 Broccoli', '15': '🥒 Cucumber', '16': '🥜 Peanut', '17': '🌰 Chestnut', '18': '🍗 Drumstick', '19': '🥓 Bacon', '20': '🧀 Cheese', '21': '🥚 Egg', '22': '🥛 Milk', '23': '🍰 Cake', '24': '🍪 Cookie', '25': '🍫 Chocolate', '26': '🍬 Candy' },
  Halloween: { '1': '🎃 Pumpkin', '2': '👻 Ghost', '3': '🕸️ Web', '4': '🕷️ Spider', '5': '🧙‍♀️ Witch', '6': '🧛‍♂️ Vampire', '7': '🧟 Zombie', '8': '🦇 Bat', '9': '🍬 Candy', '10': '🍭 Lollipop', '11': '🍫 Chocolate', '12': '🦉 Owl', '13': '🧹 Broom', '14': '🪦 Tombstone', '15': '⚰️ Coffin', '16': '🩸 Blood', '17': '🦴 Bone', '18': '🧤 Glove', '19': '🧣 Scarf', '20': '🕯️ Candle', '21': '🌕 Moon', '22': '🌑 New Moon', '23': '🌙 Crescent Moon', '24': '🌌 Galaxy', '25': '🦇 Bat', '26': '🧛‍♀️ Vampire' },
  Summer: { '1': '🌞 Sun', '2': '🏖️ Beach', '3': '🌊 Wave', '4': '🍉 Watermelon', '5': '🍦 Ice Cream', '6': '🍧 Shaved Ice', '7': '🍹 Drink', '8': '🏄‍♂️ Surfer', '9': '🕶️ Sunglasses', '10': '🩳 Shorts', '11': '👒 Hat', '12': '🩱 Swimsuit', '13': '🛶 Canoe', '14': '🚣‍♀️ Rowboat', '15': '🏊‍♂️ Swimmer', '16': '🦀 Crab', '17': '🐚 Shell', '18': '🦑 Squid', '19': '🐠 Fish', '20': '🦞 Lobster', '21': '🦐 Shrimp', '22': '🦦 Otter', '23': '🦭 Seal', '24': '🦈 Shark', '25': '🦑 Squid', '26': '🦐 Shrimp' },
  SpringBreak: { '1': '🌸 Blossom', '2': '🌼 Flower', '3': '🌷 Tulip', '4': '🌱 Seedling', '5': '🌳 Tree', '6': '🌦️ Rain', '7': '🌈 Rainbow', '8': '🦋 Butterfly', '9': '🐝 Bee', '10': '🐞 Ladybug', '11': '🐰 Bunny', '12': '🐣 Chick', '13': '🐥 Duckling', '14': '🐦 Bird', '15': '🐸 Frog', '16': '🐢 Turtle', '17': '🐍 Snake', '18': '🐌 Snail', '19': '🐛 Caterpillar', '20': '🦗 Cricket', '21': '🦟 Mosquito', '22': '🦠 Microbe', '23': '🌺 Hibiscus', '24': '🌻 Sunflower', '25': '🍀 Clover', '26': '🌹 Rose' },
  Fall: { '1': '🍁 Maple', '2': '🍂 Leaf', '3': '🌰 Chestnut', '4': '🎃 Pumpkin', '5': '🦃 Turkey', '6': '🍎 Apple', '7': '🍇 Grapes', '8': '🍏 Green Apple', '9': '🍐 Pear', '10': '🍊 Orange', '11': '🍋 Lemon', '12': '🍒 Cherries', '13': '🥥 Coconut', '14': '🍓 Strawberry', '15': '🍉 Watermelon', '16': '🍌 Banana', '17': '🍍 Pineapple', '18': '🥭 Mango', '19': '🫐 Blueberries', '20': '🍑 Peach', '21': '🥝 Kiwi', '22': '🍈 Melon', '23': '🫒 Olive', '24': '🌰 Chestnut', '25': '🍅 Tomato', '26': '🌽 Corn' },
  Winter: { '1': '❄️ Snowflake', '2': '⛄ Snowman', '3': '🌨️ Snow', '4': '🌬️ Wind', '5': '🧤 Mitten', '6': '🧣 Scarf', '7': '🧥 Coat', '8': '🧦 Sock', '9': '🧊 Ice', '10': '🥶 Cold', '11': '🛷 Sled', '12': '⛷️ Skier', '13': '🏂 Snowboard', '14': '⛸️ Skate', '15': '🦌 Reindeer', '16': '🎄 Tree', '17': '🎁 Gift', '18': '🕯️ Candle', '19': '🌟 Star', '20': '🍪 Cookie', '21': '🍫 Chocolate', '22': '🍬 Candy', '23': '🍭 Lollipop', '24': '☕ Cocoa', '25': '🍎 Apple', '26': '🍊 Orange' }
};

for (let i = 1; i <= 26; i++) THEMES.Default[i.toString()] = '';

// Expose getThemeItem globally for modules
function getThemeItem(theme, benchNum) {
  const raw = theme[String(benchNum)] || '';
  if (!raw) return { icon: '', name: '' };
  if (typeof raw === 'object' && raw.icon) return raw; // future-proof if theme entries become objects
  // Expecting format "<emoji> Name"; split on space first token
  const m = String(raw).trim();
  const first = m.split(' ')[0] || '';
  const rest = m.slice(first.length).trim();
  return { icon: first, name: rest };
}

// Export for use in app.js
window.THEMES = THEMES;
window.getThemeItem = getThemeItem;

function populateThemeSelector() {
  const themeSelector = window.themeSelector || document.getElementById('theme-selector');
  if (!themeSelector) return;

  // Theme emoji previews and descriptions
  const themeLabels = {
    'Default': '⚪ Default (No Icons)',
    'Animals': '🦁 Animals',
    'Space': '🚀 Space & Astronomy',
    'Vehicles': '🚗 Vehicles & Transport',
    'Fruits': '🍎 Fruits & Vegetables',
    'Colors': '🔴 Colors & Shapes',
    'Nature': '🌳 Nature & Environment',
    'Christmas': '🎄 Christmas Holiday',
    'Thanksgiving': '🦃 Thanksgiving',
    'Halloween': '🎃 Halloween',
    'Summer': '🌞 Summer Break',
    'SpringBreak': '🌸 Spring Break',
    'Fall': '🍁 Fall Season',
    'Winter': '❄️ Winter Season'
  };
  
  themeSelector.innerHTML = '';
  Object.keys(THEMES).forEach(name => {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = themeLabels[name] || name;
    themeSelector.appendChild(opt);
  });
  // Default to Animals theme (no persistence for privacy)
  themeSelector.value = 'Animals';
}
window.populateThemeSelector = populateThemeSelector;
