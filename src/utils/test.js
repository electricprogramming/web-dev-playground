const response = await fetch('https://clickylatin-api.glitch.me/all');
const json = await response.json();
module.exports = json;