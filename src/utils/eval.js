import { setInterval, setTimeout } from './interval-timeout.js';
import modifiedConsole from './console.js';

/**
 * Evaluates a JavaScript string without context; uses custom console, setInterval, and setTimeout functions.
 * @param {string} code 
 * @returns {any}
 */
export default function _eval(code) {
  const func = new Function(['setInterval', 'setTimeout', 'console'], `
    return eval(${JSON.stringify(code)});
  `);
  try {
    var res = func(setInterval, setTimeout, modifiedConsole);
  } catch (err) {
    const stack = err.stack;
    console.dir(stack);
    const match = stack.match(/\<anonymous\>:(\d+):(\d+)/);
    const [, line, char] = match;
    console.error(`Uncaught ${err.toString()} at ${line}:${char}`);
    var res = '';
  }
  return res;
}