const editor = CodeMirror.fromTextArea(document.getElementById("js-editor"), {
  mode: "javascript",
  lineNumbers: true,
  theme: "material-ocean",
  tabSize: 2,
  indentUnit: 2,
  matchBrackets: true,
  autoCloseBrackets: true,
  lineWrapping: true
});
const console = document.getElementById('console');
editor.addEventListener('resize', function() {
  const width = this.style.width;
  console.style.width = window.innerWidth - this.style.width;
});