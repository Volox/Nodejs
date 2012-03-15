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
	},
	list: function( req, res, next ) {
		var array = this.tasks.mongo( 'findArray', {}, function( i, array ) {
			res.render( 'task/list', {
				title: 'Task list',
				data: array
			} );
		} );
	},
	add: function() {
		log.debug( 'Adding a task!' );
		try {
			var dueDate = new Date();
			dueDate.setDate((new Date()).getDate()+5);
			
			this.tasks.mongo( 'insert', {
				name: "Face recognition",
				description: "The script have to recognize all the faces on a image",
				
				// Number of instances created, completed, etc.
				instances: {
					created: 0,
					completed: 0,
					aborted: 0,
					running: 0
				},
				
				// Task requirements
				requirements: {
					minThreshold: 10, // Minimum number of Task instances
					maxThreshold: 50, // Max number of Task instances
					userType: null, // Type of end user (security issue)???
					dueDate: dueDate.format( 'yyyy-mm-dd HH:mm:ss' ), // Date limit to complete the task
				},
				
				value: 5, // Task value (in bananas)
				
				
				created: (new Date()).format( 'yyyy-mm-dd HH:mm:ss' ),
			} );
			
			log.debug( 'Task created' );
		} catch( ex ) {
			log.error( f('Error while adding the task %s', ex ) );
			res.send('FUUUUUUUU',505);
		}
		res.send('All done',202);
	}
};


exports = module.exports = Task;
