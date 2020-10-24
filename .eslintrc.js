module.exports = {
    root: true,
    parserOptions: {
        ecmaVersion: 2017,
    },
    env: {
        es6: true,
        node: true,
    },
    plugins: ['jest'],
    extends: ['plugin:prettier/recommended', 'plugin:jest/recommended', 'plugin:md/prettier'],
    overrides: [
        {
            files: ['*.md'],
            parser: 'markdown-eslint-parser',
            rules: {
                'md/remark': [
                    'error',
                    {
                        // This object corresponds to object you would export in .remarkrc file
                        plugins: [
                            ['remark-lint-no-duplicate-headings', false],
                            ['lint-maximum-line-length', false],
                        ],
                    },
                ],
                'prettier/prettier': [
                    'error',
                    // Important to force prettier to use "markdown" parser - otherwise it wouldn't be able to parse *.md files.
                    // You also can configure other options supported by prettier here - "prose-wrap" is
                    // particularly useful for *.md files
                    { parser: 'markdown', proseWrap: 'always', tabWidth: 2 },
                ],
            },
        },
    ],
};
