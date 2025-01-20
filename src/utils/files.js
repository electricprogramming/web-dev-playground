/**
 * Downloads a file by text content
 * @param {string} content 
 * @param {string} fileName 
 */
export function downloadFile(content, fileName) {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
/**
 * Prompts the user for a file, then returns the file's content as text.
 * @returns {Promise<string>}
 */
export async function promptForFile(types) {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = types;
    input.onchange = function ({ target: { files: [file] } }) {
      if (!file) {
        return reject('No file selected.');
      }
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result);
        input = null; // allow garbage collection to free up memory used by the input element once it is unneeded.
      };
      reader.onerror = () => {
        reject('Error reading the file.');
      };
      reader.readAsText(file);
    };
    // trigger the file dialog
    input.click();
  });
}