module.exports = function initialize (params) {

    var uuid = require('node-uuid');
    var client = params.redis;
    var redis = require("redis");
    var db = params.database;
    var gcm = require('node-gcm');
    var sender = new gcm.Sender('AIzaSyAtgUrJUvIc4bOduyGA_GeC_IH_fmdYWMY');

    module.internalOrder = function (req, res) {
        var order = req.body.order;
        var client = req.body.client;

        console.log('order from kaprika');
        console.log('------------------');
        console.log(order);
        console.log(client);

        order.address = client;
        order.timestamp = Date.now().toString();
        order.status  = "RECIBIDO";
        order.nonce = uuid.v1(); // GENERATE NONCE

        module.addOrderToPrint(order);
        module.addOrder(order);

        res.send("OK");
    }

    module.addOrder = function (order) {
        // If its not part of the current menu is not worth it, separate data from videos or images...
        console.log('updating timestamp');
        db.collection('orders').insert(order, function(err, item) {
            if(! item) {
                console.log('error storing order');
            } else {
                console.log('order stored');
            }
        });

        client.rpush("orders", JSON.stringify(order), redis.print);
        return;
    }

    module.addOrderToPrint = function (order) {
        console.log('updating timestamp');
        client.rpush("ordersToPrint", JSON.stringify(order), redis.print);
        return;
    }

    module.getOrdersToPrint = function (req, res) {
        client.lpop("ordersToPrint", function (err, reply) {
            if (reply) {
                console.log("requested orders to print:");
                console.log(JSON.parse(reply));
            }
            res.send(JSON.parse(reply));
        });
    }

    module.getHistoryOrdersFromClient = function (req, res) {
        var fbId = req.params.fbId;

        db.collection('orders').find({fbId: fbId}, {sort : [['timestamp','desc']], limit : 10}).toArray(function (err, items) {
            if (err) {
                console.log(err);
                res.send();
            } else {
                console.log(items);
                res.send(items);
            }
        });
    }

    module.updateOrderStatus = function (req, res) {
        var orderNonce = req.params.id;
        var status = req.body.status;
        console.log("ORDER STATUS TO :" + status);

        db.collection('orders').findAndModify(
            {nonce: orderNonce}, // query
            [['_id','asc']],  // sort order
            {$set: {status: status ? "REPARTO" : "ELEFANTE"}}, 
            {new : true}, // options
            function(err, object) {
                // notify user
                if (object.value.address.gcmId){
                    console.log('this is the modified object');
                    console.log(object.value);
                    var message = new gcm.Message();
                    message.addData({ 'ORDER' : object.value.status,
                        'DELIVERY' : object.value.deliveryOption });

                    var regTokens = [object.value.address.gcmId];
                    sender.send(message, { registrationIds: regTokens }, function (err, result) {
                        if(err) console.error(err);
                        else    console.log(result);
                    });
                }

                // remove from redis list
                client.lpop("orders"), function (err, item) { 
                    console.log('removing top order');
                    console.log(item);
                };
                // notify user that is on its way
                // console.log(object);
                res.send(object);
            });
    }

    module.getFavOrdersFromClient = function (req, res) {
        var fbId = req.params.fbId;

        db.collection('orders').find({fbId: fbId}, {sort : [['timestamp','desc']], limit : 10}).toArray(function (err, items) {
            if (err) {
                console.log(err);
                res.send();
            } else {
                console.log(items);
                res.send(items);
            }
        });
    }

    module.getActiveOrdersFromClient = function (req, res) {
        var fbId = req.params.fbId;


        db.collection('orders').find({fbId: fbId, status: { $not : /ENTREGADO/ }}, {sort : [['timestamp','desc']], limit : 10}).toArray(function (err, items) {
            if (err) {
                console.log(err);
                res.send();
            } else {
                console.log(items);
                res.send(items);
            }
        });
    }

    module.getOrders = function (req, res) {
        client.lrange("orders", 0, -1, function (err, replies) {
            if (err) console.log(err);
            // console.log("orders: " + replies);
            //parse each object
            var parsedResponse = replies.map(function parse (obj){
                return JSON.parse(obj);
            });
            res.send(parsedResponse);
        });
    }
    // modules set order completed
    return module;
}