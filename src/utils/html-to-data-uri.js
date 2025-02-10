/**
 * Converts an HTML text string to a Data URI encoding the html code.
 * @param {string} html 
 * @returns {string}
 */
export default function htmlToDataUri(html) {
  return `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
}