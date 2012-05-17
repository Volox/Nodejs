var config = require( '../config' );

var log = config.logger,
	mongo = require( 'mongojs' );

console.log( "TaskRepository", config, log );


exports = module.exports = TaskRepository;


function TaskRepository( configuration ) {
	this.name = "Task Repository";
}


TaskRepository.prototype = {
	actions: {
		"create": ""
	}
};

