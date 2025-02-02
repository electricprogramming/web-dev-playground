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
      const formatted = js_beautify(original, js_beautify_settings);
      if (original !== formatted) {
        editor.setValue(formatted);
        editor.refresh();
      }
    }
  },
  keyMap: {
    'Ctrl-A': 'selectAll',
    'Ctrl-D': 'deleteLine',
    'Ctrl-Z': 'undo',
    'Shift-Ctrl-Z': 'redo',
    'Ctrl-Y': 'redo',
    'Ctrl-Home': 'goDocStart',
    'Ctrl-End': 'goDocEnd',
    'Ctrl-Up': 'goLineUp',
    'Ctrl-Down': 'goLineDown',
    'Ctrl-Left': 'goGroupLeft',
    'Ctrl-Right': 'goGroupRight',
    'Alt-Left': 'goLineStart',
    'Alt-Right': 'goLineEnd',
    'Ctrl-Backspace': 'delGroupBefore',
    'Ctrl-Delete': 'delGroupAfter',
    'Ctrl-U': 'undoSelection',
    'Shift-Ctrl-U': 'redoSelection',
    'Alt-U': 'redoSelection',
    'fallthrough': 'basic',
    // disable unwanted keys
    'Ctrl-S': false,
    'Ctrl-F': false,
    'Ctrl-G': false,
    'Shift-Ctrl-G': false,
    'Shift-Ctrl-F': false,
    'Shift-Ctrl-R': false,
    'Ctrl-[': false,
    'Ctrl-]': false
  }
});
if (/* should 'editor' be globally available? */ 'Y') {
  window.editor = editor;
}
editor.element = editor.getWrapperElement();
editor.element.id = 'editor';
const findDialog = document.getElementById('find-dialog');
const findInput = document.getElementById('find-input');
const findNextBtn = document.getElementById('find-next-btn');
const findPrevBtn = document.getElementById('find-previous-btn');
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
// watch for added or removed children; scroll to bottom when a child is added or removed
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
observer.observe(consoleElement, {
  childList: true,
  subtree: false
});

let searchCursor = null;
findInput.addEventListener('input', function() {
  const query = this.value;
  if (query) {
    const cursor = editor.getSearchCursor(query);
    searchCursor = cursor;
    let searchResults = editor.getSearchCursor(query);
    editor.getAllMarks().forEach(mark => mark.clear());
    while (searchResults.findNext()) {
      editor.markText(searchResults.from(), searchResults.to(), {
        className: 'cm-searching'
      });
    }
  }
});
findNextBtn.addEventListener('click', function() {
  if (searchCursor && searchCursor.findNext()) {
    editor.markText(searchCursor.from(), searchCursor.to(), {
      className: 'cm-searching-current'
    });
    editor.setSelection(searchCursor.from(), searchCursor.to());
  } else {
    // Loop back to the beginning
    const query = findInput.value;
    if (query) {
      const cursor = editor.getSearchCursor(query);
      searchCursor = cursor; // Store cursor to use for navigation
      if (cursor.findNext()) {
        const from = cursor.from(), to = cursor.to();
        editor.getAllMarks.forEach(mark => {
          const { markFrom, markTo } = mark.find();
          if (markFrom === from && markTo === to) {
            mark.clear();
          }
        });
        editor.markText(from, to, {
          className: 'cm-searching-current'
        });
      }
    }
  }
});
findPrevBtn.addEventListener('click', function() {
  if (searchCursor && searchCursor.findPrevious()) {
    editor.markText(searchCursor.from(), searchCursor.to(), {
      className: 'cm-searching-current'
    });
  } else {
    // Loop back to the end
    const query = findInput.value;
    if (query) {
      const cursor = editor.getSearchCursor(query);
      searchCursor = cursor; // Store cursor to use for navigation
      if (cursor.findPrevious()) {
        const from = cursor.from(), to = cursor.to();
        editor.getAllMarks.forEach(mark => {
          const { markFrom, markTo } = mark.find();
          if (markFrom === from && markTo === to) {
            mark.clear();
          }
        });
        editor.markText(from, to, {
          className: 'cm-searching-current'
        });
      }
    }
  }
});