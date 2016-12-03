const webpack = require('webpack');

module.exports = {
  devtool: 'eval-source-map',
  entry: {
    AppShell: [
      'webpack-hot-middleware/client',
      // 'babel-polyfill',
      // __dirname + '/src/polyfills.js', // polyfills for Promise and fetch
      __dirname + '/src/client/AppShell' // boot code for the client
    ],
    "service-worker": [
      'webpack-hot-middleware/client',
      // 'babel-polyfill',
      __dirname + '/src/worker/index' // boot code for the client
    ],
  },
  output: {
    path: __dirname + '/public',
    publicPath: '/',
    filename: '[name].bundle.js'
  },
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.ProvidePlugin({
      'React': 'react',
      'ReactDOM': 'react-dom'
    }),
  ],
  resolve: {
    extensions: ['', '.js', '.jsx'],
  },
  module: {
    loaders: [
      {
        loader: 'babel-loader',
        exclude: /node_modules/,
        include: __dirname,
        test: /\.jsx?$/,

        // Options to configure babel with
        query: {
          plugins: ['transform-runtime'],
          presets: ['es2015', 'es2017', 'react', 'react-hmre'],
        },
      },
      // {
      //   test: /\.js$/,
      //   loader: 'babel',
      //   exclude: /node_modules/,
      //   include: __dirname,
      //   query: {
      //     presets: [ 'react-hmre' ]
      //   },
      // }

      {
        test: /\.css$/,
        // What is this black magic?
        loader: 'style!css?modules&localIdentName=[name]---[local]---[hash:base64:5]',
      },
      {
        test: /\.scss$/,
        //loader: 'style!css!sass'  // NOTE: this works for bundling, but not for css-module use
        loaders: [
            'style',
            'css?modules&importLoaders=1&localIdentName=[path]___[name]__[local]___[hash:base64:5]',
            'resolve-url',
            'sass'
        ],
      },
    ]
  }
};
