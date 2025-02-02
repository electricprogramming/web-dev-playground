/**
 * Stringifies an object (similar to JSON.stringify()), with added support for functions in values.
 * @param {Object} obj 
 * @param {number} spaces 
 * @returns 
 */
export default function stringifyObject(obj, spaces = 0) {
  if (typeof obj !== 'object') throw new TypeError('First argument must be an object');
  const funcMarker = '__FUNCTION__';
  const stringified = JSON.stringify(obj, (key, value) => {
    if (typeof value === 'function') {
      return `${funcMarker}${value.toString()}`;
    } else if (typeof value === 'string' && value.startsWith('__FUNCTION__')) {
      value = '\\' + value;
    }
    return value;
  }, spaces);
  const res = stringified
    .replaceAll(/(?<!\\)": (?<!\\)"__FUNCTION__(.*?)(?<!\\)"/gs, '": $1')
    .replaceAll(/(?<!\\)"\\\\__FUNCTION__/g, '"__FUNCTION__')
    // anonymous function
    .replaceAll(/(?<!\\)"(.*?)(?<!\\)": function(.*)/g, (match, key, func) => {
      return `"${key}": function${
        func
          .replaceAll('\\n', '\n')
          .replaceAll('\\\\', '\\')
          .replaceAll('\\"', '"')
      }`
    })
    // arrow function
    .replaceAll(/(?<!\\)"(.*?)(?<!\\)": (.*?)=> (.*)/g, (match, key, args, func) => {
      return `"${key}": ${args}=> ${
        func
          .replaceAll('\\n', '\n')
          .replaceAll('\\\\', '\\')
          .replaceAll('\\"', '"')
      }`
    });
  return res;
}