(function() {
	
	var taskInstance = function() {
		console.log( 'Task instance created' );
	};
	
	taskInstance.prototype.run = function() {
		console.log( 'Task instance runnung' );
		alert( 'Wow' );
		console.log( 'Task instance runnung' );
	};
	
	
	return new taskInstance();
} )();