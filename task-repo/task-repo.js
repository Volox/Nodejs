/*
 * Task Repository module
 * TODO: Move to a separated server
 */
var config = require( '../config' );

var log		= config.logger,
	_		= config._,
	mongo	= config.mongo;

var Task = require( './task' );

var TaskRepository = function( configuration ) {
	this.name = "Task Repository";
	this.urlMapping = configuration.urls;
	this.taskList = [];

	log.info( 'Task Repository created' );

	this.init();
}

TaskRepository.prototype.init = function() {
	var taskI = new Task();
	this.addTask( taskI );
}

TaskRepository.prototype.bindUrls = function( app ) {
	// Bind the urls with the actions
	var urlMap = this.urlMapping;
	var urlPattern = /(?:(\w*)@)?(.*)/i;

	for( url in urlMap ) {
		var action = urlMap[ url ];
		var matches = url.match( urlPattern );

		var method = matches[1] || 'get';
		var requestUrl = ( !_(matches[2]).isBlank() )? matches[2] : '/404';

		log.debug( f( 'Binding %s %s to "%s"', method.toUpperCase(), requestUrl, action ) );
		
		// HARDCODED EXPRESS BINDINGS
		app[ method.toLowerCase() ]( requestUrl, _.bind( this.actions[ action ], this ) );
	}
}


// Create the action namespace
TaskRepository.prototype.actions = {};
TaskRepository.prototype.actions.create = function() {
	
};
TaskRepository.prototype.actions.new = function() {
	
};
TaskRepository.prototype.actions.delete = function() {
	
};
TaskRepository.prototype.actions.list = function() {
	
};
TaskRepository.prototype.actions.code = function() {
	
};
TaskRepository.prototype.actions.details = function() {

};

TaskRepository.prototype.addTask = function( task ) {
	log.debug( f( 'Adding task (%s) to the Task Repository', task.uid ) );
	this.taskList.push( task );
	// Add the task to mongo db
}


TaskRepository.prototype._auth = function() {
	log.debug( 'Authorising' );
};

exports = module.exports = TaskRepository;
