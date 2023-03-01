/**
 *
 * @param { string } value  The message
 */
export function logger(value) {
  process.stdout.write(`${value}\n`);
}
