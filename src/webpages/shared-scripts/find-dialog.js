import editors from '../../utils/editor-manager.js';
const editor = editors.main;
import messages from '../../utils/messages.js';
import strToRegex from '../../utils/str-to-regex.js';
const findInput = document.getElementById('find-input');
const findCurrentResultNumberSpan = document.getElementById('find-current-result-number');
const findResultCountSpan = document.getElementById('find-result-count');
const findCaseSensitiveCheck = document.getElementById('case-sensitive-check');
const findRegexCheck = document.getElementById('regex-check');
const replaceInput = document.getElementById('replace-input');
const findFirstBtn = document.getElementById('find-first-btn');
const findNextBtn = document.getElementById('find-next-btn');
const findPrevBtn = document.getElementById('find-previous-btn');
const findLastBtn = document.getElementById('find-last-btn');
const replaceSingleBtn = document.getElementById('replace-single-btn');
const replaceAllBtn = document.getElementById('replace-all-btn');

let searchCursor = null;
let searchIndex = 0;

messages.on('TRIGGER_SEARCH', override => {
  const query = findRegexCheck.checked? strToRegex(findInput.value) : findInput.value;
  if (query) {
    searchCursor = editor.getSearchCursor(query, null, {
      caseFold: !findCaseSensitiveCheck.checked
    });
    editor.getAllMarks().forEach(mark => {
      if (!mark.__isFold) {
        mark.clear();
      }
    });
    const resultCount = searchCursor.resultCount;
    if (override || resultCount <= 50) {
      while (searchCursor.findNext()) {
        editor.markText(searchCursor.from(), searchCursor.to(), {
          className: 'cm-searching'
        });
      }
      searchCursor.reset();
    }
    searchIndex = 0;
    findCurrentResultNumberSpan.textContent = '0';
    findResultCountSpan.textContent = resultCount;
  } else {
    editor.getAllMarks().forEach(mark => {
      if (!mark.__isFold) {
        mark.clear();
      }
    });
  }
});
findInput.addEventListener('input', () => messages.broadcast('TRIGGER_SEARCH'));
findInput.addEventListener('keydown', e => {
  if (e.code === 'Tab' || e.code === 'Enter') {
    e.preventDefault();
    replaceInput.focus();
    messages.broadcast('TRIGGER_SEARCH', true);
  }
});
findCaseSensitiveCheck.addEventListener('input', () => messages.broadcast('TRIGGER_SEARCH'));
findRegexCheck.addEventListener('input', () => messages.broadcast('TRIGGER_SEARCH'));
findFirstBtn.addEventListener('click', function() {
  const query = findRegexCheck.checked? strToRegex(findInput.value) : findInput.value;
  if (query) {
    searchCursor = editor.getSearchCursor(query, null, {
      caseFold: !findCaseSensitiveCheck.checked
    });
    if (searchCursor.findNext()) {
      editor.getAllMarks().forEach(mark => {
        if (!mark.__isFold) {
          mark.clear();
        }
      });
      editor.markText(searchCursor.from(), searchCursor.to(), {
        className: 'cm-searching-current'
      });
      editor.scrollIntoView(searchCursor.from());
      editor.scrollIntoView(searchCursor.to());
      findCurrentResultNumberSpan.textContent = '1';
      findResultCountSpan.textContent = searchCursor.resultCount;
    }
  }
});
findNextBtn.addEventListener('click', function() {
  if (searchCursor && searchCursor.findNext()) {
    editor.getAllMarks().forEach(mark => {
      if (!mark.__isFold) {
        mark.clear();
      }
    });
    editor.markText(searchCursor.from(), searchCursor.to(), {
      className: 'cm-searching-current'
    });
    editor.scrollIntoView(searchCursor.from());
    editor.scrollIntoView(searchCursor.to());
    searchIndex ++;
    findCurrentResultNumberSpan.textContent = searchIndex;
    findResultCountSpan.textContent = searchCursor.resultCount;
  } else {
    findFirstBtn.click();
  }
});
findPrevBtn.addEventListener('click', function() {
  if (searchCursor && searchCursor.findPrevious()) {
    editor.getAllMarks().forEach(mark => {
      if (!mark.__isFold) {
        mark.clear();
      }
    });
    editor.markText(searchCursor.from(), searchCursor.to(), {
      className: 'cm-searching-current'
    });
    editor.scrollIntoView(searchCursor.from());
    editor.scrollIntoView(searchCursor.to());
    searchIndex --;
    findCurrentResultNumberSpan.textContent = searchIndex;
    findResultCountSpan.textContent = searchCursor.resultCount;
  } else {
    findLastBtn.click();
  }
});
findLastBtn.addEventListener('click', function() {
  const query = findRegexCheck.checked? strToRegex(findInput.value) : findInput.value;
  if (query) {
    searchCursor = editor.getSearchCursor(query, null, {
      caseFold: !findCaseSensitiveCheck.checked
    });
    if (searchCursor.findNext()) {
      editor.getAllMarks().forEach(mark => {
        if (!mark.__isFold) {
          mark.clear();
        }
      });
      while (searchCursor.findNext()) {}
      searchCursor.findPrevious();
      const from = searchCursor.from(), to = searchCursor.to();
      editor.markText(from, to, {
        className: 'cm-searching-current'
      });
      editor.scrollIntoView(from);
      editor.scrollIntoView(to);
      findCurrentResultNumberSpan.textContent = searchCursor.resultCount;
      findResultCountSpan.textContent = searchCursor.resultCount;
    }
  }
});
replaceSingleBtn.addEventListener('click', function() {
  const replaceWith = replaceInput.value;
  if (searchCursor && searchCursor.from() && searchCursor.to()) {
    editor.replaceRange(replaceWith, searchCursor.from(), searchCursor.to());
    findNextBtn.click();
  }
});
replaceAllBtn.addEventListener('click', function() {
  const query = findRegexCheck.checked? strToRegex(findInput.value) : findInput.value;
  const cursor = editor.getSearchCursor(query, null, {
    caseFold: !findCaseSensitiveCheck.checked
  });
  const replaceWith = replaceInput.value;
  editor.operation(() => {
    const cursorPosition = editor.getCursor();
    if (cursor.findNext()) {
      editor.setSelection(cursor.from(), cursor.to());
      while (cursor.findNext()) {
        editor.addSelection(cursor.from(), cursor.to());
      }
      if (findRegexCheck.checked) {
        editor.replaceSelection(str => {
          return str.replace(strToRegex(findInput.value), replaceWith);
        });
      } else {
        editor.replaceSelection(replaceWith);
      }
      editor.setSelection(cursorPosition, cursorPosition);
    }
  });
});