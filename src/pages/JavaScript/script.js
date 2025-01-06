CodeMirror.fromTextArea(document.getElementById('editor'), {
  mode: 'javascript',
  lineNumbers: true,
  theme: 'material-ocean',
  tabSize: 2,
  indentUnit: 2,
  matchBrackets: true,
  autoCloseBrackets: true,
  lineWrapping: true
});
const editor = document.querySelector('.CodeMirror');
const console = document.getElementById('console');
window.addEventListener('resize', function() {
  const width = editor.style.width;
  console.style.width = window.innerWidth - width;
});