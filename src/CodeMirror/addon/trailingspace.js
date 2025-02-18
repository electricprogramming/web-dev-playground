/*
This code was modified by electricprogramming to work as an ESM module in
the context of this project without making CodeMirror a global object, as well as custom mods.
However, it no longer functions in an environment that does not support ESM.
*/

// Original code licensed as follows:

// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/5/LICENSE

import CodeMirror from '../codemirror.js';
(function(CodeMirror) {
  CodeMirror.defineOption("showTrailingSpace", false, function(cm, val, prev) {
    if (prev == CodeMirror.Init) prev = false;
    if (prev && !val)
      cm.removeOverlay("trailingspace");
    else if (!prev && val)
      cm.addOverlay({
        token: function(stream) {
          for (var l = stream.string.length, i = l; i && /\s/.test(stream.string.charAt(i - 1)); --i) {}
          if (i > stream.pos) { stream.pos = i; return null; }
          stream.pos = l;
          return "trailingspace";
        },
        name: "trailingspace"
      });
  });
})(CodeMirror);