import eslintPluginVue from 'eslint-plugin-vue';

export default [
  {
    files: ['**/*.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        Joomla: 'writable',
        tinyMCE: 'readonly',
        tinymce: 'readonly',
      },
    },
    rules: {
      'max-len': ['error', { comments: 160, code: 160 }],
    },
  },
  ...eslintPluginVue.configs['flat/essential'],
];
