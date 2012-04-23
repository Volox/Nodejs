(function() {
	
	var taskInstance = function() {
		console.log( 'Task instance created' );
	};
	
	taskInstance.prototype.run = function() {
		console.log( 'Task instance runnung' );
		alert( 'Wow' );
		console.log( 'Task instance runnung' );
	};

	taskInstance.prototype.send = function( url ) {
		$.ajax( {
			url: url,
			type: 'put',
			success: function() {

			},
			error: function() {
				console.log( 'Send error', arguments );
			},
			complete: function() {},
		} );
	};
	
	
	return new taskInstance();
} )();