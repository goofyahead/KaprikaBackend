
module.exports = function initialize (params) {

    var db = params.database;
    var ObjectId = require('mongodb').ObjectID;

    module.findAll = function(req, res) {
        console.log('Retrieving all tags:');
        db.collection('tags').find().toArray(function(err, items) {
            console.log(items);
            res.send(items);
        });
    };

    module.addTag = function(req, res) {
        var tag = req.body;
        console.log('Adding tag: ' + JSON.stringify(tag));
        db.collection('tags').insert(tag, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred'});
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
                res.send(result[0]);
            }
        });
    }
     
    module.deleteTag = function(req, res) {
        var id = req.params.id;
        var name = '';

        db.collection('tags').findOne({'_id': new ObjectId(id)}, function(err, item) {
                    if(err) {
                        console.log('not found');
                        res.send('nothing found');
                    } else {
                        console.log(item);
                        name = item.name;
                        console.log('Deleting tag: ' + id + 'with name ' + name);

                        db.collection('dishes').update({ tags : name} ,{$pull: {tags: name}}, {w:1, multi:true}, function (err, result) {
                                    console.log(result);
                        });
                    }
        });
    }

    module.updateTag = function(req, res) {
        var id = req.params.id;
        var tag = req.body;
        console.log('Updating categoru: ' + id);
        console.log(tag);
        delete tag._id;
        delete tag.id;
        
        db.collection('tags').update({'_id': new ObjectId(id)}, tag, {safe:true}, function(err, result) {
                if (err) {
                    console.log('Error updating tag: ' + err);
                    res.send({'error':'An error has occurred'});
                } else {
                    console.log('' + result + ' document(s) updated');
                    res.send(tag);
                }
        });
    }

    module.findById = function(req, res) {
        var id = req.params.id;
        console.log('Retrieving tag: ' + id);

        db.collection('tags').findOne({'_id': new ObjectId(id)}, function(err, item) {
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
