import clamp from '/src/utils/clamp.js';
window.codemirrored = CodeMirror.fromTextArea(document.getElementById('editor'), {
  mode: 'javascript',
  lineNumbers: true,
  theme: 'material-ocean',
  tabSize: 2,
  indentUnit: 2,
  matchBrackets: true,
  autoCloseBrackets: true,
  lineWrapping: false
});
const editor = document.querySelector('.CodeMirror');
const console = document.getElementById('console');
const divider = document.getElementById('divider');
let dividerDragging = false;
divider.addEventListener('mousedown', () => {
  dividerDragging = true;
  document.addEventListener('mouseup', () => {
    dividerDragging = false;
  }, { once: true });
});
document.addEventListener('mousemove', (e) => {
  if (dividerDragging) {
    const x = e.pageX;
    const percent = x / window.innerWidth * 100;
    if (percent >= 30 && percent <= 90) {
      divider.style.left = `${percent}vw`;
    }
  }
});