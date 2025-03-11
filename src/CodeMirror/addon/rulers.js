import CodeMirror from '../codemirror.js'
(function(CodeMirror) {

function addRulers(editor, frequency) {
  editor.getWrapperElement().querySelectorAll('.CodeMirror-ruler').forEach(ruler => ruler.parentNode.remove());
  let lineCount = editor.lineCount();
  let textHeight = editor.defaultTextHeight();
  let charWidth = editor.defaultCharWidth();

  for (let i = 0; i < lineCount; i++) {
    let lineLength = editor.getLine(i).length;

    for (let j = frequency; j <= lineLength; j += frequency) {
      let ruler = createRuler(j, charWidth, textHeight);
      editor.addLineWidget(i - 1, ruler);
    }
  }
}

function createRuler(position, charWidth, textHeight) {
  let ruler = document.createElement('div');
  ruler.style.position = 'absolute';
  ruler.style.left = `${4 + (position * charWidth)}px`;
  ruler.style.width = '1px';
  ruler.style.height = `${textHeight}px`;
  ruler.classList.add('CodeMirror-ruler');

  return ruler;
}

function getCharWidth(editor) {
  const editorEl = editor.getWrapperElement();
  const editorStyle = window.getComputedStyle(editorEl);
  let testChar = document.createElement('div');
  testChar.style.position = 'absolute';
  testChar.style.visibility = 'hidden';
  testChar.style.fontFamily = editorStyle.fontFamily || 'monospace';
  testChar.style.fontSize = editorStyle.fontSize || editor.defaultTextHeight();
  testChar.textContent = 'X';
  document.body.appendChild(testChar);
  let charWidth = testChar.offsetWidth;
  document.body.removeChild(testChar);
  return charWidth;
}

CodeMirror.defineOption('rulers', { on: false }, function(cm, val) {
  if (val?.on) {
    cm.on('change', function() {
      addRulers(cm, val.frequency || cm.options.indentUnit);
    });
    addRulers(cm, val.frequency || cm.options.indentUnit);
  }
});

})(CodeMirror);