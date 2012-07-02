/*
 * Task Repository module
 * TODO: Move to a separated server
 */
var config = require( '../../config' );

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


Requester.prototype.save = function( task ) {

};
Requester.prototype.load = function( task ) {

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
		urlConfig.method = 'GET';
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

Requester.prototype.post = function( config, callback, force ) {
if( typeof(config)=='string' ) {
		config = {
			url: config
		};
	}


	var urlConfig = _.extend( {}, this.defaultObj, config );
	urlConfig.method = 'POST';
	console.log( urlConfig.body );
	urlConfig.body = JSON.stringify( urlConfig.body );
	console.log( urlConfig.body );

	var self = this;
	request( urlConfig, function( error, response, body ) {

		// Cache only the good responses
		if( response.statusCode==200 ) {
			self.cache[ urlConfig.url ] = body;
		}
		callback( error, response, body );
	} );
};





module.exports = exports = Requester;