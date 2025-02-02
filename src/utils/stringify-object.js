export default function serializeObject(obj) {
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