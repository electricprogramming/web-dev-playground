import { setInterval, setTimeout } from './interval-timeout.js';
import console from './console.js';

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
    var res = func(setInterval, setTimeout, console);
  } catch (err) {
    const stack = err.stack;
    const match = stack.match(/\<anonymous\>:(\d+):(\d+)/);
    console.dir(match);
    console.error(`Uncaught ${err.toString()}`);
    var res = '';
  }
  return res;
}