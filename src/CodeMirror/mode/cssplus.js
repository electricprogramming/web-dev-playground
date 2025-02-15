import CodeMirror from '../codemirror.js';
import './css.js';

(function(CodeMirror) {
'use strict';

CodeMirror.defineMode("cssplus", function(config, parserConfig) {
  var cssMode = CodeMirror.getMode(config, "css"); // Use the built-in CSS mode

  // Helper function to handle selector tokens (IDs, classes, elements)
  function tokenSelector(stream) {
      var ch = stream.peek();

      // Handle ID selectors (starts with #)
      if (ch === "#") {
          stream.next(); // Consume '#'
          while (stream.peek() && /[\w\-_]/.test(stream.peek())) {
              stream.next(); // Consume the characters in the ID selector
          }
          return "atom"; // Return 'atom' token for IDs
      }

      // Handle class selectors (starts with .)
      if (ch === ".") {
          stream.next(); // Consume '.'
          while (stream.peek() && /[\w\-_]/.test(stream.peek())) {
              stream.next(); // Consume the characters in the class selector
          }
          return "keyword"; // Return 'keyword' token for classes
      }

      // Handle element selectors (alphanumeric characters)
      if (/[a-zA-Z]/.test(ch)) {
          while (stream.peek() && /[\w\-_]/.test(stream.peek())) {
              stream.next(); // Consume the characters in the element selector
          }
          return "tag"; // Return 'tag' token for elements
      }

      return null; // If no match, return null to pass on to the next handler
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
          return "comment"; // Return 'comment' token for comments
      }

      // Handle selectors (element, class, id)
      if (ch === "#" || ch === "." || /[a-zA-Z]/.test(ch)) {
          return tokenSelector(stream); // Handle the selector tokens
      }

      // Handle nested curly braces
      if (ch === "{") {
          state.nestingLevel++;
          stream.next(); // Consume '{'
          return "bracket"; // Return 'bracket' token for opening brace
      }
      if (ch === "}") {
          state.nestingLevel--;
          stream.next(); // Consume '}'
          return "bracket"; // Return 'bracket' token for closing brace
      }

      // Default: delegate to base CSS mode for properties and values
      return cssMode.token(stream, state.cssState);
  }

  // Define the indent function for your custom mode
  function indent(state, textAfter) {
      return cssMode.indent(state.cssState, textAfter);
  }

  // Function to initialize the state (track nesting level and CSS state)
  function startState() {
      return {
          nestingLevel: 0,
          cssState: CodeMirror.startState(cssMode) // Start the base CSS state
      };
  }

  return {
      startState: startState,
      token: token,
      indent: indent,  // Define the indent function here
      innerMode: function(state) {
          return {state: state.cssState, mode: cssMode}; // Provide the inner state for CSS
      }
  };
}, "css");

})(CodeMirror);