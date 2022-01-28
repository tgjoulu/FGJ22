const { merge } = require('webpack-merge');
const common = require('./webpack.common');

const dev = {
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
        open: true,
        host: process.env['DEV_HOST'] || 'localhost',
    },
};

module.exports = merge(common, dev);
