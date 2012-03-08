/*
Configuration file
*/
// Required libs
var fs = require( 'fs' ),
	path = require( 'path' );
var prop_file = __dirname + '/configuration.json';
var props = {};
var default_props = {
	
};

/* Load the configuration file */
console.log( 'Loading configuration file' );
try {
	props = JSON.parse( fs.readFileSync(prop_file, 'utf8') );
} catch( err ) {
	console.error( err );
}

// Set the port for the server
props.port = process.env.PORT || props.port;
exports = module.exports = props;