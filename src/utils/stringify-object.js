// WORKING STILL; KEEP ON GOING
function stringifyObject(obj) {
  const funcMarker = '__FUNCTION__';
  const stringified = JSON.stringify(obj, (key, value) => {
    if (typeof value === 'function') {
      return `${funcMarker}${value.toString()}`;
    } else if (typeof value === 'string' && value.startsWith('__FUNCTION__')) {
      value = '\\' + value;
    }
    return value;
  }, 2);
  const res = stringified
    .replaceAll(/(?<!\\)"\\\\__FUNCTION__/g, '"__FUNCTION__')
    .replaceAll()
    .replaceAll(/(?<!\\)"__FUNCTION__(.*?)(?<!\\)"/gs, '$1')
  return res;
}
const obj = {
  name: "__FUNCTION__abc",
  greet: function() { return "Hello, " + this.name; },
  age: 30
};

const serialized = stringifyObject(obj);
console.log(serialized);