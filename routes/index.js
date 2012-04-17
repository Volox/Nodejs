/*
 * GET home page.
 */
var log = require( '../config' ).logger;
var util = require('util');
var path = require('path');

exports.cors = function(req, res, next ) {
	// add header to all the requests for CROSS DOMAIN AJAX
  	res.set( 'Access-Control-Allow-Origin', '*' );
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


exports.test = function(req, res){
	var taskId = req.params.task;
	res.render('test', {
		title: 'Test page',
		task: taskId
	});
};

exports.uploadAjax = function(req, res){
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