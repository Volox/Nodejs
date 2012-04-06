// Required libs
var mongodb = require('mongodb')
  , config = require( '../config' )[ "mongo" ]
  , log = require( '../config' ).logger;

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
	
	this.server = new Server( this.host, this.port, {
		auto_reconnect: true
	} );
	this.db = new Db( this.dbName, this.server );
};

/* Methods */
Mongo.prototype = {
	init: function( callback ) {
		var self = this;
		this.db.open( function( err, db ) {
			if( err ) {
				log.error( f( "Unable to open the connection to the db %s\n%s",
					self.dbName, err ) );
				process.exit(1);
			} else {
				callback( db );
			}
		} );
	}
};

var instance = new Mongo();
exports.instance = module.exports.instance = instance;
exports.Mongo = module.exports.Mongo = Mongo;
