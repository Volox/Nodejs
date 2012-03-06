
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , config = require('./prova');

var app = module.exports = express.createServer();
// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', {
	'layout': true
  } );
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  
  // Compile styl files
  app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes
app.get('/', routes.index);
app.get('/html5', routes.html5);

app.listen(config.port);

console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
