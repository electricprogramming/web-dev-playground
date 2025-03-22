function createFunctionForConsole(func) {
  let funcStr = func.toString()
  if (funcStr.startsWith('function')) {
    funcStr = funcStr.slice(8).trimStart();
    const pre = document.createElement('pre');
    pre.style.fontStyle = 'italic';
    pre.style.color = 'white';
    const prefix = document.createElement('span');
    prefix.textContent = 'f ';
    prefix.style.color = '#f90';
    const rest = document.createElement('span');
    rest.textContent = funcStr;
    pre.append(prefix, rest);
    return pre;
  } else {
    const pre = document.createElement('pre');
    pre.textContent = funcStr;
    pre.style.fontStyle = 'italic';
    pre.style.color = 'white';
    return pre;
  }
}
function expandObject(obj, el) {
  if (typeof obj !== 'object') throw new Error('Object is not an element');
  if (Array.isArray(obj)) {

  } else {
    const entries = Object.entries(obj);
    const container = document.createElement('div');
    container.classList.add('object-foldable-inner');
    entries.forEach(([key, val]) => {
      const keyEl = document.createElement('span');
      keyEl.classList.add('object-key');
      if ((typeof val === 'object' || typeof val === 'function') && val !== null) {
        if (typeof val === 'function') {
          
        }
      } else {
        const valEl = document.createElement('span');
        switch (typeof val) {
          case 'number':
            valEl.classList.add('number');
            break;
          case 'bigint':
            valEl.classList.add('number');
            break;
          case 'boolean':
            valEl.classList.add('boolean');
            break;
          case 'undefined':
            valEl.classList.add('undefd');
            break;
          case 'object':
            if (val === null) valEl.classList.add('undefd');
            break;
        }
      }
    });
    el.classList.add('object-foldable-open');
  }
}
function collapseObject(obj, el) {

}