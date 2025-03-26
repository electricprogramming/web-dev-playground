import { minify_sync as _minifyJS } from './minify-js.js';
import settings from './settings.js';

export default function minifyJS(js_code) {
  return _minifyJS(js_code, settings);
}