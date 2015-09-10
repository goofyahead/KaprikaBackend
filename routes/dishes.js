module.exports = function initialize (params) {

    console.log(params);
    var db = params.database;
    var ObjectId = require('mongodb').ObjectID;

    module.query = function (req, res) {
        console.log('query captured');
        console.log(req.query);
        var type = req.query.type;
        var value = req.query.value;
        console.log(type + " : " + value);
        var temp = {};
        temp[type] = value;
        
        db.collection('dishes').find(temp).toArray(function(err, items) {
                    if(err) {
                        console.log('not found');
                        res.send('nothing found');
                    } else {
                        console.log(items);
                        res.send(items);
                    }
        });
    };

    module.findById = function(req, res) {
        // if (checkAuth(req, res)){
            var id = req.params.id;
            console.log('Retrieving dish: ' + id);

            db.collection('dishes').findOne({'_id': new ObjectId(id)}, function(err, item) {
                        if(err) {
                            console.log('not found');
                            res.send('nothing found');
                        } else {
                            console.log(item);
                            res.send(item);
                        }
                    });
    };

    module.getById = function(id, cb) {
        db.collection('dishes').findOne({'_id': new ObjectId(id)}, function(err, item) {
            if(err) {
                console.log('not found');
                cb();
            } else {
                cb(item);
            }
        });
    }

    module.getCurrentMenu = function (req, res) {
        db.collection('menus').findOne({'active' : true}, function (err, item) {
                    if (err) {

                    } else {
                     var currentMenu = item.name;
                     db.collection('dishes', function (err, dishCollection) {
                        dishCollection.find({"menu.name": currentMenu}).toArray(function(err, items) {
                            if(err) {
                                console.log('not found');
                                res.send('nothing found');
                            } else {
                                console.log(items);
                                res.send(items);
                            }
                        });
                    });
                 }
             });
    };

    module.updateDish = function(req, res) {
        var id = req.params.id;
        var dish = req.body;
        console.log('Updating dish: ' + id);
        console.log(dish);
        delete dish._id;
        delete dish.id;
        
        db.collection('dishes', function(err, collection) {
            collection.update({'_id': new ObjectId(id)}, dish, {safe:true}, function(err, result) {
                if (err) {
                    console.log('Error updating dish: ' + err);
                    res.send({'error':'An error has occurred'});
                } else {
                    console.log('' + result + ' document(s) updated');
                    res.send(dish);
                }
            });
        });
    };

    module.findAll = function(req, res) {
        console.log('Retrieving all dishes:');
        db.collection('dishes').find().toArray(function(err, items) {
                console.log(items);
                res.send(items);
        });
    };

    module.addDish = function(req, res) {
        var dish = req.body;
        console.log('Adding dish: ' + JSON.stringify(dish));
        db.collection('dishes').insert(dish, {safe:true}, function(err, result) {
                if (err) {
                    res.send({'error':'An error has occurred'});
                } else {
                    console.log('Success: ' + JSON.stringify(result[0]));
                    res.send(result[0]);
                }
            });
    };

    module.deleteDish = function(req, res) {
        var id = req.params.id;
        console.log('Deleting dish: ' + id);
        db.collection('dishes').remove({'_id':new ObjectId(id)}, {safe:true}, function(err, result) {
                if (err) {
                    res.send({'error':'An error has occurred - ' + err});
                } else {
                    
                    db.collection('dishes').update( {} ,{$pull: {recommendations: {_id: id}}}, {w:1, multi:true}, function (err, result) {
                        console.log(result);
                    });

                    console.log('' + result + ' document(s) deleted');
                    res.send(req.body);
                }
        });
    };

    checkAuth = function(req, res){
        console.log('new parameter ' + req.query.element);
        var auth = req.headers.authorization;
        console.log('headers ' + auth);
        var user = auth.split(':')[0];
        console.log(user);
        if (req.params.auth === 'AAAA'){
            return true;
        } else {
            res.send('auth error',401);
            return false;
        }
    };

    return module;
}