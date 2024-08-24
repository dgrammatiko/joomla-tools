/**
 *
 * @param { string } value  The message
 * @deprecated
 */
function logger(value) {
  process.stdout.write(`${value}\n`);
}

export { logger };
