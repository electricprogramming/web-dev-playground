import stringifyObject from './stringify-object.js';
const newConsole = {...console};
function getAddlHtml(item) {
  if (item instanceof Error) {
    item = item.toString();
  }
  if (item instanceof RegExp) {
    return `<span class="regex">${
      item.toString()
        .replaceAll('<', '&lt;')
        .replaceAll('&', '&amp;')
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
      .replaceAll('<', '&lt;')
      .replaceAll('&', '&amp;')
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
  document.getElementById('console').appendChild(log);
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
  document.getElementById('console').innerHTML = '';
};
export default newConsole;