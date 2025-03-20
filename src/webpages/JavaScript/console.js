function expandObject(obj, el) {
  if (typeof obj !== 'object') throw new Error('Object is not an element');
  if (Array.isArray(obj)) {
    
  } else {
    const entries = Object.entries(obj);
    const container = document.createElement('div');
    container.classList.add('object-foldable-inner');
    entries.forEach(([key, value]) => {
      const keyEl = document.createElement('span');
      keyEl.classList.add('object-key');
      
    });
    el.classList.add('object-foldable-open');
  }
}
function collapseObject(obj, el) {

}