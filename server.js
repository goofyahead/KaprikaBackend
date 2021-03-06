var MongoClient = require('mongodb').MongoClient
, assert = require('assert');
var braintree = require("braintree");
var gateway = braintree.connect({
    environment:  braintree.Environment.Sandbox,
    merchantId:   'hdvw3ktdqkmdk4mr',
    publicKey:    '2795bdyfcbp3gv83',
    privateKey:   'c39d86e4c0646ae19075a298e87bad7c'
});

var async = require('async');
// Connection URL
var url = 'mongodb://localhost:27017/kaprika';
// Use connect method to connect to the Serverv

MongoClient.connect(url, function(err, db) {
    var redis = require("redis"),
        client = redis.createClient();
    assert.equal(null, err);
    console.log("Connected correctly to server");

    var express = require('express');
    var secureApp = express();
    // var app = express();
    var securesecureApp = express();
    var dishes = require('./routes/dishes')({database : db});
    var categories = require('./routes/categories')({database : db});
    var menus = require('./routes/menus')({database : db});
    var ingredients = require('./routes/ingredients')({database : db});
    var validation = require('./routes/validation.js')({database : db});
    var tags = require('./routes/tags')({database : db});
    var updates = require('./routes/updates')({redis: client});
    var clients = require('./routes/clients')({database : db});
    var orders = require('./routes/orders')({redis: client, database : db});

    var files = require('./routes/files');
    var logOn = require('./routes/logon');
    var https = require('https');
    var http = require('http');
    var fs = require('fs');
    var HTTP_PORT= 80;
    var HTTPS_PORT = 4433;
    var HTTP_PORT_2 = 8081;
    var cookieParser = require('cookie-parser');
    var bodyParser = require('body-parser');
    var favicon = require('static-favicon');

    var options = {
      key: fs.readFileSync('./manageat-key.pem'),
      cert: fs.readFileSync('./manageat-cert.pem')
    };


  // app.use('/images', express.static(__dirname + '/public/images'));
  // app.use('/videos', express.static(__dirname + '/public/videos'));
  // app.use(bodyParser.json());
  // app.use(bodyParser.urlencoded());
  // app.use(cookieParser());


secureApp.use(express.static(__dirname + '/public'));
secureApp.use('/images', express.static(__dirname + '/public/images'));
secureApp.use('/videos', express.static(__dirname + '/public/videos'));
secureApp.use(bodyParser.json());
secureApp.use(bodyParser.urlencoded());
secureApp.use(cookieParser());


var multipart = require('connect-multiparty');

var multipartMiddleware = multipart({
    uploadDir: './myTemp' 
});

//PAYMENT ENDPOINT take ALL payments to a route
secureApp.get("/payments/client_token", function (req, res) {
  gateway.clientToken.generate({}, function (err, response) {
    if (err) console.log(err);
    res.send({accessToken: response.clientToken});
  });
});

secureApp.post("/payments/payment-methods", function (req, res) {
  var items = req.body.itemList;
  var nonce = req.body.nonce;
  var order = req.body;

  console.log(req.body);
  console.log('----------ITEMS--------')
  console.log(JSON.stringify(items));

  console.log('-------------------');
  console.log('processing payment');
  console.log('-------------------');
  console.log('FbId: ', order.fbId);
  console.log('Nonce: ', nonce);
  console.log('TimeStamp: ', Date.now());
  console.log('-------------------');

  var sumCart = {};
  var total = 0;

  async.forEachOf(items, function (value, key, callback) {
    dishes.getById(key, function (dish) {
      sumCart[key] = parseFloat(parseFloat(dish.price).toFixed(2)) * parseInt(value.quantity);
      callback();
    });
  }, function (err) {
    if (err) console.error(err.message);
    // configs is now a map of JSON data
    console.log('finished');
    for (var id in sumCart){
      total = total + parseFloat(sumCart[id].toFixed(2));
    }

  // Set time where server receive the order
  order.timestamp = Date.now().toString();
  order.status  = "RECIBIDO";
  order.amount = total.toFixed(2);
  console.log('-------------------');
  console.log('       ' + total.toFixed(2));
  console.log('-------------------');
  console.log(total.toFixed(2));

  clients.getClientByFbIdInternal(order.fbId, function (client) {
    console.log('------------------------');
    console.log('       CLIENT DATA      ');
    console.log('------------------------');
    console.log (client);

    order.address = client;

    gateway.transaction.sale({
    amount: total.toFixed(2),
    paymentMethodNonce: nonce,
    }, 
    function (err, result) {
      if (err) {
        res.sendStatus(500);
        console.log(result);
      } else {
        res.sendStatus(200);
        // add order to print queue
        orders.addOrderToPrint(order);

        // store orders for historic too in mongoDB

        // this goes to orders for web view
        orders.addOrder(order);
        console.log('transaction OK');
      }
    });
  });

  
  });
});

//WHILE NOT SSL CERT DEPLOYED
secureApp.get('/api/currentmenu', dishes.getCurrentMenu);
secureApp.get('/api/tags', tags.findAll);
secureApp.get('/api/menus', menus.findAll);
secureApp.get('/api/ingredients', ingredients.findAll);
secureApp.get('/api/categories', categories.findAll);
secureApp.get('/api/unasignedvideos', files.getUnasignedVideos);
//A public API can be specified for get categories etc, that will hide the ones
//not in current selection.
secureApp.get('/api/lastUpdate', updates.getTimestamp);
secureApp.get('/api/ordersToPrint', orders.getOrdersToPrint);

//GET REQUESTS
secureApp.get('/api/dishes', validation.validate, dishes.findAll);
secureApp.get('/api/dishes/:id', validation.validate, dishes.findById);
secureApp.get('/api/dishes/search/:query?', validation.validate, dishes.query);
secureApp.get('/api/menus/:id', validation.validate, menus.findById);
secureApp.get('/api/tags/:id', validation.validate, tags.findById);
secureApp.get('/api/ingredients/:id', validation.validate, ingredients.findById);
secureApp.get('/api/categories/:id', validation.validate, categories.findById);
secureApp.get('/api/clients/fb/:fbId', clients.getClientByFbId);
secureApp.get('/api/clients/phone/:phone', clients.getClientByPhone);
secureApp.get('/api/orders', orders.getOrders);

// APP CLIENTE GETS
secureApp.get('/api/clientActiveOrders/fb/:fbId', orders.getActiveOrdersFromClient);
secureApp.get('/api/clientHistoryOrders/fb/:fbId', orders.getHistoryOrdersFromClient);
secureApp.get('/api/clientFavOrders/fb/:fbId', orders.getFavOrdersFromClient);

//PUT REQUEST
secureApp.put('/api/dishes/:id', validation.validate, updates.updateTimestamp, dishes.updateDish);
secureApp.put('/api/categories/:id', validation.validate, updates.updateTimestamp, categories.updateCategory);
secureApp.put('/api/menus/:id', validation.validate, updates.updateTimestamp, menus.updateMenu);
secureApp.put('/api/tags/:id', validation.validate, updates.updateTimestamp, tags.updateTag);
secureApp.put('/api/ingredients/:id', validation.validate, updates.updateTimestamp, ingredients.updateIngredient);

//POST REQUEST
secureApp.post('/api/login', logOn.logIn);
secureApp.post('/api/dishes', validation.validate, updates.updateTimestamp, dishes.addDish);
secureApp.post('/api/categories', validation.validate, updates.updateTimestamp, categories.addCategory);
secureApp.post('/api/menus', validation.validate, updates.updateTimestamp, menus.addMenu);
secureApp.post('/api/tags', validation.validate, updates.updateTimestamp, tags.addTag);
secureApp.post('/api/ingredients', validation.validate, updates.updateTimestamp, ingredients.addIngredient);
secureApp.post('/api/file-upload', multipartMiddleware, updates.updateTimestamp, files.uploadPhoto);
secureApp.post('/api/video-upload', updates.updateTimestamp, multipartMiddleware,files.uploadVideo);
secureApp.post('/api/clear-files', files.clearImagelist); //SECURITY HOLE!! ADD CREDENTIALS TO THIS REQ
secureApp.post('/api/clients', clients.saveClient);
secureApp.post('/api/orders/:id', orders.updateOrderStatus);
secureApp.post('/api/orderFromKaprika', orders.internalOrder);


//DELETE REQUEST
secureApp.delete('/api/dishes/:id', validation.validate, updates.updateTimestamp, dishes.deleteDish);
secureApp.delete('/api/categories/:id', validation.validate, updates.updateTimestamp, categories.deleteCategory);
secureApp.delete('/api/menus/:id', validation.validate, updates.updateTimestamp, menus.deleteMenu);
secureApp.delete('/api/ingredients/:id', validation.validate, updates.updateTimestamp, ingredients.deleteIngredient);
secureApp.delete('/api/tags/:id', validation.validate, updates.updateTimestamp, tags.deleteTag);

// https.createServer(options, secureApp).listen(HTTPS_PORT);
// app.listen(HTTP_PORT);
secureApp.listen(HTTP_PORT);
console.log('Listening http on port ' + HTTP_PORT +' and htpps on ' + HTTPS_PORT);
});

