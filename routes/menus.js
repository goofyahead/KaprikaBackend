module.exports = function initialize (params) {

    var db = params.database;
    var ObjectId = require('mongodb').ObjectID;

    module.findAll = function(req, res) {
        console.log('Retrieving all menus:');
        db.collection('menus').find().toArray(function(err, items) {
            console.log(items);
            res.send(items);
        });
    };

    module.addMenu = function(req, res) {
        var menu = req.body;
        console.log('Adding menu: ' + JSON.stringify(menu));
        db.collection('menus', function(err, collection) {
            collection.insert(menu, {safe:true}, function(err, result) {
                if (err) {
                    res.send({'error':'An error has occurred'});
                } else {
                    console.log('Success: ' + JSON.stringify(result[0]));
                    res.send(result[0]);
                }
            });
        });
    }

    module.deleteMenu = function(req, res) {
        console.log('************deleting menu**************');

        var id = req.params.id;
        var name = '';

        db.collection('menus').findOneAndDelete({'_id': new ObjectId(id)}, function(err, item) {
            if(err) {
                console.log('not found');
                res.send('nothing found');
            } else {
                console.log(item);
                name = item.name;
                console.log('Deleting menu: ' + id + ' with name ' + name);
                db.collection('dishes').update( { menu : name } ,{ $pull: { menu: name }}, {w:1, multi:true}, function (err, result) {
                    console.log(result);
                });
            }
        });
    }

    module.findById = function(req, res) {
        var id = req.params.id;
        console.log('Retrieving menu: ' + id);

        db.collection('menus').findOne({'_id': new ObjectId(id)}, function(err, item) {
                    if(err) {
                        console.log('not found');
                        res.send('nothing found');
                    } else {
                        console.log(item);
                        res.send(item);
                    }
        });
    }

    module.updateMenu = function(req, res) {
        var id = req.params.id;
        var menu = req.body;
        console.log('Updating menu: ' + id);
        console.log(menu);
        delete menu._id;
        delete menu.id;
        
        db.collection('menus').update({'_id': new ObjectId(id)}, menu, {safe:true}, function(err, result) {
                if (err) {
                    console.log('Error updating menu: ' + err);
                    res.send({'error':'An error has occurred'});
                } else {
                    console.log('' + result + ' document(s) updated');
                    res.send(menu);
                }
        });
    }

    return module;
}