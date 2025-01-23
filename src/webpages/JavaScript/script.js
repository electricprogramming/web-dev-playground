import clamp from '/src/utils/clamp.js';
import _eval from '/src/utils/eval.js';
import messages from '/src/utils/messages.js';
import { downloadFile, promptForFile } from '/src/utils/files.js';
import { clearAllIntervalsAndTimeouts } from '/src/utils/interval-timeout.js';
import CodeMirror from '/src/CodeMirror/codemirror.js';
const editor = CodeMirror.fromTextArea(document.querySelector('textarea'), {
  mode: 'javascript',
  lineNumbers: true,
  theme: 'downtown-midnight',
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
    "Ctrl-I": function(...args) {
      console.dir(args)
    },
    "Ctrl-S": function() {
      messages.broadcast('SAVE');
    },
    "Ctrl-O": function() {
      messages.broadcast('LOAD');
    }
  }
});
if (/* should 'editor' be globally available? */ 'Y') {
  window.editor = editor;
}
editor.element = document.querySelector('.CodeMirror');
const findDialog = document.getElementById('find-dialog');
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
    findDialog.style.width = `${percent}vw`;
    consoleElement.style.width = `${100 - percent}vw`;
    editor.refresh(); // fixes scrollbar issue
  }
});
editor.on('change', () => {
  if (document.getElementById('auto-refresh-toggle').getAttribute('switch')) {
    clearAllIntervalsAndTimeouts();
    consoleElement.innerHTML = '';
    _eval(editor.getValue());
  }
});
messages.on('SAVE', () => {
  const code = editor.getValue();
  downloadFile(code, 'playground-output.js');
});
messages.on('LOAD', () => {
  promptForFile('.js, .mjs, .cjs, .json')
    .then(res => editor.setValue(res));
});
document.getElementById('save-btn').addEventListener('click', function() {
  messages.broadcast('SAVE');
});
document.getElementById('load-btn').addEventListener('click', function() {
  messages.broadcast('LOAD');
});
document.getElementById('auto-refresh-toggle').addEventListener('click', function() {
  if (this.getAttribute('switch')) {
    this.setAttribute('switch', '');
  } else {
    this.setAttribute('switch', 'Y');
    clearAllIntervalsAndTimeouts();
    consoleElement.innerHTML = '';
    _eval(editor.getValue());
  }
});