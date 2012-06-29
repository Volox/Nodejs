/*
Configuration file
*/
// Required libs
require( '../utils' );

var fs = require( 'fs' ),
    util = require( 'util' ),
    nconf = require( 'nconf' ),
    mongo = require( 'mongojs' ),
    request = require( 'request' ),
    Q = require( 'q' ),
    _ = require( 'underscore' );

_.str = require( 'underscore.string' );
_.mixin( _.str.exports() );
 
var configurationFile = __dirname + '/configuration.json';


// First load arguments from the console
nconf.argv().env().file( {
	file: configurationFile
} );


var props = {};

function init( expressApp ) {
	console.log( 'Initialization' );

	// Copy the port variable
	props.port = nconf.get( 'port' );

	// Common Required modules
	props.util	= util;
	props.fs 	= fs;
	props.nconf	= nconf;
	props._		= _;
	props.mongo	= mongo;
	props.request=request;

	// Init the sections
	initLogger(	nconf.get( 'logger' ) );
	initMongo(	nconf.get( 'mongo' ) );
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
			type = _( type ).capitalize();

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
	if( !fs.existsSync( config.path ) ) {
		fs.mkdirSync( config.path );
	}

	configureLogger( config.configuration );
}

function initMongo( config ) {
	var mongo = require( 'mongojs' );
	
	function configureMongo( configuration ) {
		var mongoObj = {};
		var dbUrl = f( '%s:%d/%s', configuration.host, configuration.port, configuration['db-name'] );
		var db = mongo.connect( dbUrl );

		mongoObj.db = db;

		props.mongoDB = mongoObj;
	}

	// Create the Task path
	if( !fs.existsSync( config.path ) ) {
		fs.mkdirSync( config.path );
	}

	// Configure mongo
	configureMongo( config );
}

// Call the generic initialization element
init();

// Export all the available properties
exports = module.exports = props;