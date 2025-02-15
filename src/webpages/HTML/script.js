import clamp from '/src/utils/clamp.js';
import _eval from '/src/utils/eval.js';
import messages from '/src/utils/messages.js';
import strToRegex from '/src/utils/str-to-regex.js';
import beautify from '/src/js-beautify/index.js';
import { downloadFile, promptForFile } from '/src/utils/files.js';
import CodeMirror from '/src/CodeMirror/codemirror.js';
const editor = CodeMirror.fromTextArea(document.querySelector('textarea'), {
  mode: 'htmlmixed',
  lineNumbers: true,
  theme: 'downtown-midnight',
  tabSize: 2,
  indentUnit: 2,
  indentWithTabs: false,
  matchBrackets: true,
  autoCloseBrackets: true,
  matchTags: { bothTags: true, nonMatchingTags: true },
  autoCloseTags: true,
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
      const formatted = beautify.html(original, beautify.settings);
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
if (/* should 'editor' and 'CodeMirror' be globally available? */ 'Y') {
  window.editor = editor; window.CodeMirror = CodeMirror;
}

editor.element = editor.getWrapperElement();
editor.element.id = 'editor';
const findDialog = document.getElementById('find-dialog');
const findInput = document.getElementById('find-input');
const findNextBtn = document.getElementById('find-next-btn');
const findPrevBtn = document.getElementById('find-previous-btn');
const findCaseSensitiveCheck = document.getElementById('case-sensitive-check');
const findRegexCheck = document.getElementById('regex-check');
const replaceInput = document.getElementById('replace-input');
const replaceSingleBtn = document.getElementById('replace-single-btn');
const replaceAllBtn = document.getElementById('replace-all-btn');
const preview = document.getElementById('preview');
const divider = document.getElementById('divider');

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
document.addEventListener('mousemove', e => {
  if (dividerDragging) {
    const x = e.pageX - 2; // account for width of divider
    const percent = clamp(x / window.innerWidth * 100, 30, 90);
    divider.style.left = `${percent}vw`;
    editor.element.style.width = `${percent}vw`;
    findDialog.style.width = `${percent}vw`;
    preview.style.width = `${100 - percent}vw`
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
  preview.contentWindow.location.reload();
  const code = editor.getValue();
  const codeChunks = code.split(/(.{1024})/s).filter(Boolean); // filter out empty strings
  const channel = new BroadcastChannel('HTML_Broadcast');
  messages.on('RUN_CODE', () => {
    channel.close();
  });
  channel.onmessage = function(event) {
    if (event.data === 'READY_FOR_HTML') {
      codeChunks.forEach((chunk, idx) => {
        const isDone = idx === codeChunks.length - 1;
        channel.postMessage({ htmlContent: chunk, isDone });
        if (isDone) {
          channel.close();
        }
      });
    }
  };
});
messages.broadcast('RUN_CODE'); // Refresh the iframe when the page loads
editor.on('change', () => {
  if (document.getElementById('auto-refresh-toggle').getAttribute('switch')) {
    messages.broadcast('RUN_CODE');
  }
});
messages.on('SAVE', () => {
  const code = editor.getValue();
  downloadFile(code, 'playground-output.html');
});
messages.on('LOAD', () => {
  promptForFile('.html, .htm, .svg, .xhtml, .mhtml')
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
document.getElementById('open-preview-btn').addEventListener('click', function() {
  const newTab = window.open();
  newTab.document.write(editor.getValue());
  newTab.document.close();
  if (!newTab.document.title) {
    newTab.document.title = 'HTML Preview';
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