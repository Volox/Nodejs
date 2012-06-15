/*
 * Task Repository module
 * TODO: Move to a separated server
 */
var config = require( '../config' );

var log		= config.logger,
	_		= config._,
	request = config.request,
	mongo	= config.mongo;

var Task = require( './task' );

var TaskRepository = function( configuration ) {
	this.name = "Task Repository";
	
	this.configuration = configuration;
	
	this.host = configuration.host;
	this.port = configuration.port;
	this.basePath = configuration.basePath;

	// Http request base options
	this.baseOptions = {
		host: this.host,
		port: this.port,
	}



	log.info( 'Task Repository created' );

	this.init();
}

TaskRepository.prototype.init = function() {


	/*
	var taskI = new Task();
	this.addTask( taskI );
	*/
}

TaskRepository.prototype.taskList = function(req, res){
	var config = this.configuration.actions.taskList;
	var url = f( '%s:%s%s/%s', this.host, this.port, this.basePath, config.path );

	try {
		request( {url: url, method: config.method }, function( error, response, body ) {
			try {
				body = JSON.parse(body);
			} catch( error ) {
				body = error
			}

			res.render('task/list', {
				title: 'Task list',
				data: body
			});
		} );

	} catch( error ) {
		res.render('error', {
			title: 'Request error',
			message: error
		});
	}
};

TaskRepository.prototype.taskDetail = function(req, res) {
	var taskID = req.params.task;

	var config = this.configuration.actions.task;
	var url = f( '%s:%s%s/%s', this.host, this.port, this.basePath, config.path.replace( "{query}", taskID ) );

	try {
		request( {url: url, method: config.method }, function( error, response, body ) {
			try {
				body = JSON.parse(body);

				var objects = [];
				_.each( body.objects, function( element ) {
					var object = {
						id: element.id
					};

					_.each( element.body, function( value ) {
						object[ value.fieldId ] = value.value;
					} );

					objects.push( object );
				} );

				body.objects = objects;
			} catch( error ) {
				body = error
			}

			res.render('task/detail', {
				title: 'Task detail',
				data: body || error
			});
		} );

	} catch( error ) {
		res.render('error', {
			title: 'Request error',
			message: error
		});
	}

};









/*
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
*/

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

exports = module.exports = TaskRepository;
