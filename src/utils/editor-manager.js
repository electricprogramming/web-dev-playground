import CodeMirror from '/src/CodeMirror/codemirror.js';
const editors = new Proxy({}, {
  get: function(target, prop) {
    return target[prop] || null;
  },
  set: function(target, prop, val) {
    if (!(val instanceof CodeMirror)) throw new TypeError('Editor must be a valid CodeMirror instance');
    target[prop] = val;
  }
});
export default editors;