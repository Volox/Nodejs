/*
Configuration file
*/
// Required libs

require( '../utils' );
var fs = require( 'fs' ),
    path = require( 'path' ),
    util = require( 'util' );
 
var prop_file = __dirname + '/configuration.json';
var props = {};

/* Console logger - Default */
var log = console;
// Fallback to the console logger if the logger fails
log.debug = console.log;

/* Singleton instance */
var loaded = false;

function init( config ) {
	log.debug( 'Initialization' );
	initLogger( config[ 'logger' ] );
	initTask( config[ 'task' ] );
	initMongo( config[ 'mongo' ] );
}

function initLogger( config ) {
	log.debug( 'Logger initialization' );
	
	// Configuration function for the logger
	function configureLogger( configuration ) {
		var conf = configuration;
		
		// Configure the logger
		var winston = require( 'winston' );
		var transports = [];
		for( var type in logConf ) {
			
			// Set generic properties to the object
			var logObj = {
				level: logConf[ type ].level,
				timestamp: true
			};

			// Console Appender
			if( type.toLowerCase()==='console' ) {
				logObj.colorize = true;


			// File Appender
			} else if( type.toLowerCase()==='file' ) {
				logObj.maxsize = logConf[ type ][0].maxSize;
				logObj.maxFiles = logConf[ type ][0].maxFiles;
				logObj.fileName = logPath +'/'+ logConf[ type ][0].fileName;
			}

			type = type.charAt(0).toupperCase()+type.slice(1);

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
	path.exists( config.path, function( exists ) {
		if( !exists ) {
			fs.mkdir( config.path, function() {
				var fileFullPath;

				fileFullPath = __dirname + '/' + config.logConfigFile;

				fs.readFile( fileFullPath, 'utf8', function( err, data ) {
					var logConfiguration = JSON.parse( data );
					configureLogger( logConfiguration );
				} );
			} );
		}
	} );

}

function initTask( config ) {

	function configureTask( configuration ) {
	}


	path.exists( config.path, function( exists ) {
		if( !exists ) {
			fs.mkdir( config.path, function() {
				
				// Configure the tasks
				configureTask( config );
			} );
		}
	} );
}

function initMongo( config ) {
	var mongo = require( 'mongojs' );
	
	function configureMongo( configuration ) {
		var mongoObj = {};
		var dbUrl = f( '%s:%d/%s', configuration.host, configuration.port, configuration['db-name'] );
		var db = mongo.connect( dbUrl );

		var tasksCollection = db.collection( 'tasks' );
		
		props.mongo = mongoObj;
	}


	path.exists( config.path, function( exists ) {
		if( !exists ) {
			fs.mkdir( config.path, function() {
				
				// Configure mongo
				configureMongo( config );
			} );
		}
	} );
}



/* Load the configuration file */
if ( !loaded ) {
	log.debug( f( 'Loading configuration file @ %s', prop_file ) );
	try {
		fs.readFile( prop_file, 'utf8', function( err, data ) {
			console.log( "Error", err );

			props = JSON.parse( data );
			
			// Set the app as loaded
			loaded = true;
			
			// Set the port for the server
			props.port = process.env.PORT || props.port;

			// init the app
			init( props );
			
			exports = module.exports = props;
		} );

	} catch( err ) {
		log.error( "asdasdasdasd", err );
	}
	
}