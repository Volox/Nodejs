/*
 * GET home page.
 */
var log = require( '../config' ).logger;

exports.logger = function(req, res, next ) {
	//log.debug( f( "%s - %s", req.method, req.url ) );
	next();
};

exports.index = function(req, res){
	res.render('index', {
		title: 'Homepage'
	});
};
exports.error = function(req, res){
	res.send( 'FUUUU' );
};