var config = require( 'config' );

var log = config.logger,
	mongo = require( 'mongojs' );

log.debug( 'asdasdad' );
console.log( "TaskRepository", config, log );


function TaskRepository( configuration ) {
	this.name = "Task Repository";


}


TaskRepository.prototype = {
	actions: {
		"create": ""
	}
};


exports = module.exports = TaskRepository;