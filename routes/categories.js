module.exports = function initialize (params) {

    console.log(params);
    var db = params.database;
    var ObjectId = require('mongodb').ObjectID;

    module.findAll = function(req, res) {
        console.log('Retrieving all categories:');
        db.collection('categories').find().toArray(function(err, items) {
            if (err) console.log(err);
            console.log('categories', items);
            res.send(items);
        });
    };

    module.addCategory = function(req, res) {
        var category = req.body;
        console.log('Adding category: ' + JSON.stringify(category));
        db.collection('categories').insert(category, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred'});
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
                res.send(result[0]);
            }
        });
    };

    module.updateCategory = function(req, res) {
        var id = req.params.id;
        var category = req.body;
        console.log('Updating categoru: ' + id);
        console.log(category);
        delete category._id;
        delete category.id;

        db.collection('categories', function(err, collection) {
            collection.update({'_id': new ObjectId(id)}, category, {safe:true}, function(err, result) {
                if (err) {
                    console.log('Error updating category: ' + err);
                    res.send({'error':'An error has occurred'});
                } else {
                    console.log('' + result + ' document(s) updated');
                    res.send(category);
                }
            });
        });
    };

    module.findById = function(req, res) {
        var id = req.params.id;
        console.log('Retrieving category: ' + id);
        db.collection('categories').findOne({'_id': new ObjectId(id)}, function(err, item) {
            if(err) {
                console.log('not found');
                res.send('nothing found');
            } else {
                console.log(item);
                res.send(item);
            }
        }); 
    };

    module.deleteCategory = function(req, res) {
        var id = req.params.id;
        var name = '';

        db.collection('categories').findOne({'_id': new ObjectId(id)}, function(err, item) {
            if(err) {
                console.log('not found');
                res.send('nothing found');
            } else {
                console.log(item);
                name = item.name;

                db.collection('categories').remove({'_id':new ObjectId(id)}, {safe:true}, function(err, result) {
                    if (err) {
                        res.send({'error':'An error has occurred - ' + err});
                    } else {
                        console.log('' + result + ' document(s) deleted');
                        res.send(req.body);
                    }
                });

                console.log('Deleting category: ' + id + 'with name ' + name);

                db.collection('dishes', function(err, dishCollection) {
                    if (err) {
                        console.log('error opening dishes collection on delete');
                    } else {
                        console.log('opening ok');
                        dishCollection.update( { categories : name} ,{$pull: {categories: name}}, {w:1, multi:true}, function (err, result) {
                            console.log(result);
                        });
                    }
                });
            }
        });
};
    return module;
}

