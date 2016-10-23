var middleware = app => {
  const webpackDevMiddleware = require('webpack-dev-middleware');
  const webpackHotMiddleware = require('webpack-hot-middleware');
  const webpack = require('webpack');
  const wonfig = Object.assign({}, require('../webpack.config'), {
    // any special rules you want to specify here for convenience sake...
  });

  const wompiler = webpack(wonfig);
  app.use(webpackDevMiddleware(wompiler, {
    noInfo: true,
    publicPath: wonfig.output.publicPath,
  }));
  app.use(webpackHotMiddleware(wompiler));



};

module.exports = middleware;
