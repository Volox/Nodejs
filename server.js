
/**
 * Module dependencies.
 */

var config = require('config');

var log = config.logger,
    express = require('express'),
    http = require('http');

var app = express(),
    stylus = require('stylus');

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


// Testi page
app.get('/test/:task', routes.test );



app.all( '/*', routes.missing );
var server = http.createServer(app);

server.listen( config.port );
  log.debug( f( 'Express server listening on port %d in %s mode',
    server.address().port, app.settings.env ) );


// Bind task resources
