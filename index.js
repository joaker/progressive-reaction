const express = require('express');
const app = express();
const host = process.env.IP || '0.0.0.0';
const port = process.env.PORT || 4242;

const webpackMiddleware = require("./webpack/middleware");
webpackMiddleware(app);

app.use(express.static(__dirname + '/public'));

app.set('view engine', 'ejs');

app.get('/', function(req, res) {
    res.render('pages/index');
});

app.listen(port, host, function() {
  console.log('Listening at http://%s:%s', host, port);
});
