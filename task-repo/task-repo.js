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

	this.requester = new Requester();

	this.init();
}

TaskRepository.prototype.init = function() {
	// Bind the API
	for( API in this.API ) {
		this.API[ API ] = _.bind( this.API[ API ], this )
	}

	// Create the path
	this.taskPath = path.join( __dirname, this.configuration.path );
	if( !fs.existsSync( this.taskPath ) ) {
		fs.mkdirSync( this.taskPath );
	}
}




TaskRepository.prototype.getFilePath = function( taskID, implementation, file ) {
	if( !implementation )
		implementation = 'default'
	if( !file )
		file = 'home.html'
	var filePath = path.join( this.taskPath, ""+taskID, implementation, file );
	return filePath;
};
TaskRepository.prototype.check = function( taskID, implementation, file ) {
	return fs.existsSync( this.getFilePath( taskID, implementation, file ) );
};

TaskRepository.prototype.API = {};

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
		} catch( error ) {
			log.error( error );
			res.render('error', {
				title: 'Request error',
				message: error
			});
		}
	} );
}

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
				var codeAvailable = self.check( parentTask ) || self.check( body.id );

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
					code: codeAvailable
				});
			}
		} catch( error ) {
			log.error( error );
			res.render('error', {
				title: 'Request error',
				message: error
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
	var taskID = parseInt( req.params.task );
	var files = req.files;


	log.debug( 'Code name: '+codeName );
	var self = this;
	this.requester.get( taskID, 'details', function( error, body ) {
		try {
			if( error )
				throw error;
			
			body = JSON.parse(body);

			var parentTask = parseInt( ( body.isMicroTask )? body.task : body.id );

			// Save to FS function
			var saveFiles = function( files ) {
				log.debug( 'Saving data to filesystem' );

				for( fileID in files) {
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
			}

			saveFiles( files );

		} catch( error ) {
			log.error( error );
			res.render('error', {
				title: 'Request error',
				message: error
			});
		}

	} );
};

TaskRepository.prototype.API.run = function(req, res) {
	var taskID = parseInt( req.params.task );
	var implementation = req.params.implementation || 'default';
	var file = req.params.file || 'home.html';

	var self = this;
	this.requester.get( taskID, 'details', function( error, body ) {
		try {
			if( error )
				throw error;
			
			body = JSON.parse( body );

			var parentTask = body.task;
			var filePath = self.getFilePath( body.id, implementation, file );
			var codeAvailable = self.check( body.id, implementation, file );

			if( parentTask && !codeAvailable ) {
				filePath = self.getFilePath( parentTask, implementation, file );
				codeAvailable = self.check( parentTask, implementation, file );
			}
			

			if( codeAvailable ) {
				res.sendfile( filePath );
			} else {
				res.send( 'Not found', 404 );
			}
		} catch( error ) {
			log.error( error );
			res.render('error', {
				title: 'Request error',
				message: error
			});
		}
	} );
};


TaskRepository.prototype.API.input = function(req, res) {
	var taskID = parseInt( req.params.task );
	var field = req.params.field || '*';

	var self = this;
	this.requester.get( taskID, 'details', 'objects', function( error, body ){ 
		try {
			if( error )
				throw error;
			
			body = JSON.parse(body);

			var data;
			if( field!='*' ) {
				data = {
					id: [],
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
		} catch( error ) {
			log.error( error );
			res.render('error', {
				title: 'Request error',
				message: error
			});
		}
	} );
};

TaskRepository.prototype.API.configuration = function(req, res) {
	var taskID = parseInt( req.params.task );
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
				for( index in body.configurations ) {
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
				throw "Not implemented"
			}
		} catch( error ) {
			log.error( error );
			res.render('error', {
				title: 'Request error',
				message: error
			});
		}
	} );
};

TaskRepository.prototype.API.postResult = function(req, res) {
	var taskID = parseInt( req.params.task );

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
		} catch( error ) {
			log.error( error );
			res.render('error', {
				title: 'Request error',
				message: error
			});
		}
	} );
};

















exports = module.exports = TaskRepository;
