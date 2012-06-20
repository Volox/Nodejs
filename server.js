/**
 * Module dependencies.
 */

var config = require('./config');

var log = config.logger,
    _ = config._,
    express = require('express'),
    http = require('http');

var app = express(),
    stylus = require('stylus');


// Process tweaks
console.log( process.title );
process.title = 'Volox';
console.log( process.title );
console.log( '# of cpus: '+require('os').cpus().length );

// Routes
var routes = require('./routes');


app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  
  app.use(express.favicon());
  app.use(express.logger('dev'));

  // CORS -> Cross Domain ajax requests
  app.use( routes.cors );

  app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  app.use(express.static(__dirname + '/public'));
  
  app.use(express.bodyParser( {uploadDir: __dirname+'/'+config.task.path } ) );
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
app.get('/404', routes.error40x );
app.get('/505', routes.error50x );


// Test pages
app.get('/test', routes.test );
app.get('/testVideo', routes.testVideo );
app.get('/testVideoPOI', routes.testVideoPOI );



var server = http.createServer(app);

var TaskRepository = require( './task-repo' );
var TRI = new TaskRepository( config.nconf.get( "task_repository" ) );
app.get('/task/list', _.bind( TRI.taskList, TRI ) );
app.get('/task/:task', _.bind( TRI.taskDetail, TRI ) );





app.all( '/*', routes.missing );
server.listen( config.port );
  log.debug( f( 'Express server listening on port %d in %s mode',
    server.address().port, app.settings.env ) );