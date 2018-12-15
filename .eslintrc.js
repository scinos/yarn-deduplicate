module.exports = {
    root: true,
    parserOptions: {
        ecmaVersion: 2017,
    },
    env: {
        es6: true,
        node: true,
    },
    plugins: [
        'jest'
    ],
    extends: [
        'plugin:prettier/recommended',
        'plugin:jest/recommended'
    ]
};
