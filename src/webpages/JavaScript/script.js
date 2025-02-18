import clamp from '/src/utils/clamp.js';
import { _eval, commandLineEval } from '/src/utils/eval.js';
import messages from '/src/utils/messages.js';
import strToRegex from '/src/utils/str-to-regex.js';
import beautify from '/src/js-beautify/index.js';
import { downloadFile, promptForFile } from '/src/utils/files.js';
import { clearAllIntervalsAndTimeouts } from '/src/utils/interval-timeout.js';
import { logCommandLineResult } from '/src/utils/console.js';
import CodeMirror from '/src/CodeMirror/codemirror.js';
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
      console.log('BOOM');
    },
    'Enter': function(cm) {
      console.log('boom');
    },
    /*'Ctrl-Enter': function(cm) {
      if (cm.getValue() !== '') {
        const res = commandLineEval(cm.getValue());
        if (!res.isErrored) {
          logCommandLineResult(res.result);
        }
        cm.setValue('');
      }
    },*/
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
  window.editor = editor; window.CodeMirror = CodeMirror; window.commandLine = commandLine;
}

const findDialog = document.getElementById('find-dialog');
const findInput = document.getElementById('find-input');
const findNextBtn = document.getElementById('find-next-btn');
const findPrevBtn = document.getElementById('find-previous-btn');
const findCaseSensitiveCheck = document.getElementById('case-sensitive-check');
const findRegexCheck = document.getElementById('regex-check');
const replaceInput = document.getElementById('replace-input');
const replaceSingleBtn = document.getElementById('replace-single-btn');
const replaceAllBtn = document.getElementById('replace-all-btn');
const consoleElement = document.getElementById('console');
const logContainer = document.getElementById('log-container');
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
    logContainer.innerHTML = '';
  } else {
    this.setAttribute('switch', 'Y');
    messages.broadcast('RUN_CODE');
  }
});
messages.on('CLOSE_FIND_DIALOG', () => {
  findDialog.style.display = 'none';
  messages.broadcast('SIZE_CHANGE');
  findInput.value = '';
  replaceInput.value = '';
  findRegexCheck.checked = false;
  findCaseSensitiveCheck.checked = false;
  editor.getAllMarks().forEach(mark => mark.clear());
});
document.getElementById('find-dialog-close-btn').addEventListener('click', () => messages.broadcast('CLOSE_FIND_DIALOG'));
editor.element.addEventListener('click', () => messages.broadcast('CLOSE_FIND_DIALOG'));

// watch for added or removed children in console; scroll to bottom when a child is added or removed
const observer = new MutationObserver(mutations => {
  mutations.forEach(mutation => {
    if (mutation.type === 'childList') {
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

let searchCursor = null;

messages.on('TRIGGER_SEARCH', () => {
  const query = findRegexCheck.checked? strToRegex(findInput.value) : findInput.value;
  if (query) {
    searchCursor = editor.getSearchCursor(query, null, {
      caseFold: !findCaseSensitiveCheck.checked
    });
    editor.getAllMarks().forEach(mark => mark.clear());
    while (searchCursor.findNext()) {
      editor.markText(searchCursor.from(), searchCursor.to(), {
        className: 'cm-searching'
      });
    }
  }
});
findInput.addEventListener('input', () => messages.broadcast('TRIGGER_SEARCH'));
findInput.addEventListener('keydown', e => {
  if (e.code === 'Tab' || e.code === 'Enter') {
    e.preventDefault();
    replaceInput.focus();
  }
});
findCaseSensitiveCheck.addEventListener('input', () => messages.broadcast('TRIGGER_SEARCH'));
findRegexCheck.addEventListener('input', () => messages.broadcast('TRIGGER_SEARCH'));
findNextBtn.addEventListener('click', function() {
  if (searchCursor && searchCursor.findNext()) {
    editor.getAllMarks().forEach(mark => mark.clear());
    editor.markText(searchCursor.from(), searchCursor.to(), {
      className: 'cm-searching-current'
    });
    editor.setCursor(searchCursor.from());
  } else {
    // Loop back to the beginning
    const query = findRegexCheck.checked? strToRegex(findInput.value) : findInput.value;
    if (query) {
      searchCursor = editor.getSearchCursor(query, null, {
        caseFold: !findCaseSensitiveCheck.checked
      });
      if (searchCursor.findNext()) {
        const from = searchCursor.from(), to = searchCursor.to();
        editor.getAllMarks().forEach(mark => mark.clear());
        editor.markText(from, to, {
          className: 'cm-searching-current'
        });
        editor.setCursor(from);
      }
    }
  }
});
findPrevBtn.addEventListener('click', function() {
  if (searchCursor && searchCursor.findPrevious()) {
    editor.getAllMarks().forEach(mark => mark.clear());
    editor.markText(searchCursor.from(), searchCursor.to(), {
      className: 'cm-searching-current'
    });
    editor.setCursor(searchCursor.from());
  } else {
    // Loop back to the end
    const query = findRegexCheck.checked? strToRegex(findInput.value) : findInput.value;
    if (query) {
      searchCursor = editor.getSearchCursor(query, null, {
        caseFold: !findCaseSensitiveCheck.checked
      });
      if (searchCursor.findPrevious()) {
        const from = searchCursor.from(), to = searchCursor.to();
        editor.getAllMarks().forEach(mark => mark.clear());
        editor.markText(from, to, {
          className: 'cm-searching-current'
        });
        editor.setCursor(from);
      }
    }
  }
});
replaceSingleBtn.addEventListener('click', function() {
  const replaceWith = replaceInput.value;
  if (searchCursor) {
    editor.replaceRange(replaceWith, searchCursor.from(), searchCursor.to());

    if (searchCursor && searchCursor.findNext()) {
      editor.getAllMarks().forEach(mark => mark.clear());
      editor.markText(searchCursor.from(), searchCursor.to(), {
        className: 'cm-searching-current'
      });
      editor.setCursor(searchCursor.from());
    } else {
      // Loop back to the beginning
      const query = findRegexCheck.checked? strToRegex(findInput.value) : findInput.value;
      if (query) {
        searchCursor = editor.getSearchCursor(query, null, {
          caseFold: !findCaseSensitiveCheck.checked
        });
        if (searchCursor.findNext()) {
          const from = searchCursor.from(), to = searchCursor.to();
          editor.getAllMarks().forEach(mark => mark.clear());
          editor.markText(from, to, {
            className: 'cm-searching-current'
          });
          editor.setCursor(from);
        }
      }
    }
  }
});
replaceAllBtn.addEventListener('click', function() {
  const query = findRegexCheck.checked? strToRegex(findInput.value) : findInput.value;
  const cursor = editor.getSearchCursor(query, null, {
    caseFold: !findCaseSensitiveCheck.checked
  });
  const replaceWith = replaceInput.value;
  editor.operation(() => {
    const cursorPosition = editor.getCursor();
    if (cursor.findNext()) {
      editor.setSelection(cursor.from(), cursor.to());
      while (cursor.findNext()) {
        editor.addSelection(cursor.from(), cursor.to());
      }
      editor.replaceSelection(replaceWith);
      editor.setSelection(cursorPosition, cursorPosition);
    }
  });
});