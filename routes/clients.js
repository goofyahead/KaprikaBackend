module.exports = function initialize (params) {

    console.log(params);
    var db = params.database;
    var ObjectId = require('mongodb').ObjectID;

    module.saveClient = function(req, res) {
        var user = req.body;
        
        db.collection('clients').insert(user, function(err, item) {
            if(! item) {
                res.send(401, { error: 'unauthorized' });
                console.log('unauthorized access');
            } else {
                console.log('saved user');
                res.send("OK");
            }
        });
    }

    module.getClientByFbIdInternal = function (fbId, cb) {
        db.collection('clients').findOne({fbId: fbId}, function (err, result) {
            cb(result);
        });
    }

    module.getClientByFbId = function (req, res) {
        db.collection('clients').findOne({fbId: fbId}, function (err, result) {
            res.send(result);
        });
    }

    module.getClientByPhone = function (req, res) {
         db.collection('clients').findOne({phone: phone}, function (err, result) {
            res.send(result);
        });
    }

    return module;
}