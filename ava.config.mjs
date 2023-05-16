export default {
  files: [
    'test/**/*',
    // '!test/stubs/**/*',
  ],
  // match: [
  //   '*oo',
  //   '!foo',
  // ],
  concurrency: 1,
  failFast: true,
  failWithoutAssertions: false,
  verbose: true,
  nodeArguments: [
    '--trace-deprecation',
    '--napi-modules',
  ],
};
