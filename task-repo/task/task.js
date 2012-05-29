/*
 * Task Class
 */

var config = require( '../../config' );

var log		= config.logger,
	_		= config._,
	mongo	= config.mongo;

var uTask = require( '../micro-task' );




var taskPrefix = "task";

var Task = function( ) {
	this.uid = uid( taskPrefix );
	this.uTaskList = [];
	this.schema = {};

	log.info( f( 'Task instance (%s) created', this.uid ) );

	this.init();
};

Task.prototype.init = function() {
	var uTaskI = new uTask( this.uid );
	this.addMicroTask( uTaskI );
};






Task.prototype.addMicroTask = function( uTask ) {
	this.uTaskList.push( uTask );
};

exports = module.exports = Task;