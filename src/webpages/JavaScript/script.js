import clamp from '/src/utils/clamp.js';
import _eval from '/src/utils/eval.js';
import CodeMirror from '/src/CodeMirror/codemirror.js';
const editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
  mode: 'javascript',
  lineNumbers: true,
  theme: 'material-ocean',
  tabSize: 2,
  indentUnit: 2,
  indentWithTabs: true,
  matchBrackets: true,
  autoCloseBrackets: true,
  lineWrapping: false
});
editor.element = document.querySelector('.CodeMirror');
const consoleElement = document.getElementById('console');
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
    const x = e.pageX - 1; // account for width of divider
    const percent = clamp(x / window.innerWidth * 100, 30, 90);
    divider.style.left = `${percent}vw`;
    editor.element.style.width = `${percent}vw`;
    consoleElement.style.width = `${100 - percent}vw`;
    editor.refresh(); // fixes scrollbar issue
  }
});
editor.on('change', () => {
  consoleElement.innerHTML = '';
  _eval(editor.getValue());
});