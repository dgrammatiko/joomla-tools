// const plugins = [
//   nodeResolve(),
//   commonjs(),
//   babel({
//     exclude: ['node_modules/core-js/**', 'media/system/js/core.js'],
//     babelHelpers: 'runtime', // runtime
//     babelrc: false,
//     presets: [
//       [
//         '@babel/preset-env',
//         {
//           corejs: '3.8',
//           useBuiltIns: 'entry', // entry
//           targets: {
//             firefox: '40',
//           },
//           loose: true,
//           bugfixes: false,
//           modules: false,
//         },
//       ],
//     ],
//     plugins: ['@babel/plugin-transform-runtime'],
//   }),
// ];

// if (globalThis.onlyMinimized) {
//   plugins.push(terser());
// }

const config = {
  inputOptions: {
    plugins: [],
  },
  outputOptions: {
    format: 'iife',
    // assetFileNames: (chunk) => {
    //   if (chunk.facadeModuleId.endsWith('.es5.js')) {
    //     return chunk.facadeModuleId.replace('.es5.js', '.min.js');
    //   }
    //   return chunk.facadeModuleId;
    // },
  },
};

export { config };
