var util = require( 'util' );
var _ = require( 'underscore' );
_.str	= require( 'underscore.string' );
_.mixin( _.str.exports() );


f = _.sprintf;


// MMM not sure if this is the best solution...
var startUID = new Date( 1970,0,1 );
uid = function( prefix ) {
	startUID.setDate( startUID.getDate()+1 );

	var crypto = require( 'crypto' );
	var md5 = crypto.createHash( 'md5' );

	md5.update( ""+startUID.getTime() );

	var uid = md5.digest( 'hex' )
	if( _.isString( prefix ) ) {
		uid = prefix + uid;
	}
	return uid;
}