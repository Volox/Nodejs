/*
Configuration file
*/
// Required libs
require( '../utils' );

var fs = require( 'fs' ),
    path = require( 'path' ),
    util = require( 'util' ),
    nconf = require( 'nconf' );
 
var configurationFile = __dirname + '/configuration.json';


// First load arguments from the console
nconf.argv().env().file( {
	file: configurationFile
} );


var props = {};

function init( expressApp ) {
	console.log( 'Initialization' );
	props.port = nconf.get( 'port' );

	initLogger( nconf.get( 'logger' ) );
	initTask( nconf.get( 'task' ), expressApp );
	initMongo( nconf.get( 'mongo' ) );
}

function initLogger( config ) {
	console.log( 'Logger initialization' );
	
	// Configuration function for the logger
	function configureLogger( configuration ) {
		var logConf = configuration;
		
		// Configure the logger
		var winston = require( 'winston' );
		var transports = [];
		for( var type in logConf ) {
			
			// Set generic properties to the object
			var logObj = {
				level: logConf[ type ].level,
				timestamp: function() {
					return ( new Date() ).getTime();
				}
			};


			// Console Appender
			if( type.toLowerCase()==='console' ) {
				logObj.colorize = true;
				logObj.timestamp = true;

			// File Appender
			} else if( type.toLowerCase()==='file' ) {
				logObj.maxsize = logConf[ type ].maxSize;
				logObj.maxFiles = logConf[ type ].maxFiles;
				logObj.filename = config.path +'/'+ logConf[ type ].fileName;
			}

			// Use the type name to Create a transport instance
			type = type.charAt(0).toUpperCase()+type.slice(1);

			var transportInstance = new ( winston.transports[ type ] )( logObj );

			transports.push( transportInstance );
		}

		var logger = new (winston.Logger)( {
			transports: transports
		} );

		logger.info( 'Log instance created!' );

		props.logger = logger;
	}


	// Create the log path
	if( !path.existsSync( config.path ) ) {
		fs.mkdirSync( config.path );
	}

	configureLogger( config.configuration );
}

function initTask( config, expressApp ) {

	function configureTask( configuration ) {

		// init TaskRepo object
		var TaskRepository = require( 'task_repo' );
		var temp = new TaskRepository( configuration );
		var taskRepo = {};
		

		// Bind the urls with the actions
		var urlMap = configuration.urls;
		var urlPattern = /(\w*@)?(.*)/i;

		for( url in urlMap ) {
			var action = urlMap[ url ];
			var matches = url.match( urlPattern );

			var method = matches[1] || 'get';
			var requestUrl = (matches[2].length>0)? matches[2] : '/';


		}

		props.task = taskRepo;
	}

	// Create the Task path
	if( !path.existsSync( config.path ) ) {
		fs.mkdirSync( config.path );
	}

	configureTask( config );
}

function initMongo( config ) {
	var mongo = require( 'mongojs' );
	
	function configureMongo( configuration ) {
		var mongoObj = {};
		var dbUrl = f( '%s:%d/%s', configuration.host, configuration.port, configuration['db-name'] );
		var db = mongo.connect( dbUrl );

		var tasksCollection = db.collection( configuration.collection );

		mongoObj.db = db;
		mongoObj.tasksCollection = tasksCollection;


		props.mongo = mongoObj;
	}

	// Create the Task path
	if( !path.existsSync( config.path ) ) {
		fs.mkdirSync( config.path );
	}

	// Configure mongo
	configureMongo( config );
}


// Call the generic initialization element
init();

// Export all the available properties
exports = module.exports = props;