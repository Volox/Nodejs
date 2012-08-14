/**
 * Module dependencies.
 */
var config = require('./config');

var log = config.logger,
    _ = config._,
    express = require('express'),
    http = require('http');

var app = express();

// Process tweaks
process.title = 'Volox';

// Routes
var routes = require('./routes');


app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  
  app.use(express.favicon());
  app.use(express.logger('dev'));

  // CORS -> Cross Domain ajax requests
  app.use( routes.cors );

  // Compile and serve .coffee files
  app.use(require('express-coffee')( {
    path: __dirname+'/public',
    //live: !process.env.PRODUCTION,
    //uglify: process.env.PRODUCTION
    live: true,
    uglify: false
  } ) );
  // Compile and serve .styl files
  app.use(require('stylus').middleware( {
    src: __dirname + '/public'
    // dest: __dirname + '/public'
  } ) );

  // Serve the files under the "public folder statically"
  app.use(express.static(__dirname + '/public'));
  
  app.use(express.bodyParser( {uploadDir: __dirname+'/uploads' } ) );
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

// Use cases
app.get('/automatic', routes.automatic );
app.get('/hybrid', routes.hybrid );
app.get('/human', routes.human );



var server = http.createServer(app);

// Task Repository API
var TaskRepository = require( './task-repo' );
var TRI = new TaskRepository( config.nconf.get( "task_repository" ) );

//app.get('/task/list', TRI.API.list );
app.get('/task/:task', TRI.API.details );
app.get('/task/:task/list', TRI.API.uTaskList );

app.get('/task/:task/code/add', TRI.API.addCode );

app.get('/task/:task/run/:implementation/:file?', TRI.API.run );

app.get('/task/:task/input/:field?', TRI.API.input );

app.get('/task/:task/configuration/:field?', TRI.API.configuration );

app.post('/task/:task/code', TRI.API.postCode );

app.post('/task/:task/result', TRI.API.postResult );


// TODO
app.all('/proxy', function( req, res ) {
  res.send( 'Proxy not yet implemented' );
} );


app.all( '/*', routes.missing );
server.listen( config.port, function() {
  log.debug( f( 'Express server listening on port %d in %s mode',
    server.address().port, app.settings.env ) );
} );