var config = {};

config.payment = {};    // list of available payment
config.currencies = {}; // list of currencies
config.cardType = {};   // list of cards
config.paypal = {};     // paypal config
config.braintree = {};  // braintree config
config.database = {};    // database config

//list of payment
config.payment.paypal = 'paypal';
config.payment.braintree = 'braintree';

// list of currency
config.currencies.USD = "USD";
config.currencies.EUR = "EUR";
config.currencies.THB = "THB";
config.currencies.HKD = "HKD";
config.currencies.SGD = "SGD";
config.currencies.AUD = "AUD";

// list of card
config.cardType.amex = "amex";
config.cardType.visa = "visa";
config.cardType.mastercard = "masterCard";
config.cardType.jcb = "jcb";
config.cardType.discover = "discover";

//paypal configuration
config.paypal.mode =  'sandbox';
config.paypal.client_id = 'AQXCYtwc0r7bDqpGfpL_CA3l2LhVywYFKIKhsvNJaA7ZknPtrP3oHPKanbvFo5p42UbAVEgEUJBHwqBv';
config.paypal.client_secret = 'EF3nfjXCX7BN3r29tiQV6qviQ2sWB7tJ-jGbsggHkNGF6rkBTYHO2gG3wFy4jzQuTWtTUpl__DDP-kML';

//braintree configuration
config.braintree.merchantId = "bk4835v6dx85548t";
config.braintree.publicKey = "3hmtjdm265yky2c8";
config.braintree.privateKey = "e8ea3bf17578ba2c1df5e4712ed20bda";
//braintree account currency
config.braintree.usd = "Adrien-USD";
config.braintree.eur = "Adrien-EUR";
config.braintree.thb = "Adrien-THB";
config.braintree.hkd = "Adrien-KKD";
config.braintree.sgd = "Adrien-SGD";
config.braintree.aud = "Adrien-AUD";

//database url
config.database.url = "mongodb://localhost:27017/hotelquickly";

//port configuration
config.port = 80;

module.exports = config;