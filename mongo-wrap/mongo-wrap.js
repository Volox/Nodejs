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
	
	host = host || config.host;
	port = port || config.port;
	dbName = dbName || config[ 'db-name' ];
	
	
	this.server = new Server( host, port, {
		auto_reconnect: true
	} );
	this.db = new Db( dbName, this.server );
};

/* Methods */
Mongo.prototype = {
	init: function( callback ) {
		
	}
};

var instance = new Mongo();
exports.instance = module.exports.instance = instance;
exports.Mongo = module.exports.Mongo = Mongo;
