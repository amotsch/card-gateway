var express = require('express');
var bodyParser = require('body-parser');
var config = require('./app/config');
var bank = require('./app/modules/bank');

// Use Framework express
var app = express();

// Use to parse post request
var parseUrlEncoded = bodyParser.urlencoded({extended : false});

// Public folder
app.use(express.static("./app/public"));

//initialization of bank module
bank.init();

//init database
var MongoClient = require('mongodb').MongoClient;


app.get('/', function(req,response){
	response.sendFile(__dirname + "/app/views/index.html");
});


app.post('/payment', parseUrlEncoded, function(request, response){
	var form = request.body;
	
	bank.payment(form, function(err, paymentTransaction){
		//payment success
		if(!err){
			MongoClient.connect(config.database.url, function(err, db) {
				if(!err) {
				    var collectionPayment = db.collection('payments');
				    //Create payment
				    var payment = {name: form.name, amount: form.price, currency: form.currency, date: new Date(), card: form.number};
				    collectionPayment.insert(payment, function (err, result) {
				    	if (err) {
				    		console.log(err);
				    	} 
				    	else {
				    		console.log('payment ' + paymentTransaction + ' insert ');
				    	}
				    });
				}
			});
			// to save credits card
			//#1 Let PayPal and Braintree manage this for you if possible
			//#2 Use a service to manage it even if it costs money: http://www.authorize.net. This will not have to worry about security problems, attempts at fraud, hack your BDD
			//#3 encryption AES 256bits + BASE should be accessible only locally with a user / password secured and changed regularly
			
		    console.log("Payment successful: " + form.name + ", " + form.price + " " + form.currency + ", transaction: " + paymentTransaction);
		    response.end("Payment successful : " + form.price + " " + form.currency + " , transaction: " + paymentTransaction);
		}
		else{
			console.log("Payment error");
			console.log(err);
			response.status(400).end(err.toString());
		}
	});
	
});


app.get("/braintree_client_token", function (req, res) {
	bank.getTokenBraintree(function(err,token){
		res.end(token);
	});
	
});

app.listen(config.port, function(){
	console.log("Node listen on " + config.port);
});

