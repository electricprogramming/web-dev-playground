import CodeMirror from '../codemirror.js'
(function(CodeMirror) {

var rulerWidgets = [];
function addRulers(editor, frequency) {
  rulerWidgets.forEach(rulerWidget => {
    editor.removeLineWidget(rulerWidget);
  });
  let lineCount = editor.lineCount();
  let textHeight = editor.defaultTextHeight();
  let charWidth = editor.defaultCharWidth();

  for (let i = 0; i < lineCount; i++) {
    let lineLength = editor.getLine(i).length;

    for (let j = frequency; j <= lineLength; j += frequency) {
      let ruler = createRuler(j, charWidth, textHeight);
      rulerWidgets.push(editor.addLineWidget(i, ruler));
    }
  }
}

function createRuler(position, charWidth, textHeight) {
  let ruler = document.createElement('div');
  ruler.style.position = 'absolute';
  ruler.style.left = `${4 + (position * charWidth)}px`;
  ruler.style.bottom = 0;
  ruler.style.width = '1px';
  ruler.style.height = `${textHeight}px`;
  ruler.classList.add('CodeMirror-ruler');

  return ruler;
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