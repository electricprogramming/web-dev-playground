import { minify as _minifyJS } from './minify-js.js';
import _minifyHTML from './minify-html.js';
import settings from './settings.js';

async function minifyJS(code) {
  return new Promise((resolve, reject) => {
    _minifyJS(code, settings)
      .then(res => resolve(res.code))
      .catch(err => reject(err));
  });
}

async function minifyHTML(code) {
  return new Promise((resolve, reject) => {
    _minifyHTML(code, settings)
      .then(res => resolve(res))
      .catch(err => reject(err));
  });
}

