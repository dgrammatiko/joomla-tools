/**
 * Simple timer
 *
 * @returns {{stop: stop}}
 */
class Timer {
  /**
   *
   * @param {string} name
   */
  constructor(name) {
    this.start = new Date();
    this.name = name;
  }

  stop() {
    process.stdout.write(`Timer: ${this.name} finished in ${new Date().getTime() - this.start.getTime()}ms`);
  }
}

export { Timer };
