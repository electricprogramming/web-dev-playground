import editors from '../../utils/editor-manager.js';
import clamp from '../../utils/clamp.js';
import messages from '../../utils/messages.js';
import beautify from '../../js-beautify/index.js';
import { downloadFile, promptForFile } from '../../utils/files.js';
import CodeMirror from '../../CodeMirror/codemirror.js';

const editor = CodeMirror.fromTextArea(document.getElementById('editor-textarea'), {
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
      const formatted = beautify.html(original, beautify.settings);
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
editors.main = editor;

if (/* should 'editor' and 'CodeMirror' be globally available? */ 'Y') {
  window.editor = editor; window.CodeMirror = CodeMirror;
}

editor.element = editor.getWrapperElement();
editor.element.id = 'editor';
const findDialog = document.getElementById('find-dialog');
const findInput = document.getElementById('find-input');
const findCaseSensitiveCheck = document.getElementById('case-sensitive-check');
const findRegexCheck = document.getElementById('regex-check');
const replaceInput = document.getElementById('replace-input');
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
  editor.getAllMarks().forEach(mark => {
    if (!mark.__isFold) {
      mark.clear();
    }
  });
});
document.getElementById('find-dialog-close-btn').addEventListener('click', () => messages.broadcast('CLOSE_FIND_DIALOG'));
editor.element.addEventListener('click', () => {
  if (findDialog.style.display === 'block') {
    messages.broadcast('CLOSE_FIND_DIALOG')
  }
});