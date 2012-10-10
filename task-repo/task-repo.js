/*
 * Task Repository module
 * TODO: Move to a separated server
 */
var config = require( '../config' ),
	Requester = require( './requester' );

var log		= config.logger,
	_		= config._,
	fs		= config.fs,
	path	= config.path,
	mongo	= config.mongo;


var TaskRepository = function( configuration ) {
	this.name = "Task Repository";
	
	this.configuration = configuration;
	this.collection = null;
	this.taskPath = null;
	this.taskDefaultPath = null;

	this.requester = new Requester();

	this.init();
};

TaskRepository.prototype.init = function() {
	// Bind the API
	for( var api in this.API ) {
		this.API[ api ] = _.bind( this.API[ api ], this );
	}

	// Create the path
	this.taskPath = path.join( process.cwd(), this.configuration.customImplementationPath );
	this.taskDefaultPath = path.join( process.cwd(), this.configuration.defaultImplementationPath );

	if( !fs.existsSync( this.taskPath ) ) {
		fs.mkdirSync( this.taskPath );
	}
	if( !fs.existsSync( this.taskDefaultPath ) ) {
		fs.mkdirSync( this.taskDefaultPath );
	}
};




TaskRepository.prototype.getFilePath = function( options) {
	var filePath = path.join( this.taskPath, ""+options.taskID, options.fileName );
	if( options.configuration ) {
		filePath = path.join( this.taskDefaultPath, options.configuration, options.fileName );
	}
	return filePath;
};

TaskRepository.prototype.API = {};

TaskRepository.prototype.API.executeTask = function(req, res) {
	var taskID = req.query.taskID;
	var accessToken = req.query.accessToken;
	var config = req.query.config;
	
	// Create the URL
	var url = '/task/'+taskID+'/run';

	// Add the configuration if present
	if( config )
		url += '/'+config;

	// Append the access token as Query String
	url += '?accessToken='+accessToken;

	// Redirect
	res.redirect( url );
};

TaskRepository.prototype.API.uTaskList = function(req, res) {
	var taskID = req.params.task;
	this.requester.get( taskID, 'list', function( error, body ) {
		try {
			if( error )
				throw error;
			
			body = JSON.parse(body);

			if( !body.microTasks )
				throw "The selected task does not have any microTask associated";

			res.render('task/list', {
				title: '&micro;Task list',
				taskID: taskID,
				data: body
			});
		} catch( err ) {
			log.error( err );
			res.render('error', {
				title: 'Request error',
				message: err
			});
		}
	} );
};

TaskRepository.prototype.API.details = function(req, res) {
	var taskID = req.params.task;

	var self = this;
	this.requester.get( taskID, 'details', function( error, body ) {
		try {
			if( error )
				throw error;
			
			body = JSON.parse(body);
			if( req.xhr ) {
				res.type( 'json' );
				res.send( JSON.stringify(body) );
			} else {

				var parentTask = body.task;
				// Parse the result
				var data = {
					id: [],
					fields: {}
				};

				_.each( body.schema.fields, function( column ) {
					data.fields[ column.name ] = [];
				} );

				_.each( body.objects, function( dataObj ) {
					data.id.push( dataObj.id );

					_.each( data.fields, function( field, fieldName ) {
						data.fields[ fieldName ].push( dataObj.fields[ fieldName ] );
					} );
				} );

				res.render('task/detail', {
					title: 'Task detail',
					data: body,
					objects: data,
					config: body.implementation.config || 'default'
				});
			}
		} catch( err ) {
			log.error( err );
			res.render('error', {
				title: 'Request error',
				message: err
			});
		}
	} );

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
	var codeName = ( _( req.body.name ).isBlank() )? 'default' : req.body.name;
	var taskID = parseInt( req.params.task, 10 );
	var files = req.files;


	log.debug( 'Code name: '+codeName );
	var self = this;
	this.requester.get( taskID, 'details', function( error, body ) {
		try {
			if( error )
				throw error;
			
			body = JSON.parse(body);

			var parentTask = parseInt( ( body.isMicroTask )? body.task : body.id, 10 );

			// Save to FS function
			var saveFiles = function( files ) {
				log.debug( 'Saving data to filesystem' );

				for( var fileID in files) {
					var file = files[ fileID ];

					if( file.size>=0 ) {
						var taskPath = path.join( self.taskPath, ""+parentTask );
						if( !fs.existsSync( taskPath ) ) {
							fs.mkdirSync( taskPath );
						}
						taskPath = path.join( taskPath, codeName );
						if( !fs.existsSync( taskPath ) ) {
							fs.mkdirSync( taskPath );
						}

						var filePath = path.join( taskPath, file.name );
						fs.renameSync( file.path, filePath );
					}
				}

				// Return response accordingly to the request
				if( req.xhr ) {
					res.send( '/task/'+parentTask+'/list' );
				} else {
					res.redirect( '/task/'+parentTask+'/list' );
				}
			};

			saveFiles( files );

		} catch( err ) {
			log.error( err );
			res.render('error', {
				title: 'Request error',
				message: err
			});
		}

	} );
};

TaskRepository.prototype.API.run = function(req, res) {
	var taskID = parseInt( req.params.task, 10 );
	if( !req.params.file ) {
		req.params.file = req.params.configuration;
		delete req.params[ 'configuration' ];
	}
	var file = req.params.file || 'home.html';

	var self = this;
	this.requester.get( taskID, 'details', function( error, body ) {
		try {
			if( error )
				throw error;
			
			body = JSON.parse( body );

			var filePath = self.getFilePath( {
				taskID: taskID,
				configuration: req.params.configuration,
				fileName: file
			} );

			if( fs.existsSync( filePath ) ) {
				res.sendfile( filePath );
			} else {
				res.send( 'Not found', 404 );
			}
		} catch( err ) {
			log.error( err );
			res.render('error', {
				title: 'Request error',
				message: err
			});
		}
	} );
};


TaskRepository.prototype.API.input = function(req, res) {
	var taskID = parseInt( req.params.task, 10 );
	var field = req.params.field || '*';

	var self = this;
	this.requester.get( taskID, 'details', 'objects', function( error, body ) {
		try {
			if( error )
				throw error;
			
			body = JSON.parse(body);

			var data;
			if( field!='*' ) {
				data = {
					id: []
				};
				data[ field ] = [];

				_.each( body.objects, function( val ) {
					data.id.push( val.id );
					data[ field ].push( val.fields[ field ] );
				} );
			} else {
				data = body.objects;
			}

			if( req.xhr ) {
				res.type( 'json' );
				res.send( JSON.stringify( data ) );
			} else {
				//throw "Not implemented"
				res.type( 'json' );
				res.send( JSON.stringify( data ) );
			}
		} catch( err ) {
			log.error( err );
			res.render('error', {
				title: 'Request error',
				message: err
			});
		}
	} );
};

TaskRepository.prototype.API.configuration = function(req, res) {
	var taskID = parseInt( req.params.task, 10 );
	var field = req.params.field || '*';

	var self = this;
	this.requester.get( taskID, 'details', 'configurations', function( error, body ) {
		try {
			if( error )
				throw error;
			
			body = JSON.parse(body);

			var data = body.configurations;
			if( field!='*' ) {
				data = [];
				for( var index in body.configurations ) {
					configuration = body.configurations[ index ];

					if( configuration[ field ] ) {
						data.push( configuration[ field ] );
					}
				}
			}


			if( req.xhr ) {
				res.type( 'json' );
				res.send( JSON.stringify( data ) );
			} else {
				throw "Not implemented";
			}
		} catch( err ) {
			log.error( err );
			res.render('error', {
				title: 'Request error',
				message: err
			});
		}
	} );
};

TaskRepository.prototype.API.postResult = function(req, res) {
	var taskID = parseInt( req.params.task, 10 );

	var self = this;
	this.requester.post( taskID, 'save', req.body, function( error, body ) {
		try {
			if( error )
				throw error;
			
			body = JSON.parse( body || '"OK"' );

			if( req.xhr ) {
				res.type( 'json' );
				res.send( '"OK"' );
			} else {
				res.send( 'OK' );
			}
		} catch( err ) {
			log.error( err );
			res.render('error', {
				title: 'Request error',
				message: err
			});
		}
	} );
};

















exports = module.exports = TaskRepository;
