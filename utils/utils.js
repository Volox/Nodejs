var util = require( 'util' );

f = util.format;


proxy = function( fn, context ) {

	// Simulated bind
	var args = slice.call( arguments, 2 ),
		proxy = function() {
			return fn.apply( context, args.concat( slice.call( arguments ) ) );
		};

	return proxy;
};