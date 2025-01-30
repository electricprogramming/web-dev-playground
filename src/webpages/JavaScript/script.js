import clamp from '/src/utils/clamp.js';
import _eval from '/src/utils/eval.js';
import messages from '/src/utils/messages.js';
import { js_beautify, settings as js_beautify_settings } from '/src/js-beautify/index.js';
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
    },
    "Ctrl-F": function() {
      findDialog.style.display = 'block';
      messages.broadcast('SIZE_CHANGE');
    },
    "Shift-Alt-F": function() {
      const original = editor.getValue();
      const formatted = js_beautify(original, js_beautify_settings);
      if (original !== formatted) {
        editor.setValue(formatted);
        editor.refresh();
      }
    },
    "Ctrl-Shift-R": function() {} // remove default functionality
  }
});
if (/* should 'editor' be globally available? */ 'Y') {
  window.editor = editor;
}
editor.element = editor.getWrapperElement();
editor.element.id = 'editor';
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
window.addEventListener('resize', () => messages.broadcast('SIZE_CHANGE'));
document.addEventListener('mousemove', (e) => {
  if (dividerDragging) {
    const x = e.pageX - 2; // account for width of divider
    const percent = clamp(x / window.innerWidth * 100, 30, 90);
    divider.style.left = `${percent}vw`;
    editor.element.style.width = `${percent}vw`;
    findDialog.style.width = `${percent}vw`;
    consoleElement.style.width = `${100 - percent}vw`;
    messages.broadcast('SIZE_CHANGE');
    editor.refresh(); // fixes scrollbar issue
  }
});
messages.on('SIZE_CHANGE', () => {
  const { height } = findDialog.getBoundingClientRect();
  const heightInVh = height / window.innerHeight * 100;
  editor.element.style.height = `${93.5 - heightInVh}vh`;
});
messages.broadcast('SIZE_CHANGE');
messages.on('RUN_CODE', () => {
  clearAllIntervalsAndTimeouts();
  consoleElement.innerHTML = '';
  _eval(editor.getValue());
});
editor.on('change', () => {
  if (document.getElementById('auto-refresh-toggle').getAttribute('switch')) {
    messages.broadcast('RUN_CODE');
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
document.getElementById('play-btn').addEventListener('click', function() {
  messages.broadcast('RUN_CODE');
});
document.getElementById('auto-refresh-toggle').addEventListener('click', function() {
  if (this.getAttribute('switch')) {
    this.setAttribute('switch', '');
  } else {
    this.setAttribute('switch', 'Y');
    messages.broadcast('RUN_CODE');
  }
});
document.getElementById('find-dialog-close-btn').addEventListener('click', function() {
  findDialog.style.display = 'none';
  messages.broadcast('SIZE_CHANGE');
});