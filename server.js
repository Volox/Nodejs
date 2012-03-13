/**
 * Module dependencies.
 */

var config = require('./config')
  , log = require('winston')
  , error = require( 'winston' ).loggers.get( 'error' ).error
  , serverLog = require( 'winston' ).loggers.get( 'server' )
  , express = require('express')
  , stylus = require('stylus')
  , routes = require('./routes')
  , Task = require('./task')
  , mongo = require('./mongo-wrap').instance;

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
  
  // Compile styl files on the fly
  app.use(stylus.middleware({ src: __dirname + '/public' }));
  
  // Log all the requests
  app.use(routes.logger);
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
app.get('/404', routes.error );
app.get('/505', routes.error );


/* Intance of the task */
var task = new Task();
app.get( '/task/list', function( req, res, next ) {
	task.list( req, res, next );
} );

// Start the WebServer
app.listen( config.port );
log.debug( f( 'Express server listening on port %d in %s mode',
	app.address().port, app.settings.env ) );
