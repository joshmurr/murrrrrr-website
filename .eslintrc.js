module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier',
      ],
      parserOptions: {
        project: [
          './tsconfig.json',
          './packages/*/tsconfig.json',
          './examples/*/tsconfig.json',
        ] /* NOTE: Important !! */,
        tsconfigRootDir: __dirname /* NOTE: Not important but probably good */,
        ecmaVersion: 2020,
        ecmaFeatures: {
          jsx: false,
        },
      },
    },
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  },
}
