/*
 * GET home page.
 */

var config = require( '../config' );
var log = config.logger,
	util = config.util,
	path = config.path;

exports.cors = function(req, res, next ) {
	// add header to all the requests for CROSS DOMAIN AJAX
  	res.set( 'Access-Control-Allow-Origin', '*' );
  	res.set( 'Access-Control-Allow-Headers', 'X-Requested-With');
	next();
};

exports.index = function(req, res){
	res.render('index', {
		title: 'Homepage'
	});
};
exports.error40x = function(req, res){
	res.render('error', {
		title: 'Error',
		message: 'Missing page'
	});
};
exports.error50x = function(req, res){
	res.render('error', {
		title: 'Error',
		message: 'SERVER ERRROR'
	});
};
exports.missing = function(req, res){
	res.redirect( '/404' );
};



// Test pages
exports.test = function(req, res) {
	res.render('test', {
		title: 'Test page'
	});
};
exports.testVideoPOI = function(req, res) {
	res.render('testVideoPOI', {
		title: 'Video Point Of Interest test page'
	});
};


exports.testVideo = function(req, res) {
	res.render('testVideo', {
		title: 'Video test page',
		tags: [
			"cloud",
			"tree",
			"landscape",
			"grass",
			"river",
			"flowers",
			"bird",
			"funny",
			"bunny",
			"hole",
			"sky",
			"squirrel",
			"butterfly",
		]
	});
};


// Use cases
exports.hybrid = function(req, res) {
	res.render('use-cases/hybrid', {
		title: 'Hybrid use case'
	});
};
exports.human = function(req, res) {
	res.render('use-cases/human', {
		title: 'Human use case'
	});
};
exports.automatic = function(req, res) {
	res.render('use-cases/automatic', {
		title: 'Automatic use case'
	});
};



// Others
exports.uploadAjax = function(req, res) {
	var files = util.isArray( req.files.file )? req.files.file : [ req.files.file ];
	var response = { files: [] };

	files.forEach( function( value ) {
		response.files.push( {
			name: value.name,
			size: value.size,
			type: value.type,
			id: path.basename( value.path )
		} );
	} );

	res.json( response );
};