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

    module.getOrders = function (req, res) {
        client.lrange(0, -1, function (err, replies) {
            res.send(replies);
        });
    }

    // modules set order completed

    return module;
}