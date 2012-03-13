/*
 * GET home page.
 */
var log = require('winston')
  , error = require( 'winston' ).loggers.get( 'error' ).error
  , serverLog = require( 'winston' ).loggers.get( 'server' )


exports.logger = function(req, res, next ) {
	serverLog.debug( f( "%s - %s", req.method, req.url ) );
	next();
};

exports.index = function(req, res) {
	res.render('index', {
		title: 'Homepage'
	});
};

exports.error = function(err, req, res) {
	serverLog.debug( f( "Error in %s - %s", req.method, req.url ) );
	res.render('error', {
		title: 'Error',
		layout: false,
		error: err
	});
};