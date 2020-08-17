const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const CopyPkgJsonPlugin = require('copy-pkg-json-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    mode: 'production',
    entry: {
        cli: './cli.js',
        index: './index.js',
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].js',
    },
    context: __dirname,
    target: 'node',
    node: {
        __filename: false,
        __dirname: false,
    },
    externals: {
        './index': 'commonjs ./index',
    },
    module: {
        rules: [
            {
                test: path.resolve(__dirname, 'cli.js'),
                loader: 'string-replace-loader',
                options: { search: '^#!.*[\\r\\n]+', flags: '', replace: '' },
            },
            {
                // transpile ES6-8 into ES5
                test: /\.m?js$/,
                // exclude: /node_modules\b/,
                loader: 'babel-loader',
                options: {
                    cacheDirectory: true,
                    presets: [['@babel/preset-env', { targets: { node: '6' } }]], // esmodules
                },
            },
            {
                test: path.resolve(__dirname, 'package.json'),
                loader: 'string-replace-loader',
                options: { search: ',\\s*"bin":.*$', flags: 's', replace: '}' },
            },
        ],
    },
    plugins: [
        new webpack.BannerPlugin({ banner: '#!/usr/bin/env node', raw: true, test: /cli/ }),
        new CopyPkgJsonPlugin({
            remove: ['dependencies', 'devDependencies', 'scripts', 'engines', 'eslintConfig'],
            replace: { engines: { node: '>=6' } },
        }),
        new CopyPlugin([{ from: '*.{txt,md,ts}' }]),
    ],
    optimization: {
        nodeEnv: false,
        // minimize: false,
        minimizer: [
            new TerserPlugin({
                cache: true,
                parallel: true,
                terserOptions: {
                    mangle: false,
                    output: { beautify: true },
                },
            }),
        ],
    },
};
