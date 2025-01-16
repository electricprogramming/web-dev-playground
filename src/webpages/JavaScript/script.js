import clamp from '/src/utils/clamp.js';
import _eval from '/src/utils/eval.js';
import messages from '/src/utils/messages.js';
import downloadFile from '/src/utils/download-file.js'
import CodeMirror from '/src/CodeMirror/codemirror.js';
const editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
  mode: 'javascript',
  lineNumbers: true,
  theme: 'luminous-night',
  tabSize: 2,
  indentUnit: 2,
  indentWithTabs: false,
  matchBrackets: true,
  autoCloseBrackets: true,
  lineWrapping: false,
  extraKeys: {
    // always indent with two spaces when tab pressed.
    "Tab": function(cm) {
      cm.execCommand('indentMore');
    },
    "Shift-Tab": function(cm) {
      cm.execCommand('indentLess');
    },
    "Control-S": function() {
      messages.broadcast('SAVE');
    }
  }
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
messages.on('SAVE', () => {
  const code = editor.getValue();
  downloadFile(code, 'playground-output.js');
});