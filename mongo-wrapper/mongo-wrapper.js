// Required libs
var mongo = require( 'mongodb' ),
	config = require( '../config' );
console.log( 'Loading Mongo Wrapper' );

var Db = m.Db;
var Connection = mongo.Connection;
var Server = mongo.Server;
var BSON = mongo.BSON;
var ObjectID = mongo.ObjectID;

Mongo = function( host, port ) {
	console.log( 'Mongo Wrapper instance created' );
	this.db = new Db( '' );
}
Mongo.prototype = {
	
}

exports = module.exports = Mongo;