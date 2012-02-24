
/*
 * GET home page.
 */

exports.index = function(req, res){
	res.render('index', {
		name: 'Volox',
		title: 'ExpressJS title'
	});
};