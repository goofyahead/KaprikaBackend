module.exports = function initialize (params) {

    var db = params.database;
    var ObjectId = require('mongodb').ObjectID;

	module.validate = function(req, res, next) {
		console.log('validating authorization');

		var auth = req.headers.authorization;

		// console.log(auth);
		
		db.collection('users').findOne({'key': auth}, function(err, item) {
			if(! item) {
				res.send(401, { error: 'unauthorized' });
				console.log('unauthorized access');
			} else {
				console.log('loged in');
				next();
			}
		});
	}

	return module;
}