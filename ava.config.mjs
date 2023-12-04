export default {
  files: [
    'test/**/*.test.mjs',
  ],
  concurrency: 1,
  failFast: true,
  failWithoutAssertions: false,
  verbose: true,
  nodeArguments: [
    '--trace-deprecation',
    '--napi-modules',
  ],
};
