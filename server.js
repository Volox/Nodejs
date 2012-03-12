/**
 * Module dependencies.
 */

var express = require('express')
  , stylus = require('stylus')
  , routes = require('./routes')
  , config = require('./config')
  , mongo = require('./mongo-wrapper');

var app = module.exports = express.createServer();

// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', {
	'layout': true
  } );
  
  app.use(log4js.connectLogger(logger, { level: log4js.levels.INFO }));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  
  // Compile styl files on the fly
  app.use(stylus.middleware({ src: __dirname + '/public' }));
  
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
app.get('/', routes.index );



// Start the WebServer
app.listen( config.port );
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
