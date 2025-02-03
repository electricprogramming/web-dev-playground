Object.prototype.forEach = function(callback, thisArg = undefined) {
  Object.entries(this).forEach(([key, value], index) => {
    callback.call(thisArg, key, value, index, this);
  });
}