import { logger } from './logger.mjs';

/**
 * Simple timer
 *
 * @param name
 *
 * @returns {{stop: stop}}
 */
class Timer {
  constructor(name) {
    this.start = new Date();
    this.name = name;
  }

  stop() {
    logger(`Timer: ${this.name} finished in ${(new Date()).getTime() - this.start.getTime()}ms`);
  }
}

export {Timer}
