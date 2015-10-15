module.exports = function initialize (params) {

    console.log(params);
    var client = params.redis;
    var redis = require("redis");

    module.addOrder = function (order) {
        // If its not part of the current menu is not worth it, separate data from videos or images...
        console.log('updating timestamp');
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