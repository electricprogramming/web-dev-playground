class messageSystem {
  #handlers;
  constructor() {
    this.#handlers = [];
  }
  get handlers() {
    return this.#handlers.map(({ messageName, handler }) => ({ messageName, handler }));
  }
  /**
   * Creates a handler for a specified message.
   * @param {string} messageName 
   * @param {function} handler 
   * @param {number} count 
   * @returns {boolean}
   */
  on(messageName, handler, count) {
    if (messageName == null) return false;
    messageName = String(messageName);
    if (typeof handler !== 'function') return false;
    const func = handler.bind(globalThis);
    const res = { messageName, func };
    if (count && typeof count === 'number') {
      res.maxCount = count;
      res.currentCount = 0;
    }
    this.#handlers.push(res);
    return true;
  }
  /**
   * Calls a specified message, while optionally sending args to the handler(s).
   * @param {string} message 
   * @param  {...any} args 
   * @returns {boolean}
   */
  broadcast(message, ...args) {
    if (typeof message !== 'string') return false;
    let flag = false;
    this.#handlers.forEach((handler, handlerIndex) => {
      if (handler.messageName === message) {
        flag = true;
        try {
          handler.func(...args);
        } catch (e) {
          console.error(`Error while handling message ${JSON.stringify(message)}:`, e);
        }
        if (handler.maxCount) {
          handler.currentCount ++;
          if (handler.currentCount >= handler.maxCount) {
            this.#handlers.splice(handlerIndex, 1);
          }
        }
      }
    });
    return flag;
  }
};
const messages = new messageSystem;
export default messages; // Global instance, different modules can broadcast to each other (I think.)
export { messageSystem as LocalMessageSystem }; // Class, use `new LocalMessageSystem()` to create a local message system.