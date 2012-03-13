// Required libs
var mongo = require('../mongo-wrap').instance
  , mongolia = require('mongolia')
  , config = require( '../config' )[ "task" ]
  , log = require( 'winston' )
  , error = require( 'winston' ).loggers.get( 'error' ).error;

log.debug( 'Task class loaded' );

/* Constructor */
Task = function( db ) {
	log.debug( 'Task instance created' );
	var self = this;
	
	db = db || mongo.db;
	
	this.db = db;
	this.mongo = mongo;
	this.mongolia = mongolia;
	this.tasks = null;
	
	this.db.open( function() {
		self.init();
	} );
};

/* Methods */
Task.prototype = {
	init: function() {
		this.tasks = this.mongolia.model( this.db, config.collection );
		this.tasks.mongo( 'insert', {
			name: "Volox",
			timestamp: (new Date()).format( 'yyyy-mm-dd HH:mm:ss' )
		} );
	},
	list: function( req, res, next ) {
		var array = this.tasks.mongo( 'findArray', {}, function( i, array ) {
			res.render( 'task/list', {
				title: 'Task list',
				asd: array
			} );
		} );
	},
};


exports = module.exports = Task;
