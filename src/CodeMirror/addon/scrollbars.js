/*
This code was modified by electricprogramming to work as an ESM module in the
context of this project without making CodeMirror a global object, as well as
making the associated css file unneeded by injecting the css into the document.
However, it no longer functions in an environment that does not support ESM.
*/

// Original code licensed as follows:

// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/5/LICENSE

import CodeMirror from '../codemirror.js';
(function(CodeMirror) {
  "use strict";

  class Bar {
    constructor(cls, orientation, scroll) {
      this.orientation = orientation;
      this.scroll = scroll;
      this.screen = this.total = this.size = 1;
      this.pos = 0;

      this.node = document.createElement("div");
      this.node.className = cls + "-" + orientation;
      this.inner = this.node.appendChild(document.createElement("div"));

      var self = this;
      CodeMirror.on(this.inner, "mousedown", function (e) {
        if (e.which != 1) return;
        CodeMirror.e_preventDefault(e);
        var axis = self.orientation == "horizontal" ? "pageX" : "pageY";
        var start = e[axis], startpos = self.pos;
        function done() {
          CodeMirror.off(document, "mousemove", move);
          CodeMirror.off(document, "mouseup", done);
        }
        function move(e) {
          if (e.which != 1) return done();
          self.moveTo(startpos + (e[axis] - start) * (self.total / self.size));
        }
        CodeMirror.on(document, "mousemove", move);
        CodeMirror.on(document, "mouseup", done);
      });

      CodeMirror.on(this.node, "click", function (e) {
        CodeMirror.e_preventDefault(e);
        var innerBox = self.inner.getBoundingClientRect(), where;
        if (self.orientation == "horizontal")
          where = e.clientX < innerBox.left ? -1 : e.clientX > innerBox.right ? 1 : 0;

        else
          where = e.clientY < innerBox.top ? -1 : e.clientY > innerBox.bottom ? 1 : 0;
        self.moveTo(self.pos + where * self.screen);
      });

      function onWheel(e) {
        var moved = CodeMirror.wheelEventPixels(e)[self.orientation == "horizontal" ? "x" : "y"];
        var oldPos = self.pos;
        self.moveTo(self.pos + moved);
        if (self.pos != oldPos) CodeMirror.e_preventDefault(e);
      }
      CodeMirror.on(this.node, "mousewheel", onWheel);
      CodeMirror.on(this.node, "DOMMouseScroll", onWheel);
    }
    setPos(pos, force) {
      if (pos < 0) pos = 0;
      if (pos > this.total - this.screen) pos = this.total - this.screen;
      if (!force && pos == this.pos) return false;
      this.pos = pos;
      this.inner.style[this.orientation == "horizontal" ? "left" : "top"] =
        (pos * (this.size / this.total)) + "px";
      return true;
    }
    moveTo(pos) {
      if (this.setPos(pos)) this.scroll(pos, this.orientation);
    }
    update(scrollSize, clientSize, barSize) {
      var sizeChanged = this.screen != clientSize || this.total != scrollSize || this.size != barSize;
      if (sizeChanged) {
        this.screen = clientSize;
        this.total = scrollSize;
        this.size = barSize;
      }

      var buttonSize = this.screen * (this.size / this.total);
      if (buttonSize < minButtonSize) {
        this.size -= minButtonSize - buttonSize;
        buttonSize = minButtonSize;
      }
      this.inner.style[this.orientation == "horizontal" ? "width" : "height"] =
        buttonSize + "px";
      this.setPos(this.pos, sizeChanged);
    }
  }

  var minButtonSize = 10;

  class SimpleScrollbars {
    constructor(cls, place, scroll) {
      this.addClass = cls;
      this.horiz = new Bar(cls, "horizontal", scroll);
      place(this.horiz.node);
      this.vert = new Bar(cls, "vertical", scroll);
      place(this.vert.node);
      this.width = null;
    }
    update(measure) {
      if (this.width == null) {
        var style = window.getComputedStyle ? window.getComputedStyle(this.horiz.node) : this.horiz.node.currentStyle;
        if (style) this.width = parseInt(style.height);
      }
      var width = this.width || 0;

      var needsH = measure.scrollWidth > measure.clientWidth + 1;
      var needsV = measure.scrollHeight > measure.clientHeight + 1;
      this.vert.node.style.display = needsV ? "block" : "none";
      this.horiz.node.style.display = needsH ? "block" : "none";

      if (needsV) {
        this.vert.update(measure.scrollHeight, measure.clientHeight,
          measure.viewHeight - (needsH ? width : 0));
        this.vert.node.style.bottom = needsH ? width + "px" : "0";
      }
      if (needsH) {
        this.horiz.update(measure.scrollWidth, measure.clientWidth,
          measure.viewWidth - (needsV ? width : 0) - measure.barLeft);
        this.horiz.node.style.right = needsV ? width + "px" : "0";
        this.horiz.node.style.left = measure.barLeft + "px";
      }

      return { right: needsV ? width : 0, bottom: needsH ? width : 0 };
    }
    setScrollTop(pos) {
      this.vert.setPos(pos);
    }
    setScrollLeft(pos) {
      this.horiz.setPos(pos);
    }
    clear() {
      var parent = this.horiz.node.parentNode;
      parent.removeChild(this.horiz.node);
      parent.removeChild(this.vert.node);
    }
  }

  CodeMirror.scrollbarModel.simple = function(place, scroll) {
    return new SimpleScrollbars("CodeMirror-simplescroll", place, scroll);
  };
  CodeMirror.scrollbarModel.overlay = function(place, scroll) {
    return new SimpleScrollbars("CodeMirror-overlayscroll", place, scroll);
  };
  
  // inject the css file into the document
  const s = document.createElement('style');
  s.textContent = `
  .CodeMirror-simplescroll-horizontal div, .CodeMirror-simplescroll-vertical div {
    position: absolute;
    background: #ccc;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
    border: 1px solid #bbb;
    border-radius: 0px;
  }

  .CodeMirror-simplescroll-horizontal, .CodeMirror-simplescroll-vertical {
    position: absolute;
    z-index: 6;
    background: #eee;
  }

  .CodeMirror-simplescroll-horizontal {
    bottom: 0; left: 0;
    height: 8px;
  }
  .CodeMirror-simplescroll-horizontal div {
    bottom: 0;
    height: 100%;
  }

  .CodeMirror-simplescroll-vertical {
    right: 0; top: 0;
    width: 8px;
  }
  .CodeMirror-simplescroll-vertical div {
    right: 0;
    width: 100%;
  }


  .CodeMirror-overlayscroll .CodeMirror-scrollbar-filler, .CodeMirror-overlayscroll .CodeMirror-gutter-filler {
    display: none;
  }

  .CodeMirror-overlayscroll-horizontal div, .CodeMirror-overlayscroll-vertical div {
    position: absolute;
    background: #bcd;
    border-radius: 0px;
  }

  .CodeMirror-overlayscroll-horizontal, .CodeMirror-overlayscroll-vertical {
    position: absolute;
    z-index: 6;
  }

  .CodeMirror-overlayscroll-horizontal {
    bottom: 0; left: 0;
    height: 6px;
  }
  .CodeMirror-overlayscroll-horizontal div {
    bottom: 0;
    height: 100%;
  }

  .CodeMirror-overlayscroll-vertical {
    right: 0; top: 0;
    width: 6px;
  }
  .CodeMirror-overlayscroll-vertical div {
    right: 0;
    width: 100%;
  }`;
  document.head.appendChild(s);
})(CodeMirror);