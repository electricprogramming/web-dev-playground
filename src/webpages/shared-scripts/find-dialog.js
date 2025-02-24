let searchCursor = null;

messages.on('TRIGGER_SEARCH', () => {
  const query = findRegexCheck.checked? strToRegex(findInput.value) : findInput.value;
  if (query) {
    searchCursor = editor.getSearchCursor(query, null, {
      caseFold: !findCaseSensitiveCheck.checked
    });
    editor.getAllMarks().forEach(mark => mark.clear());
    while (searchCursor.findNext()) {
      editor.markText(searchCursor.from(), searchCursor.to(), {
        className: 'cm-searching'
      });
    }
  }
});
findInput.addEventListener('input', () => messages.broadcast('TRIGGER_SEARCH'));
findInput.addEventListener('keydown', e => {
  if (e.code === 'Tab' || e.code === 'Enter') {
    e.preventDefault();
    replaceInput.focus();
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
      editor.getAllMarks().forEach(mark => mark.clear());
      editor.markText(searchCursor.from(), searchCursor.to(), {
        className: 'cm-searching-current'
      });
      editor.setCursor(searchCursor.from());
    }
  }
});
findNextBtn.addEventListener('click', function() {
  if (searchCursor && searchCursor.findNext()) {
    editor.getAllMarks().forEach(mark => mark.clear());
    editor.markText(searchCursor.from(), searchCursor.to(), {
      className: 'cm-searching-current'
    });
    editor.setCursor(searchCursor.from());
  } else {
    findFirstBtn.click();
  }
});
findPrevBtn.addEventListener('click', function() {
  if (searchCursor && searchCursor.findPrevious()) {
    editor.getAllMarks().forEach(mark => mark.clear());
    editor.markText(searchCursor.from(), searchCursor.to(), {
      className: 'cm-searching-current'
    });
    editor.setCursor(searchCursor.from());
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
      editor.getAllMarks().forEach(mark => mark.clear());
      while (searchCursor.findNext()) {}
      searchCursor.findPrevious();
      const from = searchCursor.from(), to = searchCursor.to();
      editor.markText(from, to, {
        className: 'cm-searching-current'
      });
      editor.setCursor(from);
    }
  }
});
replaceSingleBtn.addEventListener('click', function() {
  const replaceWith = replaceInput.value;
  if (searchCursor) {
    editor.replaceRange(replaceWith, searchCursor.from(), searchCursor.to());

    if (searchCursor && searchCursor.findNext()) {
      editor.getAllMarks().forEach(mark => mark.clear());
      editor.markText(searchCursor.from(), searchCursor.to(), {
        className: 'cm-searching-current'
      });
      editor.setCursor(searchCursor.from());
    } else {
      // Loop back to the beginning
      const query = findRegexCheck.checked? strToRegex(findInput.value) : findInput.value;
      if (query) {
        searchCursor = editor.getSearchCursor(query, null, {
          caseFold: !findCaseSensitiveCheck.checked
        });
        if (searchCursor.findNext()) {
          const from = searchCursor.from(), to = searchCursor.to();
          editor.getAllMarks().forEach(mark => mark.clear());
          editor.markText(from, to, {
            className: 'cm-searching-current'
          });
          editor.setCursor(from);
        }
      }
    }
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