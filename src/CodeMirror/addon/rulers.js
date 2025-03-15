/*
This is not the original CodeMirror rulers.js addon. It is a custom addon made by electricprogramming,
specially designed for this project (although it may be modified) to display rulers every indent unit, but 
only in the leading whitespace of a line. However, support for tabs has not been tested, and it may not 
be backwards compatible with old versions of Internet Explorer (unlike some other parts of CodeMirror).
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
function clearRulers() {
  rulerWidgets.forEach(rulerWidget => {
    editor.removeLineWidget(rulerWidget);
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
function countLeadingWhitespace(str) {
  const match = str.match(/^(\s*)/);
  return match ? match[0].length : 0;
}
function countLeadingTabs(str) {
  const match = str.match(/^(\t*)/);  // Match leading tabs
  return match ? match[0].length : 0;
}

function addRulers(editor, frequency, isTabs) {
  clearRulers();
  let lineCount = editor.lineCount();
  let textHeight = editor.defaultTextHeight();
  let charWidth = editor.defaultCharWidth();

  for (let i = 0; i < lineCount; i++) {
    const line = editor.getLine(i);
    if (isAllWhitespace(line)) {
      let i$1 = 1;
      while (editor.getLine(i - i$1) === '') i$1 ++;
      const prevLine = editor.getLine(i - i$1);

      let i$2 = 1;
      while (editor.getLine(i + i$1) === '') i$2 ++;
      const nextLine = editor.getLine(i + i$2);

      let prevLineWhitespace, nextLineWhitespace;
      if (typeof prevLine === 'string' && !isAllWhitespace(prevLine)) {
        prevLineWhitespace = (isTabs? countLeadingTabs : countLeadingWhitespace)(prevLine);
      } else {
        prevLineWhitespace = 0;
      }
      if (typeof nextLine === 'string' && !isAllWhitespace(nextLine)) {
        nextLineWhitespace = (isTabs? countLeadingTabs : countLeadingWhitespace)(nextLine);
      } else {
        nextLineWhitespace = 0;
      }

      const whitespaceLength = Math.max(nextLineWhitespace, prevLineWhitespace);

      for (let j = 0; j < whitespaceLength; j += (isTabs? 1 : frequency)) {
        let ruler = createRuler(j, charWidth, textHeight);
        rulerWidgets.push(editor.addLineWidget(i, ruler, { above: true }));
      }
    } else {
      const whitespaceLength = (isTabs? countLeadingTabs : countLeadingWhitespace)(line);

      for (let j = 0; j < whitespaceLength; j += (isTabs? 1 : frequency)) {
        let ruler = createRuler(j, charWidth, textHeight);
        rulerWidgets.push(editor.addLineWidget(i, ruler, { above: true }));
      }
    }
  }
}

function unboundEventCallback() {
  addRulers(this, this?.options?.indentUnit || 2, this?.options?.indentWithTabs);
}

function createRuler(position, charWidth, textHeight) {
  let ruler = document.createElement('div');
  ruler.style.position = 'absolute';
  ruler.style.left = `${4 + (position * charWidth)}px`;
  ruler.style.height = `${textHeight}px`;
  ruler.classList.add('CodeMirror-ruler');

  return ruler;
}

CodeMirror.defineOption('rulers', false, function(cm, val, old) {
  if (old && old != CodeMirror.Init) {
    clearRulers();
    clearEventListeners();
  }
  if (val) {
    cm.refresh();
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
    const resizeObserver = new ResizeObserver(eventCallbackFunc);
    resizeObserver.observe(cm.getWrapperElement());
    eventListeners.push({
      type: "ResizeObserver",
      subtype: null,
      target: resizeObserver,
      func: null
    });

    addRulers(cm, cm.options.indentUnit || CodeMirror.defaults.indentUnit, cm.options.indentWithTabs);
  }
});

})(CodeMirror);