// Creates setInterval and setTimeout functions that can be used within the _eval file so that intervals and timeouts
// created within the playground REPL using setInterval or setTimeout can be cleared each time the code is run.
const intervals = [], timeouts = [];
const ogInterval = setInterval, ogTimeout = setTimeout;
const newInterval = function(handler, timeout = undefined, ...args) {
  const id = ogInterval(handler, timeout, ...args);
  intervals.push(id);
  return id;
}
const newTimeout = function(handler, timeout = undefined, ...args) {
  const id = ogTimeout(handler, timeout, ...args);
  timeouts.push(id);
  return id;
}
const clearAllIntervals = function() {
  intervals.forEach(interval => clearInterval(interval));
}
const clearAllTimeouts = function() {
  timeouts.forEach(timeout => clearTimeout(timeout));
}
const clearAllIntervalsAndTimeouts = function() {
  clearAllIntervals(); clearAllTimeouts();
}
export {
  newInterval as setInterval,
  newTimeout as setTimeout,
  clearAllIntervals,
  clearAllTimeouts,
  clearAllIntervalsAndTimeouts
}