/**
 *
 * @param { string } value  The message
 */
function logger(value) {
  process.stdout.write(`${value}\n`);
}

export {logger};
