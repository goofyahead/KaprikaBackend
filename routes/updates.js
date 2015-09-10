module.exports = function initialize (params) {

    console.log(params);
    var client = params.redis;
    var redis = require("redis");

    module.updateTimestamp = function(req, res, next) {
        // If its not part of the current menu is not worth it, separate data from videos or images...
        console.log('updating timestamp');
        client.set("last_update", Math.floor(new Date() / 1000), redis.print);
        next();
    }

    module.getTimestamp = function (req, res) {
        client.get("last_update", function (err, reply) {
            console.log('last modification timestamp ' + reply);
            res.send(reply);
        });
    }

    return module;
}