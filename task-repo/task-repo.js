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



var Requester = function( defaults ) {
	this.cache = {};

	this.defaultObj = _.extend( {
		method: 'get'
	}, defaults);
};

Requester.prototype.get = function( config, callback, force ) {
	if( typeof(config)=='string' ) {
		config = {
			url: config
		};
	}


	if( this.cache[ config.url ] && !force ) {
		log.debug( 'Using cached resource' );
		callback( null, { statusCode: 200 }, this.cache[ config.url ] );
	} else {
		log.debug( 'Using remote resource' );
		var urlConfig = _.extend( {}, this.defaultObj, config );
		var self = this;
		request( urlConfig, function( error, response, body ) {

			// Cache only the good responses
			if( response.statusCode==200 ) {
				self.cache[ urlConfig.url ] = body;
			}
			callback( error, response, body );
		} );
	}

};





var TaskRepository = function( configuration ) {
	this.name = "Task Repository";
	
	this.configuration = configuration;
	
	this.host = configuration.host;
	this.port = configuration.port;
	this.basePath = configuration.basePath;

	this.collection = null;
	this.taskPath = null;

	this.requester = new Requester();

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

	// Create the path
	this.taskPath = __dirname+'/'+repoConfig.path
	if( !fs.existsSync( this.taskPath ) ) {
		fs.mkdirSync( this.taskPath );
	}
}






TaskRepository.prototype.API = {};

TaskRepository.prototype.API.list = function(req, res) {
	var config = this.configuration.API.list;
	var url = f( '%s:%s%s/%s', this.host, this.port, this.basePath, config.path );

	try {
		log.debug( f( 'fetching URL %s', url ) );
		this.requester.get( {url: url, method: config.method }, function( error, response, body ) {

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
	this.requester.get( {url: url, method: config.method }, function( error, response, body ) {
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
		this.requester.get( {url: url, method: config.method }, function( error, response, body ) {
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
				parentTask = body.task;
				codeAvailable = false;
				if( !errorMessage ) {
					var query = { taskID: { $in: [ taskID, parentTask ]} };
					self.collection.findOne( query, function( err, docs ) {
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
	var codeName = req.body;
	var taskID = parseInt( req.body.parentTask || req.params.task );
	var files = req.files;


	// Get the uTask parent to save the resources
	var config = this.configuration.API.details;
	var url = f( '%s:%s%s/%s', this.host, this.port, this.basePath, config.path.replace( "{taskID}", taskID ) );

	log.debug( f( 'Fetching URL %s', url ) );
	var self = this;
	this.requester.get( {url: url, method: config.method }, function( error, response, body ) {
		log.debug( f( 'Url %s fetched', url ) );

		try {
			body = JSON.parse( body );

			// Parent found
			var parentTask = parseInt( ( body.isMicroTask )? body.task : body.id );

			// Save to DB function
			var saveToDB = _.bind( function( err, data ) {
				log.debug( 'Saving data to DB' );

				this.collection.save( {
					taskID: parentTask,
					code: data
				}, function( err, saved ) {
					log.debug( 'Saved to the DB' );

					// Return response accordingly to the request
					if( req.xhr ) {
						res.send( '/task/'+parentTask+'/list' );
					} else {
						res.redirect( '/task/'+parentTask+'/list' );
					}

					for( fileID in files ) {
						fs.unlink( files[ fileID ].path, function() {
							log.debug( 'File '+fileID+' removed' );
						} );
					}
				} );
			}, self );


			// Check the input files
			var fileContents = {};
			log.debug( 'Reading uploaded files' );
			for( fileID in files) {
				var file = files[ fileID ];

				if( file.size ) {
					var taskPath = self.taskPath+'/'+parentTask
					if( !fs.existsSync( taskPath ) ) {
						fs.mkdirSync( taskPath );
					}

					var filePath = taskPath+'/'+file.name;
					fs.renameSync( file.path, filePath );
					fileContents[ file.name.replace( '\.', '_' ) ] = filePath;

					/*
						fileContents[ fileName  ] = fs.readFileSync( file.path, 'utf8' );
					} else {
						log.debug( 'Reading '+file.name+' as binary' );
						var binaryFile = fs.readFileSync( file.path, 'binary' );
						fileContents[ fileName  ] = binaryFile;
					}
					*/
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
	var page = req.params.page;

	log.debug( 'Returning code for '+taskID+' in '+page );

	if( taskID==='sample' ) {
		res.sendfile( 'public/scripts/uTaskImplementation.js' );
	} else {
		var query = { taskID: { $in: [ taskID ] } }
		this.collection.findOne( query, { code: 1 }, function( err, docs ) {
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

TaskRepository.prototype.API.run = function(req, res) {
	var taskID = parseInt( req.params.task );
	var page = req.params.page || 'home.html';
	
	// Reconciliate dot and underscore
	page = page.replace( /\./ig, '_' );

	var config = this.configuration.API.details;
	var url = f( '%s:%s%s/%s', this.host, this.port, this.basePath, config.path.replace( "{taskID}", taskID ) );

	log.debug( f( 'Fetching URL %s', url ) );
	var self = this;
	this.requester.get( {url: url, method: config.method }, function( error, response, body ) {
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

			// Retrieve the code associated to the Task
			parentTask = ( body.isMicroTask )? body.task : body.id;

			var query = { taskID: { $in: [ taskID, parentTask ] } };
			query[ 'code.'+page ] = { $exists: true };
			self.collection.find( query, { code: 1, taskID: 1 }, function( err, docs ) {
				log.debug( 'Sending code' );
				if( !err && docs ) {
					var task = null;
					if( docs.length>1 ) {
						task = ( docs[0].taskID==taskID )? docs[0] : docs[1];
					} else {
						task = docs[0];
					}
					res.sendfile( task.code[ page ] );
				} else {
					log.debug( f( 'Unable to retrieve the code for %s, error: %s ', taskID, err ) );
					res.send( 'Not found', 404 );
				}
			} );
		} else {
			res.render('error', {
				title: 'Request error',
				message: 'Url not feched'
			});
		}
	} );
};


TaskRepository.prototype.API.input = function(req, res) {
	var taskID = parseInt( req.params.task );
	var field = req.params.field || '*';

	var config = this.configuration.API.details;
	var url = f( '%s:%s%s/%s', this.host, this.port, this.basePath, config.path.replace( "{taskID}", taskID ) );

	log.debug( f( 'Fetching URL %s', url ) );
	var self = this;

	/*
	res.type( 'json' );
	res.send( 'json', 404 );
	return
	*/
	this.requester.get( {url: url, method: config.method }, function( error, response, body ) {
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

					// Parse to extract the selected field
					var data = {};
					data[ field ] = [];

					// Find fieldName<->fieldID matching
					var fieldID;
					_.each( body.schema, function( element ) {
						if( element.name==field ) {
							fieldID = element.id
						}
					} );
					_.each( body.objects, function( element ) {
						_.each( element.body, function( fieldElement ) {
							if( fieldElement.fieldId==fieldID ) {
								data[ field ].push( fieldElement );
							}
						} );
					} );

					res.type( 'json' );
					res.send( JSON.stringify( data ) );
				} catch( ex ) { errorMessage = ex }
			}


		} else {
			res.render('error', {
				title: 'Request error',
				message: 'Url not feched'
			});
		}
	} );
};

TaskRepository.prototype.API.configuration = function(req, res) {
	var taskID = parseInt( req.params.task );
	var field = req.params.field || '*';

	var config = this.configuration.API.details;
	var url = f( '%s:%s%s/%s', this.host, this.port, this.basePath, config.path.replace( "{taskID}", taskID ) );

	log.debug( f( 'Fetching URL %s', url ) );
	var self = this;

	/*
	res.type( 'json' );
	res.send( 'json', 404 );
	return
	*/
	this.requester.get( {url: url, method: config.method }, function( error, response, body ) {
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

					// Parse to extract the selected field
					var data = body.configuration[ field ];

					res.type( 'json' );
					res.send( JSON.stringify( data ) );
				} catch( ex ) { errorMessage = ex }
			}


		} else {
			res.render('error', {
				title: 'Request error',
				message: 'Url not feched'
			});
		}
	} );
};

exports = module.exports = TaskRepository;
