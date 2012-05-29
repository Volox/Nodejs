/*
 * MicroTask Class
 */

var config = require( '../../config' );

var log		= config.logger,
	_		= config._,
	mongo	= config.mongo;

var uTaskPrefix = "utask";

var uTask = function( taskUID ) {
	this.uid = uid( uTaskPrefix );
	this.taskUID = taskUID;
	log.info( f( 'MicroTask (%s) for task (%s) created', this.uid, this.taskUID ) );

	this.init();
};




uTask.prototype.init = function() {

};




exports = module.exports = uTask;