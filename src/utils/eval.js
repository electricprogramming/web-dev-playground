import { setInterval, setTimeout } from './interval-timeout.js';
import modifiedConsole from './console.js';

/**
 * Evaluates a JavaScript string without context; uses custom console, setInterval, and setTimeout functions.
 * @param {string} code 
 * @returns {any}
 */
export function _eval(code) {
  const func = new Function(['setInterval', 'setTimeout', 'console', 'arguments'], `
    return eval(${JSON.stringify(code)});
  `);
  try {
    var res = func(setInterval, setTimeout, modifiedConsole, undefined);
  } catch (err) {
    modifiedConsole.error(`Uncaught ${err.toString()}`);
    var res = '';
  }
  return res;
}
/**
 * Evaluates a JavaScript string without context; uses custom console, setInterval, and setTimeout functions.
 * @param {string} code 
 * @returns {any}
 */
export function commandLineEval(code) {
  const func = new Function(['console', 'arguments'], `
    return eval(${JSON.stringify(code)});
  `);
  let res = {};
  try {
    res.result = func(modifiedConsole, undefined);
    res.isErrored = false;
  } catch (err) {
    modifiedConsole.error(`Uncaught ${err.toString()}`);
    res.result = '';
    res.isErrored = true;
  }
  return res;
}