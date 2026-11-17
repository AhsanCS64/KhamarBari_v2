import hooks from 'eslint-plugin-react-hooks'

export default [
  { ignores: ['dist/**', 'dist-ssr/**', 'node_modules/**'] },
  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: { ecmaVersion: 'latest', sourceType: 'module', parserOptions: { ecmaFeatures: { jsx: true } } },
    plugins: { 'react-hooks': hooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'no-dupe-args': 'error',
      'no-dupe-keys': 'error',
      'no-duplicate-case': 'error',
      'no-unreachable': 'error',
      'no-unsafe-optional-chaining': 'error',
      'valid-typeof': 'error',
    },
  },
]
