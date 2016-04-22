var config = require('../config');
var paypal = require('paypal-rest-sdk');
var braintree = require("braintree");

// gateway used for braintree
var braintreeGateWay;

/**
 * Initialization of the differents payment solution
 */
var init = function() {
	//paypal
	paypal.configure({
		'mode': config.paypal.mode,
		'client_id': config.paypal.client_id,
		'client_secret': config.paypal.client_secret
	});
	
	//braintree
	braintreeGateWay = braintree.connect({
		  environment: braintree.Environment.Sandbox,
		  merchantId: config.braintree.merchantId,
		  publicKey: config.braintree.publicKey,
		  privateKey: config.braintree.privateKey
	});
}


/**
 * Payment method
 */
var payment = function(form, callback){
	if(validateForm(form)){
		var payment = getTypePayment(form.number, form.currency);
		// Paypal
		if( payment == config.payment.paypal){
			var paypalPayment = creationPaypalPayment(form);
			paypal.payment.create(JSON.stringify(paypalPayment), function (error, payment) {
				var transactionId = !error ?  payment.id : null;
			    callback(error, transactionId);
			});
		}
		// Braintree
		else if(payment == config.payment.braintree){
			braintreeGateWay.transaction.sale({
				amount: form.price,
				merchantAccountId: getBraintreeAccount(form.currency),
				paymentMethodNonce: form.nonce,
				  options: {
				    submitForSettlement: true
				  }
				}, 
				function (error, result) {
					var transactionId = !error ?  result.transaction.id : null;
					callback(error, transactionId);
				}
			);
		}
		// no payment
		else{
			callback("AMEX is possible to use only for USD", null);
		}
	}
	else{
		callback("Incorrect form", null);
	}
}

/**
 * Validation form
 * Same rules as Client side rules
 */
var validateForm = function(form){
	//to complete
	if(form.name.split(' ').length < 2){
		return false;
	}
	
	return true;
}


/**
 * if credit card type is AMEX, then use Paypal.
 * if currency is USD, EUR, or AUD, then use Paypal. Otherwise use Braintree.
 * if currency is not USD and credit card is AMEX, return error message, that AMEX is possible to use only for USD
 */
var getTypePayment = function( cardNumber, currency){
	//if currency is not USD and credit card is AMEX, return error message, that AMEX is possible to use only for USD
	if(isAmex(cardNumber) && currency != config.currencies.USD){
		return null;
	}
	//if credit card type is AMEX, USD, EUR, or AUD, then use Paypal.
	else if(isAmex(cardNumber) || (currency == config.currencies.USD || currency == config.currencies.EUR || currency == config.currencies.AUD)){
		return config.payment.paypal;
	}
	// Otherwise use Braintree
	else{
		return config.payment.braintree;
	}
}

/**
 * American Express card numbers start with 34 or 37.
 */
var isAmex = function(number){
	return config.cardType.amex == getCardType(number);
}

/**
 * Return the type of card 
 * visa, mastercard, amex, jcb or discover
 * American Express: ^3[47][0-9]{5,}$ 
 * Visa: ^4[0-9]{6,}$ 
 * MasterCard: ^5[1-5][0-9]{5,}$ 
 * Discover: ^6(?:011|5[0-9]{2})[0-9]{3,}$ 
 * JCB: ^(?:2131|1800|35[0-9]{3})[0-9]{3,}$ 
 */
var getCardType = function(cardNumber){
	var cardType = null;
	
	var patternAmex = new RegExp("^3[47][0-9]{5,}$");
	var patternVisa = new RegExp("^4[0-9]{6,}$");
	var patternMasterCard = new RegExp("^5[1-5][0-9]{5,}$");
	var patternJcb = new RegExp("^(?:2131|1800|35[0-9]{3})[0-9]{3,}$");
	var patternDiscover = new RegExp("^6(?:011|5[0-9]{2})[0-9]{3,}$");
	
	if(patternAmex.test(cardNumber)){
		cardType = config.cardType.amex;
	}
	else if(patternVisa.test(cardNumber)){
		cardType = config.cardType.visa;
	}
	else if(patternMasterCard.test(cardNumber)){
		cardType = config.cardType.mastercard;
	}
	else if(patternJcb.test(cardNumber)){
		cardType = config.cardType.jcb;
	}
	else if(patternDiscover.test(cardNumber)){
		cardType = config.cardType.discover;
	}

	return cardType;
}

/* ****************** PAYPAL ****************** */

/**
 * Creation paypal card
 */
var creationCardPaypal = function(form){
	var card = {};
	card.credit_card = {};
	card.credit_card.type = getCardType(form.number);
	card.credit_card.number = form.number;
	card.credit_card.expire_month = form.expiration.split("/")[0];
	var currentYear = new Date().getFullYear() + '';
    var currentCentury = currentYear.substr(0,2);
	card.credit_card.expire_year = currentCentury + form.expiration.split("/")[1];
	card.credit_card.cvv2 = form.ccv;
	card.credit_card.first_name = form.name.split(" ")[0];
	card.credit_card.last_name = form.name.substring(card.credit_card.first_name.length + 1);
	console.log(card.credit_card.last_name);
	return card;
}

/**
 * Creation paypal payment
 */
var creationPaypalPayment = function(form){
	var payment = {};
	payment.intent = "sale";
	payment.payer = {};
	payment.payer.payment_method = "credit_card";
	payment.payer.funding_instruments = [];
	payment.payer.funding_instruments.push(creationCardPaypal(form));
	payment.transactions = [];
	payment.transactions.push({"amount" : { "total": form.price, "currency": form.currency} });
	
	return payment;
}

/* *********************************************** */

/* ****************** BRAINTREE ****************** */
/**
 * Return the token used for braintree
 */
var getTokenBraintree = function(callback){
	braintreeGateWay.clientToken.generate({}, function (err, response) {
		callback(err,response.clientToken);
	});
}

/**
 * Return the account bin with the currency
 */
var getBraintreeAccount = function(currency){
	var account = null;
	switch (currency) {
	  case config.currencies.USD:
		  account = config.braintree.usd;
		  break;
	  case config.currencies.EUR:
		  account = config.braintree.eur;
		  break;
	  case config.currencies.THB:
		  account = config.braintree.thb;
		  break;
	  case config.currencies.HKD:
		  account = config.braintree.hkd;
		  break;
	  case config.currencies.SGD:
		  account = config.braintree.sgd;
		  break;
	  case config.currencies.AUD:
		  account = config.braintree.aud;
		  break;
	}
	return account;
}

/* *********************************************** */

module.exports.init = init;
module.exports.payment = payment;
module.exports.getTokenBraintree = getTokenBraintree;

//expose private function for the tests
//can use mocha or rewire instead
module.exports.getTypePayment = getTypePayment;
module.exports.getCardType = getCardType
module.exports.isAmex = isAmex