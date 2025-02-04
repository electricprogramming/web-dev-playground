import clamp from '/src/utils/clamp.js';
import _eval from '/src/utils/eval.js';
import messages from '/src/utils/messages.js';
import { js_beautify, settings as js_beautify_settings } from '/src/js-beautify/index.js';
import { downloadFile, promptForFile } from '/src/utils/files.js';
import { clearAllIntervalsAndTimeouts } from '/src/utils/interval-timeout.js';
require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.36.1/min/vs' } });

require(['vs/editor/editor.main'], function () {
  monaco.editor.defineTheme('downtown-midnight', {
    "base": "vs-dark",
    "inherit": true,
    "rules": [
      { "token": "", "foreground": "#F8F8F2", "background": "#0f111a" },
      { "token": "comment", "foreground": "#75715E" },
      { "token": "string", "foreground": "#E6DB74" },
      { "token": "string.escape", "foreground": "#E6DB74" },
      { "token": "number", "foreground": "#8609EF" },
      { "token": "boolean", "foreground": "#ffac00" },
      { "token": "constant", "foreground": "#ffac00" },
      { "token": "undefined", "foreground": "#aaaaaa" },
      { "token": "keyword", "foreground": "#f92626" },
      { "token": "variable", "foreground": "#67fc31" },
      { "token": "variable.language", "foreground": "#67fc31" },
      { "token": "function", "foreground": "#FD971F" },
      { "token": "variable.other", "foreground": "#67fc31" },
      { "token": "property", "foreground": "#66D9EF" },
      { "token": "operator", "foreground": "#F92672" },
      { "token": "type", "foreground": "#FD971F" },
      { "token": "delimiter", "foreground": "#F8F8F2" },
      { "token": "brackets", "foreground": "#777799bb", "background": "#777799bb" },
      { "token": "nonmatchingbracket", "foreground": "#f88", "background": "#f556" }
    ],
    "colors": {
      "editor.foreground": "#F8F8F2",
      "editor.background": "#0f111a",
      "editorCursor.foreground": "#F8F8F2",
      "editor.lineHighlightBackground": "#2a2957",
      "editor.selectionBackground": "#2a2957",
      "editor.inactiveSelectionBackground": "#2a2957",
      "editorGutter.background": "#0f111a",
      "editorGutter.border": "#0f111a",
      "editorGutter.modifiedBackground": "#0f111a",
      "editorLineNumber.foreground": "#aaa",
      "editorBracketMatch.background": "#777799bb",
      "editorBracketMatch.border": "#abf",
      "editor.selectionHighlightBackground": "#2a2957",
      "editor.findMatchBackground": "#ffff2266",
      "editor.findMatchHighlightBackground": "#aaff2266"
    }
  });
  window.editor = monaco.editor.create(document.getElementById('editor'), {
    value: `function helloWorld() {
  console.log('Hello, World!');
}`,
    language: 'javascript',
    theme: 'downtown-midnight' // Apply the custom theme
  });
});
if (/* should 'editor' be globally available? */ 'Y') {
  window.editor = editor;
}
editor.element = document.getElementById('editor');
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
editor.onDidChangeModelContent((event) => {
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
document.getElementById('save-btn').addEventListener('click', function () {
  messages.broadcast('SAVE');
});
document.getElementById('load-btn').addEventListener('click', function () {
  messages.broadcast('LOAD');
});
document.getElementById('play-btn').addEventListener('click', function () {
  messages.broadcast('RUN_CODE');
});
document.getElementById('auto-refresh-toggle').addEventListener('click', function () {
  if (this.getAttribute('switch')) {
    this.setAttribute('switch', '');
  } else {
    this.setAttribute('switch', 'Y');
    messages.broadcast('RUN_CODE');
  }
});
document.getElementById('find-dialog-close-btn').addEventListener('click', function () {
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
findInput.addEventListener('input', function () {
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
findNextBtn.addEventListener('click', function () {
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
findPrevBtn.addEventListener('click', function () {
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