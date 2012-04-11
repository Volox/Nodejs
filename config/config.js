/*
Configuration file
*/
// Required libs

require( '../utils' );
var fs = require( 'fs' )
  , path = require( 'path' )
  , util = require( 'util' );
 
var prop_file = __dirname + '/configuration.json';
var props = {};
var default_props = {
};

/* Console logger - Default */
var log = console;
// Fallback to the console logger if the logger fails
log.debug = console.log;

/* Singleton instance */
var loaded = false;

/* Load the configuration file */
if ( !loaded ) {
	log.debug( 'Loading configuration file' );
	try {
		props = JSON.parse( fs.readFileSync(prop_file, 'utf8') );
		loaded = true;
		// Set the port for the server
		props.port = process.env.PORT || props.port;
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
	
	// Read log configuration file
	var logConf = JSON.parse( fs.readFileSync( __dirname + '/' + config.logConfigFile, 'utf8') );
	
	// Configure the logger
	var winston = require( 'winston' );
	var logger = new (winston.Logger)( {
		transports: [
			new (winston.transports.Console)( {
				colorize: logConf.appenders.console.color,
				level: logConf.appenders.console.level.toLowerCase(),
				timestamp: function() {
					var now = new Date();
					return now.format( logConf.appenders.console.timestamp );
				},
			} ),
			new (winston.transports.File)( {
				timestamp: function() {
					var now = new Date();
					return now.format( logConf.appenders.file[0].timestamp );
				},
				json: false,
				level: logConf.appenders.file[0].level.toLowerCase(),
				maxsize: logConf.appenders.file[0].maxsize,
				maxFiles: logConf.appenders.file[0].maxFiles,
				filename: logPath + logConf.appenders.file[0].filename
			} )
		]
	} );

	logger.info( 'Log instance created!' );

	props.logger = logger;
}