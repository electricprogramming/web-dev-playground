/**
 * Clamps a number between a given min and max value
 * @param {number} value 
 * @param {number} min 
 * @param {number} max 
 * @returns {number}
 */
export default function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}