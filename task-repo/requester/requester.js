/*
 * Task Repository module
 * TODO: Move to a separated server
 */
var config = require( '../../config' );

var log		= config.logger,
	_		= config._,
	fs		= config.fs,
	url		= require( 'url' ),
	request = config.request,
	mongoDB	= config.mongoDB;



var Requester = function( defaults ) {
	this.name = "Task requester";

	this.configuration = config.nconf.get( 'crowdsearch' );

	this.useCache = this.configuration.cache;
	this.cache = {};
	
	this.hostname = this.configuration.hostname;
	this.port = this.configuration.port;
	this.appPath = this.configuration.appPath;
};


Requester.prototype.checkResult = function( config, callback ) {
	var errorMessage;
	if( !config.error ) {
		if( config.response.statusCode!=200) {
			errorMessage = config.response || config.body
		} else {
			// Cache only good responses
			this.cache[ config.url ] = config.body;
		}
	} else {
		errorMessage = config.error;
	}

	callback( errorMessage, config.body );
};

Requester.prototype.request = function( obj ) {
	var callback = obj.callback;
	var apiConfig = this.configuration.API[ obj.API ];
	var query = false;
	if( apiConfig.params ) {
		query = _.extend( {}, apiConfig.params );
		query.q = obj.task;
		query.selectors = JSON.stringify( obj.filter );
	}
	var apiUrl = url.format( {
		protocol: 'http',
		hostname: this.hostname,
		port: this.port,
		pathname: this.appPath+'/'+apiConfig.path,
		query: ( query )? query : undefined
	});
	var config = {
		url: apiUrl,
		method: apiConfig.method,
		body: JSON.stringify( obj.body )
	};

	log.debug( f( 'Requesting url: %s', config.url ) );
	if( this.useCache && this.cache[ config.url ] ) {
		log.debug( 'Using cached resource' );
		callback( null, this.cache[ config.url ] );
	} else {
		log.debug( 'Using remote resource' );
		var self = this;
		request( config, function( error, response, body ) {
			self.checkResult( {
				error: error,
				response: response,
				body: body,
				url: config.url
			}, callback );
		} );
	}
}

Requester.prototype.get = function( task, API, filter, callback ) {
	if( !callback ) {
		callback = filter;
		filter = '*';
	}
	var obj = {
		task: task,
		API: API,
		filter: filter,
		callback: callback
	};

	return this.request( obj );
};

Requester.prototype.post = function( task, API, callback ) {

	return this.request( config, callback, force );
};





module.exports = exports = Requester;