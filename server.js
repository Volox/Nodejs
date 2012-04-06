/**
 * Module dependencies.
 */

var config = require('./config')
  , log = config.logger
  , express = require('express')
  , Resource = require('express-resource')
  , stylus = require('stylus')
  , mongo = require('./mongo-wrap').instance;

// Routes
var index = require('./routes')
  , task = require('./task')

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
  app.use(index.logger);
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
/*
app.get('/404', routes.error );
app.get('/505', routes.error );
*/
app.resource( 'task', task );
app.resource( index );

/* Intance of the task will be created only if mongo connection is ok */
mongo.init( function( err, db ) {
	// Start the WebServer
	app.listen( config.port );
	log.debug( f( 'Express server listening on port %d in %s mode',
		app.address().port, app.settings.env ) );
} );

