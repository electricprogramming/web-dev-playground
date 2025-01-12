/**
 * Evaluates a JavaScript string without context.
 * @param {string} code 
 * @returns {any}
 */
export default function _eval(code) {
  const func = new Function(`
    console.log = function(...data) {
      const log = document.createElement('div');
      log.classList.add('log');
      text = data.join('  ');
      log.innerHTML = text
        .replaceAll('\\n', '<br>')
        .replaceAll('<', '&lt;');
      document.getElementById('console').appendChild(log);
    }
    console.error = function(...data) {
      const err = document.createElement('div');
      err.classList.add('error');
      text = data.join('  ');
      err.innerHTML = text
        .replaceAll('\\n', '<br>')
        .replaceAll('<', '&lt;');
      document.getElementById('console').appendChild(err);
    }
    console.warn = function(...data) {
      const warn = document.createElement('div');
      warn.classList.add('warn');
      text = data.join('  ');
      warn.innerHTML = text
        .replaceAll('\\n', '<br>')
        .replaceAll('<', '&lt;');
      document.getElementById('console').appendChild(warn);
    }
    console.info = function(...data) {
      const info = document.createElement('div');
      info.classList.add('info');
      text = data.join('  ');
      info.innerHTML = text
        .replaceAll('\\n', '<br>')
        .replaceAll('<', '&lt;');
      document.getElementById('console').appendChild(info);
    }
    return eval(${JSON.stringify(code)});
  `);
  try {
    var res = func();
  } catch (err) {
    console.error(err);
    var res = '';
  }
  return res;
}