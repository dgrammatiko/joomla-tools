/**
 * Debounce
 * https://gist.github.com/nmsdvid/8807205
 *
 * @param { function } callback  The callback function to be executed
 * @param { number }  time      The time to wait before firing the callback
 * @param { number }  interval  The interval
 */
// eslint-disable-next-line no-param-reassign, no-return-assign, default-param-last
const debounce =
  (callback, time = 250, interval) =>
  (...args) =>
    clearTimeout(interval, (interval = setTimeout(callback, time, ...args)));

export { debounce };
