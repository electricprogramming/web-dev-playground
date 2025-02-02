const
  ogLog = console.log,
  ogError = console.error,
  ogWarn = console.warn,
  ogInfo = console.info,
  ogClear = console.clear;
const newConsole = {...console};
newConsole.log = function(...data) {
  const log = document.createElement('div');
  log.classList.add('log');
  let htmlData = '';
  data.forEach((item, idx, {length}) => {
    function getAddlHtml() {
      if (item instanceof Error) {
        item = item.toString();
      }
      if (item === null) {
        return '<span class="undefd">null</span>';
      }
      if (typeof item === 'object') {
        try {
          item = JSON.stringify(item, null, 2);
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
          .replaceAll('\\n', '<br>');
      }
    }
    htmlData += getAddlHtml();
    if (idx !== length - 1) {
      htmlData += '<div style="width: 2.5vh; height: 0; display: inline-block;"> </div>';
    }
  });
  log.innerHTML = htmlData;
  document.getElementById('console').appendChild(log);
}
newConsole.error = function(...data) {
  const err = document.createElement('div');
  err.classList.add('error');
  let htmlData = '';
  data.forEach((item, idx, {length}) => {
    function getAddlHtml() {
      if (item instanceof Error) {
        item = item.toString();
      }
      if (item === null) {
        return '<span class="undefd">null</span>';
      }
      if (typeof item === 'object') {
        try {
          item = JSON.stringify(item, null, 2);
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
          .replaceAll('\\n', '<br>');
      }
    }
    htmlData += getAddlHtml();
    if (idx !== length - 1) {
      htmlData += '<div style="width: 2.5vh; height: 0; display: inline-block;"> </div>';
    }
  });
  err.innerHTML = htmlData;
  document.getElementById('console').appendChild(err);
}
newConsole.warn = function(...data) {
  const warn = document.createElement('div');
  warn.classList.add('warn');
  let htmlData = '';
  data.forEach((item, idx, {length}) => {
    function getAddlHtml() {
      if (item instanceof Error) {
        item = item.toString();
      }
      if (item === null) {
        return '<span class="undefd">null</span>';
      }
      if (typeof item === 'object') {
        try {
          item = JSON.stringify(item, null, 2);
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
          .replaceAll('\\n', '<br>');
      }
    }
    htmlData += getAddlHtml();
    if (idx !== length - 1) {
      htmlData += '<div style="width: 2.5vh; height: 0; display: inline-block;"> </div>';
    }
  });
  warn.innerHTML = htmlData;
  document.getElementById('console').appendChild(warn);
}
newConsole.info = function(...data) {
  const info = document.createElement('div');
  info.classList.add('info');
  let htmlData = '';
  data.forEach((item, idx, {length}) => {
    function getAddlHtml() {
      if (item instanceof Error) {
        item = item.toString();
      }
      if (item === null) {
        return '<span class="undefd">null</span>';
      }
      if (typeof item === 'object') {
        try {
          item = JSON.stringify(item, null, 2);
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
          .replaceAll('\\n', '<br>');
      }
    }
    htmlData += getAddlHtml();
    if (idx !== length - 1) {
      htmlData += '<div style="width: 2.5vh; height: 0; display: inline-block;"> </div>';
    }
  });
  info.innerHTML = htmlData;
  document.getElementById('console').appendChild(info);
}
newConsole.clear = function() {
  document.getElementById('console').innerHTML = '';
}
export default newConsole;