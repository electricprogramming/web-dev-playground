/*
This is not the original CodeMirror rulers.js addon. It is a custom addon designed by electricprogramming,
specifically for this project (although it may be modified) to display rulers every indent unit, but only
in the leading whitespace of a line. However, support for tabs has not been fully tested, and this addon may
not be backwards compatible with old versions of Internet Explorer (unlike some other parts of CodeMirror).
*/

/*
This software is dedicated to the public domain via the Unlicense, as follows:

This is free and unencumbered software released into the public domain.

Anyone is free to copy, modify, publish, use, compile, sell, or
distribute this software, either in source code form or as a compiled
binary, for any purpose, commercial or non-commercial, and by any
means.

In jurisdictions that recognize copyright laws, the author or authors
of this software dedicate any and all copyright interest in the
software to the public domain. We make this dedication for the benefit
of the public at large and to the detriment of our heirs and
successors. We intend this dedication to be an overt act of
relinquishment in perpetuity of all present and future rights to this
software under copyright law.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/

import CodeMirror from '../codemirror.js';
(function(CodeMirror) {

var rulerWidgets = [];
function clearRulers(cm) {
  rulerWidgets.forEach(rulerWidget => {
    cm.removeLineWidget(rulerWidget);
  });
}

/** 
 * Stores a list of event listeners attached to various objects so that they can be removed later.
 * @type {{ type: "CodeMirror" | "ResizeObserver", subtype: String | null, target: CodeMirror | ResizeObserver, func: Function | null }[]}
 */
var eventListeners = [];
function clearEventListeners() {
  eventListeners.forEach(listener => {
    switch(listener.type) {
      case "CodeMirror":
        listener.target.off(listener.subtype, listener.func);
        break;
      case "ResizeObserver":
        listener.target.disconnect();
    }
  })
}

function isAllWhitespace(str) {
  return !/\S/.test(str);
}
function countLeadingWhitespace(str, tabSize) {
  const match = str.match(/^(\s*)/);
  return match ? match[0].replaceAll('\t', ' '.repeat(tabSize)).length : 0;
}

function getWhitespaceLength(line, lineIndex, lines, tabSize) {
  if (!isAllWhitespace(line)) {
    return countLeadingWhitespace(line, tabSize);
  }

  let x = 1;
  while (typeof lines[lineIndex - x] === 'string' && isAllWhitespace(lines[lineIndex - x])) x++;
  const prevLine = lines[lineIndex - x];

  let y = 1;
  while (typeof lines[lineIndex + y] === 'string' && isAllWhitespace(lines[lineIndex + y])) y++;
  const nextLine = lines[lineIndex + y];

  if (prevLine && nextLine) {
    return Math.max(countLeadingWhitespace(prevLine, tabSize), countLeadingWhitespace(nextLine, tabSize));
  } else {
    return 0;
  }
}
function addRulers(cm, frequency) {
  clearRulers(cm);
  const lineCount = cm.lineCount();
  
  cm.display.cachedTextHeight = null;
  cm.display.cachedCharWidth = null;
  const textHeight = cm.defaultTextHeight();
  const charWidth = cm.defaultCharWidth();
  const lines = Array.from({ length: lineCount }, (_, index) => cm.getLine(index));

  for (let i = 0; i < lineCount; i++) {
    const line = lines[i];
    const whitespaceLength = getWhitespaceLength(
      line, i, lines,
      cm.options.tabSize || CodeMirror.defaults.tabSize
    );

    for (let j = 0; j < whitespaceLength; j += frequency) {
      let ruler = createRuler(j, charWidth, textHeight, cm.options.direction === 'rtl');
      rulerWidgets.push(cm.addLineWidget(i, ruler, { above: true }));
    }
  }
}

function unboundEventCallback() {
  addRulers(
    this,
    this?.options?.indentWithTabs ?
    (this?.options?.tabSize || CodeMirror.defaults.tabSize) :
    (this?.options?.indentUnit || CodeMirror.defaults.indentUnit)
  );
}

function createRuler(position, charWidth, textHeight, rtl) {
  let ruler = document.createElement('div');
  ruler.style.position = 'absolute';
  ruler.style[rtl ? 'right' : 'left'] = `${4 + (position * charWidth)}px`;
  ruler.style.height = `${textHeight}px`;
  ruler.classList.add('CodeMirror-ruler');

  return ruler;
}

CodeMirror.defineOption('rulers', false, function(cm, val, old) {
  if (old && old != CodeMirror.Init) {
    clearRulers(cm);
    clearEventListeners();
  }
  if (val) {
    const eventCallbackFunc = unboundEventCallback.bind(cm);

    // Redraw rulers on editor change
    cm.on('change', eventCallbackFunc);
    eventListeners.push({
      type: "CodeMirror",
      subtype: 'change',
      target: cm,
      func: eventCallbackFunc
    });

    // Redraw rulers on editor resize
    /*
    const resizeObserver = new ResizeObserver(eventCallbackFunc);
    resizeObserver.observe(cm.getWrapperElement());
    eventListeners.push({
      type: "ResizeObserver",
      subtype: null,
      target: resizeObserver,
      func: null
    });*/

    addRulers(
      cm,
      cm.options.indentWithTabs ?
      (cm.options.tabSize || CodeMirror.defaults.tabSize) :
      (cm.options.indentUnit || CodeMirror.defaults.indentUnit)
    );
  }
});

})(CodeMirror);