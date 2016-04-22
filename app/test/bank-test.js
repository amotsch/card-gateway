var assert = require('assert');
var bank = require('../modules/bank');

// TEST 1 : payment gateway == null : AMEX + currency != "USD"
var amexCard = "3711111111111111";
assert(bank.isAmex(amexCard));
assert(bank.getTypePayment(amexCard, "EUR") == null);
assert(bank.getTypePayment(amexCard, "THB") == null);
assert(bank.getTypePayment(amexCard, "HKD") == null);
assert(bank.getTypePayment(amexCard, "SGD") == null);
assert(bank.getTypePayment(amexCard, "AUD") == null);
console.log("test 1 :ok");

//TEST 2 : payment gateway == 'paypal' : AMEX + currency != "USD"
var nonAmexCard = "4111111111111111";
assert(bank.getTypePayment(nonAmexCard, "USD") == "paypal");
assert( bank.getTypePayment(nonAmexCard, "EUR") == "paypal");
assert( bank.getTypePayment(nonAmexCard, "AUD") == "paypal");
assert( bank.getTypePayment(amexCard, "USD") == "paypal");
console.log("test 2 :ok");

//TEST 3 : payment gateway == 'braintree' : AMEX + currency != "USD"
assert(bank.getTypePayment(nonAmexCard, "THB") == "braintree");
assert( bank.getTypePayment(nonAmexCard, "HKD") == "braintree");
assert( bank.getTypePayment(nonAmexCard, "SGD") == "braintree");
console.log("test 3 :ok");

//TEST 4 : card type
assert(bank.getCardType("378282246310005") == "amex");
assert( bank.getCardType("49123456788901234") == "visa");
assert( bank.getCardType("5112345678901234") == "masterCard");
assert( bank.getCardType("3530111333300000") == "jcb");
assert( bank.getCardType("6011000990139424") == "discover");
console.log("test 4 :ok");

console.log("Tests finished : OK");