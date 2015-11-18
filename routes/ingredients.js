module.exports = function initialize (params) {

    var db = params.database;
    var ObjectId = require('mongodb').ObjectID;

    module.findAll = function(req, res) {
        console.log('Retrieving all ingredients:');
        db.collection('ingredients').find().toArray(function(err, items) {
                console.log(items);
                res.send(items);
        });
    };

    module.addIngredient = function(req, res) {
        var ingredient = req.body;
        console.log('Adding ingredient: ' + JSON.stringify(ingredient));
        db.collection('ingredients').insert(ingredient, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred'});
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
                res.send(result[0]);
            }
        });
    }
     
    module.deleteIngredient = function(req, res) {
        var id = req.params.id;
        var name = '';

        db.collection('ingredients').findOneAndDelete({'_id': new ObjectId(id)}, function(err, item) {
            if(err) {
                console.log('not found');
                res.send('nothing found');
            } else {
                console.log(item);
                name = item.name;

                console.log('Deleting ingredient: ' + id + 'with name ' + name);
                db.collection('dishes').update({ ingredients : name} ,{$pull: {ingredients: name}}, {w:1, multi:true}, function (err, result) {
                    console.log(result);
                });
            }
        });
    }

    module.updateIngredient = function(req, res) {
        var id = req.params.id;
        var ingredient = req.body;
        console.log('Updating categoru: ' + id);
        console.log(ingredient);
        delete ingredient._id;
        delete ingredient.id;
        
        db.collection('ingredients').update({'_id': new ObjectId(id)}, ingredient, {safe:true}, function(err, result) {
            if (err) {
                console.log('Error updating ingredient: ' + err);
                res.send({'error':'An error has occurred'});
            } else {
                console.log('' + result + ' document(s) updated');
                res.send(ingredient);
            }
        });
    }

    module.findById = function(req, res) {
        var id = req.params.id;
        console.log('Retrieving ingredient: ' + id);
        
        db.collection('ingredients').findOne({'_id': new ObjectId(id)}, function(err, item) {
            if(err) {
                console.log('not found');
                res.send('nothing found');
            } else {
                console.log(item);
                res.send(item);
            }
        });
    }

    return module;
}
