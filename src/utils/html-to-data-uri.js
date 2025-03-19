/**
 * Converts a string of HTML code to a Data URI encoding the HTML page.
 * @param {string} html 
 * @returns {string}
 */
export default function htmlToDataUri(html) {
  return `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
}