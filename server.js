
/**
 * Module dependencies.
 */

var config = require('./config')
  , log = config.logger;

var express = require('express')
  , http = require('http');

var app = express();

var stylus = require('stylus')
  , mongo = require('./mongo-wrap').instance;

// Routes
var routes = require('./routes')
  , Task = require('./task')


app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  
  app.use(express.favicon());
  app.use(express.logger('dev'));

  // CORS -> Cross Domain ajax requests
  app.use( routes.cors );

  app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  app.use(express.static(__dirname + '/public'));
  
  app.use(express.bodyParser( {uploadDir: __dirname+'/'+config["task"].path} ));
  app.use(express.methodOverride());
  
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler());
});


// Routes
app.get( '/', routes.index );
app.post( '/uploadAjax', routes.uploadAjax );

// Errors
app.get('/404', routes.error );
app.get('/505', routes.error );


app.get('/test/:task', routes.test );


var server = http.createServer(app);

/* Intance of the task will be created only if mongo connection is ok */
mongo.init( function( db ) {
  // Start the task repository
  var task = new Task( db );

  // Bind resources
  app.post( '/tasks', task.do( 'create' ) );
  app.get( '/tasks/new', task.do( 'new' ) );
  app.delete( '/tasks/:task', task.do( 'delete' ) );

  app.get( '/tasks', task.do( 'list' ) );
  app.get( '/tasks/list', task.do( 'list' ) );

  app.get( '/tasks/:task/code', task.do( 'code' ) );

  app.get( '/tasks/:task/:format?', task.do( 'details' ) );
  app.get( '/tasks/:task/details/:format?', task.do( 'details' ) );


  // Start the WebServer
  server.listen( config.port );
	log.debug( f( 'Express server listening on port %d in %s mode',
		server.address().port, app.settings.env ) );
} );






