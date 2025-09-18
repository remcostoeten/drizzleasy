module.exports = {
    root: true,
    env: {
        browser: true,
        es2022: true,
        node: true
    },
    extends: ['eslint:recommended', '@typescript-eslint/recommended', 'prettier'],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
    },
    plugins: ['@typescript-eslint', 'import'],
    rules: {
        // No semicolons
        semi: ['error', 'never'],
        '@typescript-eslint/semi': ['error', 'never'],

        // Single quotes only
        quotes: ['error', 'single'],
        '@typescript-eslint/quotes': ['error', 'single'],

        // No trailing commas unless needed
        'comma-dangle': ['error', 'never'],
        '@typescript-eslint/comma-dangle': ['error', 'never'],

        // Import ordering
        'import/order': [
            'error',
            {
                groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
                'newlines-between': 'always',
                alphabetize: {
                    order: 'asc',
                    caseInsensitive: true
                }
            }
        ],

        // General formatting
        indent: ['error', 4],
        '@typescript-eslint/indent': ['error', 4],
        'linebreak-style': ['error', 'unix'],
        'eol-last': ['error', 'always']
    },
    overrides: [
        {
            files: ['*.ts', '*.tsx'],
            rules: {
                '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
            }
        }
    ]
}
