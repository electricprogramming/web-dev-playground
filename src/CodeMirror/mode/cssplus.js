import CodeMirror from '../codemirror.js';
import './css.js';
(function(CodeMirror) {
"use strict";

CodeMirror.defineMode("cssplus", function(config, parserConfig) {
  // Get the base CSS mode
  var cssMode = CodeMirror.getMode(config, "css");

  // Define a new mode state to track nesting level
  function CssPlusState() {
      this.nestingLevel = 0;  // Track the level of nesting (braces)
      this.cssState = CodeMirror.startState(cssMode);  // Start the base CSS mode state
  }

  // Token function for handling nesting inside CSS
  function token(stream, state) {
      var ch = stream.next();

      // If it's an opening brace, increase nesting level
      if (ch === '{') {
          state.nestingLevel++;
          return "bracket";
      }

      // If it's a closing brace, decrease nesting level
      if (ch === '}') {
          state.nestingLevel--;
          return "bracket";
      }

      // If it's inside a nested rule, we pass control to the CSS mode
      if (state.nestingLevel > 0) {
          return cssMode.token(stream, state.cssState);
      }

      // Otherwise, handle the top-level CSS
      return cssMode.token(stream, state.cssState);
  }

  // Return the mode's state and token function
  return {
      startState: function() {
          return new CssPlusState();  // Initialize a new state
      },
      token: token,
      indent: cssMode.indent,  // Use the same indentation as CSS
      innerMode: function(state) {
          return {state: state.cssState, mode: cssMode};  // Provide the inner state for CSS
      }
  };
}, "css");

})()