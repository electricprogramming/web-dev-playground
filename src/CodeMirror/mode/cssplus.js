import CodeMirror from '../codemirror.js';
import './css.js';

(function(CodeMirror) {
'use strict';

CodeMirror.defineMode("cssplus", function(config, parserConfig) {
  var cssMode = CodeMirror.getMode(config, "css"); // Use the built-in CSS mode

  // Helper function to handle selector tokens (IDs, classes, elements)
  function tokenSelector(stream) {
      var ch = stream.peek();

      if (ch === "#") { // ID selector
          stream.next();
          while (stream.peek() && /[\w\-_]/.test(stream.peek())) {
              stream.next();
          }
          return "atom"; // ID is an 'atom' in CSS
      }

      if (ch === ".") { // Class selector
          stream.next();
          while (stream.peek() && /[\w\-_]/.test(stream.peek())) {
              stream.next();
          }
          return "keyword"; // Class is a 'keyword' in CSS
      }

      if (/[a-zA-Z]/.test(ch)) { // Element selector
          while (stream.peek() && /[\w\-_]/.test(stream.peek())) {
              stream.next();
          }
          return "tag"; // Element is a 'tag'
      }

      return null;
  }

  // Handle nested blocks and selector matching
  function token(stream, state) {
      var ch = stream.peek();

      // Skip over whitespace
      if (/\s/.test(ch)) {
          stream.next();
          return null;
      }

      // Handle comments (ignore comments entirely)
      if (ch === "/" && stream.peek(1) === "*") {
          stream.skipTo("*/");
          stream.next();
          return "comment";
      }

      // Handle selectors (element, class, id)
      if (ch === "#" || ch === "." || /[a-zA-Z]/.test(ch)) {
          return tokenSelector(stream);
      }

      // Handle nested curly braces
      if (ch === "{") {
          state.nestingLevel++;
          return "bracket";
      }
      if (ch === "}") {
          state.nestingLevel--;
          return "bracket";
      }

      // Default: delegate to base CSS mode for properties and values
      return cssMode.token(stream, state.cssState);
  }

  // Function to initialize the state (track nesting level and CSS state)
  function startState() {
      return {
          nestingLevel: 0,
          cssState: CodeMirror.startState(cssMode)
      };
  }

  return {
      startState: startState,
      token: token,
      indent: cssMode.indent,  // Use the same indentation as CSS
      innerMode: function(state) {
          return {state: state.cssState, mode: cssMode}; // Provide the inner state for CSS
      }
  };
}, "css");

})(CodeMirror);