/*
Configuration file
*/
// Required libs

require( '../utils' );
var fs = require( 'fs' ), path = require( 'path' )
	winston = require( 'winston' );
var prop_file = __dirname + '/configuration.json';
var props = {};
var default_props = {
};

/* Console logger - Default */
var log = console;
// Add debug functionality to the console
log.debug = log.log;


/*  */
var loaded = false;

/* Load the configuration file */
if ( !loaded ) {
	log.debug( 'Loading configuration file' );
	try {
		props = JSON.parse( fs.readFileSync(prop_file, 'utf8') );
		loaded = true;
		// Set the port for the server
		props.port = process.env.PORT || props.port;
		props.log = log;
		// init the app
		init( props );
	} catch( err ) {
		log.error( err );
	}
	
	exports = module.exports = props;
}

function init( config ) {
	log.debug( 'Initialization' );
	initLogger( config[ 'logger' ] )
}
function initLogger( config ) {
	log.debug( 'Logger initialization' );
	
	var logPath = config.logPath;
	if( !path.existsSync( logPath ) ) {
		fs.mkdirSync( logPath );
	}
	
	// Logging
	for( var loggerName in config.loggers ) {
		var logger = config.loggers[ loggerName ];
		
		// Create a function in case the timestamp is a string
		var timestamp = logger.timestamp;
		if( typeof(timestamp)=="string" ) {
			logger.timestamp = function() {
				return (new Date()).format( timestamp );
			}
		}
		// Add the default pathe to the logs
		if( logger.filename ) {
			logger.filename = logPath+logger.filename;
		}
		
		// Add logger instance if not default
		var loggerInstance = winston;
		if( loggerName!="default" ) {
			winston.loggers.add( loggerName );
			loggerInstance = winston.loggers.get( loggerName );
		}
		// Remove default Console logger
		loggerInstance.remove(winston.transports.Console);
		
		var targets = logger.targets;
		delete logger.targets;
		targets.split( '|' ).forEach( function( target ) {
			try {
				loggerInstance.add( winston.transports[ target ], logger );
			} catch( ex ) {
				log.debug( "Unable to add the %s target for the %s logger -> %s",
					target, loggerName, ex );
			}
		} );
	}
	// Access the default logger
	log = winston;
	
	/*
	log.info( 'Logger created' );
	// Test the Error logger
	var error = winston.loggers.get( 'error' );
	error.error( 'Ciao' );
	*/
}