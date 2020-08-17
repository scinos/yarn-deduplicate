const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const CopyPkgJsonPlugin = require('copy-pkg-json-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const baseConfig = (name) => ({
    mode: 'production',
    entry: './' + name,
    output: {
        path: path.join(__dirname, 'dist'),
        filename: name + '.js',
    },
    name,
    context: __dirname,
    target: 'node',
    node: {
        __filename: false,
        __dirname: false,
    },
    module: {
        rules: [
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
        ],
    },
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
});

const config = [baseConfig('index'), baseConfig('cli')];

Object.assign(config[0].output, {
    libraryTarget: 'commonjs2',
});

Object.assign(config[1], {
    externals: {
        './index': 'commonjs2 ./index',
    },
    plugins: [
        new webpack.BannerPlugin({ banner: '#!/usr/bin/env node', raw: true }),
        new CopyPkgJsonPlugin({
            remove: ['dependencies', 'devDependencies', 'scripts', 'engines', 'eslintConfig'],
            replace: { engines: { node: '>=6' } },
        }),
        new CopyPlugin([{ from: '*.{txt,md,ts}' }]),
    ],
});
config[1].module.rules.unshift(
    {
        test: path.resolve(__dirname, 'cli.js'),
        loader: 'string-replace-loader',
        options: { search: '^#!.*[\\r\\n]+', flags: '', replace: '' },
    },
    {
        test: path.resolve(__dirname, 'package.json'),
        loader: 'string-replace-loader',
        options: { search: ',\\s*"bin":.*$', flags: 's', replace: '}' },
    }
);

module.exports = config;
