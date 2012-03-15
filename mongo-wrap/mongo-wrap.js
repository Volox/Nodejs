// Required libs
var mongodb = require('mongodb')
  , config = require( '../config' )[ "mongo" ]
  , log = require( 'winston' )
  , error = require( 'winston' ).loggers.get( 'error' ).error;

log.debug( 'Mongo wrapper class loaded' );


var Db = mongodb.Db
  , Server = mongodb.Server;

/* Constructor */
Mongo = function( host, port, dbName ) {
	log.debug( 'Mongo instance created' );
	var self = this;
	
	this.host = host || config.host;
	this.port = port || config.port;
	this.dbName = dbName || config[ 'db-name' ];
	
	log.debug( this.dbName );
	
	this.server = new Server( this.host, this.port, {
		auto_reconnect: true
	} );
	this.db = new Db( this.dbName, this.server );
	
	this.init();
};

/* Methods */
Mongo.prototype = {
	init: function() {
		var self = this;
		this.db.open( function( err, db ) {
			if( err ) {
				var errorMsg = f( "Unable to open the connection to the db %s\n%s",
					self.dbName, err );
				log.error( errorMsg );
				error( errorMsg );
				process.exit(1);
			} else {
				//db.close( true );
			}
		} );
	}
};

var instance = new Mongo();
exports.instance = module.exports.instance = instance;
exports.Mongo = module.exports.Mongo = Mongo;
