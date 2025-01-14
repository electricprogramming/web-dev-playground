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
   * @returns {boolean}
   */
  on(messageName, handler) {
    if (messageName == null) return false;
    if (typeof handler !== 'function') return false;
    handler = handler.bind({});
    this.#handlers.push({ messageName, handler })
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
    this.#handlers.forEach(({ messageName, handler }) => {
      if (message === messageName) {
        flag = true;
        try {
          handler(...args);
        } catch (e) {
          console.error(`Error while handling message ${JSON.stringify(message)}:`, e);
        }
      }
    });
    return flag;
  }
};
const messages = new messageSystem;
export default messages; // Global instance, different modules can broadcast to each other (I think.)
export { messageSystem as LocalMessageSystem }; // Class, use `new LocalMessageSystem()` to create a local message system.