/*
 * Task Repository module
 * TODO: Move to a separated server
 */
var config = require( '../config' );

var log		= config.logger,
	_		= config._,
	fs		= config.fs,
	request = config.request,
	mongo	= config.mongo;


var TaskRepository = function( configuration ) {
	this.name = "Task Repository";
	
	this.configuration = configuration;
	
	this.host = configuration.host;
	this.port = configuration.port;
	this.basePath = configuration.basePath;

	this.collection = null;

	this.init();
}

TaskRepository.prototype.init = function() {
	// Test mongo DB and Repository
	var repoConfig = this.configuration[ "repository" ];
	var dbUrl = f( '%s:%d/%s', repoConfig.host, repoConfig.port, repoConfig['db-name'] );
	var db = mongo.connect( dbUrl );
	var repoCollection = db.collection( repoConfig.collection );

	this.collection = repoCollection;

	// Bind the API
	for( API in this.API ) {
		this.API[ API ] = _.bind( this.API[ API ], this )
	}
}






TaskRepository.prototype.checkResponse = function() {}

TaskRepository.prototype.API = {};

TaskRepository.prototype.API.list = function(req, res) {
	var config = this.configuration.API.list;
	var url = f( '%s:%s%s/%s', this.host, this.port, this.basePath, config.path );

	try {
		log.debug( f( 'fetching URL %s', url ) );
		request( {url: url, method: config.method }, function( error, response, body ) {

			console.log( response.status, body );
			body = JSON.parse(body);

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

}

TaskRepository.prototype.API.uTaskList = function(req, res) {
	var taskID = req.params.task;
	var config = this.configuration.API.list;
	var url = f( '%s:%s%s/%s', this.host, this.port, this.basePath, config.path.replace( '{taskID}', taskID ) );

	log.debug( f( 'Fetching URL %s', url ) );
	request( {url: url, method: config.method }, function( error, response, body ) {
		log.debug( f( 'Url %s fetched', url ) );
		if( !error ) {
			var errorMessage = null;
			if( response.statusCode==404) {
				errorMessage = 'Task not found';
				log.debug( f( 'Task %s not found', taskID ) );
			} else if( response.statusCode==400) {
				errorMessage = 'Task not specified';
				log.debug( 'Task not specified' );
			} else {
				// Try to parse the response content
				try {
					body = JSON.parse(body);
				} catch( ex ) { errorMessage = ex }
			}

			// Render the page
			res.render('task/list', {
				title: 'Task list',
				taskID: taskID,
				data: body,
				errorMessage: errorMessage
			});
		} else {
			res.render('error', {
				title: 'Request error',
				message: error
			});
		}

	} );
}

TaskRepository.prototype.API.details = function(req, res) {

	var taskID = req.params.task;

	if( taskID==='sample' ) {
		res.render( 'task/sample', {
			title: 'Task Sample',
			taskID: taskID
		} );

	} else {
		var config = this.configuration.API.details;
		var url = f( '%s:%s%s/%s', this.host, this.port, this.basePath, config.path.replace( "{taskID}", taskID ) );

		log.debug( f( 'Fetching URL %s', url ) );
		var self = this;
		request( {url: url, method: config.method }, function( error, response, body ) {
			log.debug( f( 'Url %s fetched', url ) );
			if( !error ) {
				var errorMessage = null;
				if( response.statusCode==404) {
					errorMessage = 'Task not found';
					log.debug( f( 'Task %s not found', taskID ) );
				} else if( response.statusCode==400) {
					errorMessage = 'Task not specified';
					log.debug( 'Task not specified' );
				} else {
					// Try to parse the response content
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
					} catch( ex ) { errorMessage = ex }
				}

				// Retrieve the code associated to the Task
				parentTask = ( body.isMicroTask )? body.task : null;
				codeAvailable = false;
				if( !errorMessage ) {
					self.collection.findOne( { taskID: parentTask }, function( err, docs ) {
						if( !err && docs ) {
							codeAvailable = true
						}

						// Render the page
						res.render('task/detail', {
							title: 'Task detail',
							data: body,
							code: codeAvailable,
							errorMessage: errorMessage
						});
					} );
				}
			} else {
				res.render('error', {
					title: 'Request error',
					message: error
				});
			}

		} );
	}


};

TaskRepository.prototype.API.addCode = function(req, res) {
	var taskID = req.params.task;

	// Render the page
	res.render('task/new', {
		title: '&micro;Task code implementation',
		taskID: taskID
	});
};
TaskRepository.prototype.API.postCode = function(req, res) {
	var uTaskID = req.params.task;
	var code = req.body.code;
	var taskID = req.body.parentTask || req.params.task;
	var files = req.files;


	// Get the uTask parent to save the resources
	var config = this.configuration.API.details;
	var url = f( '%s:%s%s/%s', this.host, this.port, this.basePath, config.path.replace( "{taskID}", taskID ) );

	log.debug( f( 'Fetching URL %s', url ) );
	var self = this;
	request( {url: url, method: config.method }, function( error, response, body ) {
		log.debug( f( 'Url %s fetched', url ) );

		try {
			body = JSON.parse( body );

			// Parent found
			var parentTask = ( body.isMicroTask )? body.task : body.id;

			// Save to DB function
			var saveToDB = _.bind( function( err, data ) {
				log.debug( 'Saving data to DB' );

				this.collection.save( {
					taskID: parentTask,
					code: data,
					type: 'js'
				}, function( err, saved ) {
					log.debug( 'Saved to the DB' );
					res.redirect( '/task/'+taskID );

					for( fileName in files ) {
						fs.unlink( files[ fileName ].path, function() {
							log.debug( 'File removed' );
						} );
					}
				} );
			}, self );


			// Check the input used
			var fileContents = {};
			log.debug( 'Reading uploaded files' );
			for( fileName in files) {
				var file = files[ fileName ];
				if( file.size ) {
					fileContents[ fileName  ] = fs.readFileSync( file.path,'utf8' );
				}
			}

			if( _.size(fileContents)!=0 ) {
				saveToDB( null, fileContents );
			} else {
				throw new Error( 'No file uploaded' )
			}

		} catch ( ex ) {
			res.render('error', {
				title: 'Request error',
				message: ex
			});
		}
	} );
};

TaskRepository.prototype.API.code = function(req, res) {
	var taskID = parseInt( req.params.task );
	var format = req.params.format || 'js';

	log.debug( 'Returning code for '+taskID+' in '+format );

	if( taskID==='sample' ) {
		res.sendfile( 'public/scripts/uTaskImplementation.js' );
	} else {
		this.collection.findOne( { taskID: taskID, type: format }, { code: 1 }, function( err, docs ) {
			if( !err && docs ) {
				res.send( docs.code );
			} else {
				log.debug( f( 'Unable to retrieve the code for %s, error: %s ', taskID, err ) );
				res.render('error', {
					title: 'Request error',
					message: err || 'Code not found'
				});
			}
		} );
		//throw new Error( 'Code not found' );
	}
};






exports = module.exports = TaskRepository;
