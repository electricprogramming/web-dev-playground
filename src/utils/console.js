import stringifyObject from './stringify-object.js';
const newConsole = {...console};
function getAddlHtml(item) {
  if (item instanceof Error) {
    item = item.toString();
  }
  if (item instanceof RegExp) {
    return `<span class="regex">${
      item.toString()
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
    }</span>`
  }
  if (item === null) {
    return '<span class="undefd">null</span>';
  }
  if (typeof item === 'object') {
    try {
      item = stringifyObject(item, 2);
    } catch {
      item = String(item);
    }
  }
  if (typeof item === 'boolean') {
    return `<span class="boolean">${item}</span>`;
  }
  if (typeof item === 'number') {
    return `<span class="number">${item}</span>`;
  }
  if (typeof item === 'bigint') {
    return `<span class="number">${item}n</span>`
  }
  if (typeof item === 'undefined') {
    return '<span class="undefd">undefined</span>';
  }
  if (typeof item === 'function') {
    item = item.toString();
  }
  if (typeof item === 'symbol') {
    item = item.description;
  }
  if (typeof item === 'string') {
    return item
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('\\n', '<br>');
  }
}
function basicLog(type, data) {
  const log = document.createElement('div');
  log.classList.add(type);
  let htmlData = '';
  data.forEach((item, idx, {length}) => {
    htmlData += getAddlHtml(item);
    if (idx !== length - 1) {
      htmlData += '<div style="width: 2.5vh; height: 0; display: inline-block;"> </div>';
    }
  });
  log.innerHTML = htmlData;
  // window.top so that it runs in the console of the parent window if it is running in the html playground.
  window.top.document.getElementById('log-container').appendChild(log);
}
newConsole.log = function(...data) {
  basicLog('log', data);
};
newConsole.error = function(...data) {
  basicLog('error', data);
};
newConsole.warn = function(...data) {
  basicLog('warn', data);
};
newConsole.info = function(...data) {
  basicLog('info', data);
};
newConsole.clear = function() {
  document.getElementById('log-container').innerHTML = '';
};
export function logCommandLineResult(item) {
  basicLog('command-line-result', [item]);
};
export default newConsole;