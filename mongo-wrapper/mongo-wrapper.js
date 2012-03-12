// Required libs
var mongo = require( 'mongodb' )
  , config = require( '../config' )[ "mongo" ]
  , log = require( 'winston' )
  , error = require( 'winston' ).loggers.get( 'error' ).error;

log.debug( 'Loading Mongo Wrapper' );


var Db = mongo.Db;
var Connection = mongo.Connection;
var Server = mongo.Server;
var BSON = mongo.BSON;
var ObjectID = mongo.ObjectID;

Mongo = function( host, port, dbName ) {
	log.debug( 'Mongo Wrapper instance created' );
	var self = this;
	if( !host )
		host = config.host;
	if( !port )
		port = config.port;
	if( !dbName )
		dbName = config[ 'db-name' ];
	
	this.server = new Server( host, port, {
		auto_reconnect: true
	});
	this.db = new Db( dbName, this.server );
	this.db.open( function( err, db ) {
		if( err!==null ) {
			error( f( 'Error in connection -> %s', err ) );
		} else  {
			log.info( 'Mongo connection ok' );
			self._test();
		}
	} );
	
};

Mongo.prototype = {
	_test: function() {
		log.debug( 'Doing some test' );
		var self = this;
		this.db.collectionsInfo(function(err, cursor) {
			cursor.toArray(function(err, items) {
				log.debug( JSON.stringify(items, null, 4) );
				self.db.close();
			});
		});
	}
}

var instance = new Mongo();
exports.Mongo = module.exports.Mongo = Mongo;
exports.instance = module.exports.instance = instance;