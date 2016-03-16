var webpack = require('webpack');

module.exports = {
  entry: {
    '3d.test': "./test/functional/src/3d.test.js",
    'vendor': ['trip.core', 'trip.three', 'trip.dom'],
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        include: /(lib|test|node_modules\/trip.core\/lib|node_modules\/trip.dom\/lib)/,
        loader: 'babel',
        query: {
          presets: [
            require.resolve('babel-preset-es2015'),
          ]
        }
      },
    ],
  },
  output: {
    path: 'test/functional/bundle/',
    filename: "[name].bundle.js"
  },
  devtool: "eval",
  plugins: [
    new webpack.optimize.CommonsChunkPlugin(
      /* chunkName= */'vendor', /* filename= */'vendor.bundle.js'),
  ],
  node: {
    net: 'empty',
    dns: 'empty',
    crypto: 'empty',
  }
};
