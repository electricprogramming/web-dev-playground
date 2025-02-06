/**
 * Converts a string to a regex from a single argument representing how the regex would be written out in plain code.
 * Useful when an input field is needed to represent a regex with flags.
 * @example
 * const str = '/hello(.+)world/i';
 * const regex = strToRegex(str);
 * /hello(.+)world/i
 *
 * @param {string} str 
 * @returns {RegExp}
 */
export default function strToRegex(str) {
  const pattern = str.slice(1, str.lastIndexOf('/'));
  const flags = str.slice(str.lastIndexOf('/') + 1);
  return new RegExp(pattern, flags);
}