import editors from '../../utils/editor-manager.js';
import clamp from '../../utils/clamp.js';
import { _eval, commandLineEval } from '../../utils/eval.js';
import messages from '../../utils/messages.js';
import beautify from '../../js-beautify/index.js';
import { downloadFile, promptForFile } from '../../utils/files.js';
import { clearAllIntervalsAndTimeouts } from '../../utils/interval-timeout.js';
import { logCommandLineResult } from '../../utils/console.js';
import CodeMirror from '../../CodeMirror/codemirror.js';

const editor = CodeMirror.fromTextArea(document.getElementById('editor-textarea'), {
  mode: 'javascript',
  lineNumbers: true,
  theme: 'downtown-midnight',
  tabSize: 2,
  indentUnit: 2,
  indentWithTabs: false,
  matchBrackets: true,
  autoCloseBrackets: true,
  foldGutter: true,
  rulers: true,
  gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
  lineWrapping: false,
  foldOptions: {
    widget: function() {
      var svg = document.createElement('img');
      svg.src = '/src/webpages/assets/inline-foldmarker.svg';
      svg.style.cursor = 'pointer';
      svg.alt = '↔';
      return svg;
    },
    minFoldSize: 1
  },
  keyMap: {
    ...CodeMirror.keyMap.basic,
    ...CodeMirror.keyMap.default, // Start with the default keymap
    'Tab': function(cm) {
      cm.execCommand('indentMore');
    },
    'Shift-Tab': function(cm) {
      cm.execCommand('indentLess');
    },
    'Ctrl-S': function() {
      messages.broadcast('SAVE');
    },
    'Ctrl-O': function() {
      messages.broadcast('LOAD');
    },
    'Ctrl-F': function() {
      findDialog.style.display = 'block';
      findInput.focus();
      messages.broadcast('SIZE_CHANGE');
    },
    'Shift-Alt-F': function() {
      const original = editor.getValue();
      const formatted = beautify.js(original, beautify.settings);
      if (original !== formatted) {
        editor.setValue(formatted);
        editor.refresh();
      }
    },
    fallthrough: false,
    // disable unwanted keys
    'Ctrl-G': false,
    'Shift-Ctrl-G': false,
    'Shift-Ctrl-F': false,
    'Shift-Ctrl-R': false,
  }
});
editor.element = editor.getWrapperElement();
editor.element.id = 'editor';
editors.main = editor;

let commandLineHistory = [];
let commandLineHistoryNegativeIndex = 0;
const commandLine = CodeMirror.fromTextArea(document.getElementById('command-line-textarea'), {
  mode: 'javascript',
  lineNumbers: false,
  theme: 'command-line',
  tabSize: 2,
  indentUnit: 2,
  indentWithTabs: false,
  matchBrackets: true,
  autoCloseBrackets: true,
  gutters: [],
  lineWrapping: false,
  keyMap: {
    ...CodeMirror.keyMap.basic,
    ...CodeMirror.keyMap.default, // Start with the default keymap
    'Shift-Enter': function(cm) {
      cm.execCommand('newlineAndIndent');
    },
    'Up': function(cm) {
      if (cm.getCursor().line === 0) {
        commandLineHistoryNegativeIndex ++;
        const previousValue = commandLineHistory[commandLineHistory.length - commandLineHistoryNegativeIndex];
        if (previousValue) {
          cm.setValue(previousValue);
          cm.setCursor(cm.lastLine(), cm.getLine(cm.lastLine()).length);
        }
      } else {
        cm.execCommand('goLineUp');
      }
    },
    'Down': function(cm) {
      if (cm.getCursor().line === cm.lastLine()) {
        commandLineHistoryNegativeIndex --;
        const previousValue = commandLineHistory[commandLineHistory.length - commandLineHistoryNegativeIndex];
        if (previousValue) {
          cm.setValue(previousValue);
          cm.setCursor(cm.lastLine(), cm.getLine(cm.lastLine()).length);
        }
      } else {
        cm.execCommand('goLineDown');
      }
    },
    'Enter': function(cm) {
      const code = cm.getValue();
      if (code !== '') {
        commandLineHistory.push(code);
        commandLineHistoryNegativeIndex = 0;
        const extendedCode = commandLineHistory.join('\n');
        const res = commandLineEval(code);
        if (!res.isErrored) {
          logCommandLineResult(res.result);
        }
        cm.setValue('');
      }
    },
    'Tab': function(cm) {
      cm.execCommand('indentMore');
    },
    'Shift-Tab': function(cm) {
      cm.execCommand('indentLess');
    },
    fallthrough: false,
    // disable unwanted keys
    'Ctrl-S': false,
    'Ctrl-F': false,
    'Ctrl-G': false,
    'Shift-Ctrl-G': false,
    'Shift-Ctrl-F': false,
    'Shift-Ctrl-R': false
  }
});
commandLine.element = commandLine.getWrapperElement();
commandLine.element.id = 'command-line';

if (/* should 'editor', 'commandLine', and 'CodeMirror' be globally available? */ 'Y') {
  window.editor = editor; window.commandLine = commandLine; window.CodeMirror = CodeMirror;
}

const awaitToggle = document.getElementById('await-toggle');
const findDialog = document.getElementById('find-dialog');
const findInput = document.getElementById('find-input');
const findCaseSensitiveCheck = document.getElementById('case-sensitive-check');
const findRegexCheck = document.getElementById('regex-check');
const replaceInput = document.getElementById('replace-input');
const consoleElement = document.getElementById('console');
const logContainer = document.getElementById('log-container');
const divider = document.getElementById('divider');
const cover = document.getElementById('cover');

let dividerDragging = false;
divider.addEventListener('mousedown', () => {
  dividerDragging = true;
  cover.style.display = 'block';
  document.documentElement.style.cursor = 'col-resize';
  document.addEventListener('mouseup', () => {
    dividerDragging = false;
    cover.style.display = 'none';
    document.documentElement.style.cursor = '';
  }, { once: true });
});
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

window.addEventListener('resize', () => messages.broadcast('SIZE_CHANGE'));
messages.on('SIZE_CHANGE', () => {
  const { height } = findDialog.getBoundingClientRect();
  const heightInVh = height / window.innerHeight * 100;
  editor.element.style.height = `${93.5 - heightInVh}vh`;
});
messages.broadcast('SIZE_CHANGE');
messages.on('RUN_CODE', () => {
  clearAllIntervalsAndTimeouts();
  logContainer.innerHTML = '';
  _eval(editor.getValue(), Boolean(awaitToggle.getAttribute('switch')));
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
    logContainer.innerHTML = '';
  } else {
    this.setAttribute('switch', 'Y');
    messages.broadcast('RUN_CODE');
  }
});
document.getElementById('autoscroll-console-toggle').addEventListener('click', function() {
  if (this.getAttribute('switch')) {
    this.setAttribute('switch', '');
  } else {
    this.setAttribute('switch', 'Y');
    consoleElement.scrollTo({
      top: consoleElement.scrollHeight,
      behavior: 'auto'
    });
  }
});
awaitToggle.addEventListener('click', function() {
  if (this.getAttribute('switch')) {
    this.setAttribute('switch', '');
  } else {
    this.setAttribute('switch', 'Y');
  }
});

messages.on('CLOSE_FIND_DIALOG', () => {
  findDialog.style.display = 'none';
  messages.broadcast('SIZE_CHANGE');
  findInput.value = '';
  replaceInput.value = '';
  findRegexCheck.checked = false;
  findCaseSensitiveCheck.checked = false;
  editor.getAllMarks().forEach(mark => {
    if (!mark.__isFold) {
      mark.clear();
    }
  });
});
document.getElementById('find-dialog-close-btn').addEventListener('click', () => messages.broadcast('CLOSE_FIND_DIALOG'));
editor.element.addEventListener('click', () => messages.broadcast('CLOSE_FIND_DIALOG'));

// watch for added or removed children in console; scroll to bottom when a child is added or removed
const observer = new MutationObserver(mutations => {
  mutations.forEach(mutation => {
    if (mutation.type === 'childList' && document.getElementById('autoscroll-console-toggle').getAttribute('switch')) {
      consoleElement.scrollTo({
        top: consoleElement.scrollHeight,
        behavior: 'auto'
      });
    }
  });
});
observer.observe(logContainer, {
  childList: true,
  subtree: false
});