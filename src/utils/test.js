const response = await fetch('https://clickylatin-api.glitch.me/all');
const json = await response.json();
window.console.log(json);