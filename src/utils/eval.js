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
            return \`<span class="boolean">\${item}</span>\`;
          }
          if (typeof item === 'number') {
            return \`<span class="number">\${item}</span>\`;
          }
          if (typeof item === 'bigint') {
            return \`<span class="number">\${item}n</span>\`
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
      htmlData = htmlData.slice(0, -2);
      log.innerHTML = htmlData;
      document.getElementById('console').appendChild(log);
    }
    console.error = function(...data) {
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
            return \`<span class="boolean">\${item}</span>\`;
          }
          if (typeof item === 'number') {
            return \`<span class="number">\${item}</span>\`;
          }
          if (typeof item === 'bigint') {
            return \`<span class="number">\${item}n</span>\`
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
      htmlData = htmlData.slice(0, -2);
      err.innerHTML = htmlData;
      document.getElementById('console').appendChild(err);
    }
    console.warn = function(...data) {
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
            return \`<span class="boolean">\${item}</span>\`;
          }
          if (typeof item === 'number') {
            return \`<span class="number">\${item}</span>\`;
          }
          if (typeof item === 'bigint') {
            return \`<span class="number">\${item}n</span>\`
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
      htmlData = htmlData.slice(0, -2);
      warn.innerHTML = htmlData;
      document.getElementById('console').appendChild(warn);
    }
    console.info = function(...data) {
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
            return \`<span class="boolean">\${item}</span>\`;
          }
          if (typeof item === 'number') {
            return \`<span class="number">\${item}</span>\`;
          }
          if (typeof item === 'bigint') {
            return \`<span class="number">\${item}n</span>\`
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
      htmlData = htmlData.slice(0, -2);
      info.innerHTML = htmlData;
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