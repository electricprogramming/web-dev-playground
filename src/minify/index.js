import { minify_sync as _minifyJS } from './minify-js.js';
import _minifyHTML from './minify-js.js';
import options from './options.js';

export function minifyJS(js_code) {
  return _minifyJS(js_code, options).code;
}

export async function minifyHTML(html_code) {
  return new Promise((resolve) => {
    _minifyHTML(html_code, options).then(code => {
      resolve(code);
    });
  });
}

export async function minifyCSS(css_code) {
  return new Promise((resolve) => {
    _minifyHTML(`<style>${css_code}</style>`, options).then(html => {
      resolve(html.slice(7, -8));
    });
  });
}