var path = require('path');
var webpack = require('webpack');

module.exports = {
    entry: './js/message.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'message.js'
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                query: {
                    presets: ['stage-2']
                }
            }
        ]
    },
    stats: {
        colors: true
    },
    devtool: 'source-map'
};