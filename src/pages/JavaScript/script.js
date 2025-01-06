const editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
  mode: 'javascript',
  lineNumbers: true,
  theme: 'material-ocean',
  tabSize: 2,
  indentUnit: 2,
  matchBrackets: true,
  autoCloseBrackets: true,
  lineWrapping: true
});
const console = document.getElementById('console');
editor.getTextArea().addEventListener('resize', function() {
  const width = editor.style.width;
  console.style.width = window.innerWidth - width;
});