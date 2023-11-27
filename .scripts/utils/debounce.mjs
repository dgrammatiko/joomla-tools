/**
 * Debounce
 * https://gist.github.com/nmsdvid/8807205
 *
 * @param { function } callback  The callback function to be executed
 * @param { number }  time      The time to wait before firing the callback
 * @param { number }  interval  The interval
 */
// biome-ignore format:
const debounce =
  (callback, time, interval) =>
  (...args) =>
    clearTimeout(interval, (interval = setTimeout(callback, time, ...args)));

export { debounce };
