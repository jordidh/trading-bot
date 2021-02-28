// $ mocha test/api/tradingControl

//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
let chai = require('chai');
//let chaiHttp = require('chai-http');
let should = chai.should();
let expect    = require("chai").expect;

// Mocked kraken
let krakenMocked = require('../../api/exchanges/kraken/apisMocked');
let tradingControl = require('../../api/tradingControl');

describe('Trading Control, addOrder', () =>  {
    it('returns internal values creating a BUY Order in test mode', async () => {
        krakenMocked.setBalance({
            "error" : [],
            "result" : {
                "ZUSD" : [3415.8014],
                "ZEUR" : [155.5649],
                "XXBT" : [149.9688412800],
                "XXRP" : [499889.51600000]
            }
        });

        var orderAddedExpected = {
            "error" : [ ],
            "result" : {
                "exchangePercentage": 1,
                "funds": 155.56,
                "fundsMinusCommission": 154.0044,
                "fundsToBuy": 100,
                "maxLimitFundsToBuy": 100,
                "volume": 0.002427573349128744
            }
        };
        var orderAdded = await tradingControl.addOrder(krakenMocked, "buy", "XBT/EUR", test = true);
        expect(orderAdded).to.deep.equal(orderAddedExpected);
    });

    it('returns internal values creating a BUY Order in test mode when no funds', async () => {
        krakenMocked.setBalance({
            "error" : []
        });

        //console.log(krakenMocked.balance);

        var orderAddedExpected = {
            "error" : [ "no funds to buy" ],
            "result" : {
                "exchangePercentage": 1,
                "funds": 0,
                "fundsMinusCommission": 0,
                "fundsToBuy": 0,
                "maxLimitFundsToBuy": 100,
                "volume": 0
            }
        };
        var orderAdded = await tradingControl.addOrder(krakenMocked, "buy", "XBT/EUR", test = true);
        expect(orderAdded).to.deep.equal(orderAddedExpected);
    });

    it('creates a BUY Order successfully', async () => {
        krakenMocked.setBalance({
            "error" : [],
            "result" : {
                "ZUSD" : [3415.8014],
                "ZEUR" : [155.5649],
                "XXBT" : [149.9688412800],
                "XXRP" : [499889.51600000]
            }
        });

        var orderAddedExpected = {
            "error" : [ ],
            "result" : {
                "descr" : [ { "order" : "buy 0.002427573 XBTEUR @ market" } ],
                "txid" : [ "OAVY7T-MV5VK-KHDF5X" ]
            }
        };
        var orderAdded = await tradingControl.addOrder(krakenMocked, "buy", "XBT/EUR", test = false);
        expect(orderAdded).to.deep.equal(orderAddedExpected);
    });
});

describe('Trading Control, convertPair', () =>  {
    it('returns error if pair is not well formated, ex: XBTEUR', async () => {
        var resultExpected = {
            "error" : [ "Parameter \"pair\" has not the correct format <crypto>/<currency>: XBTEUR" ],
            "result" : { }
        };
        var result = await tradingControl.convertPair("XBTEUR");
        expect(result).to.deep.equal(resultExpected);
    });

    it('returns error if pair is not well formated, ex: XBT/EUR/HOL', async () => {
        var resultExpected = {
            "error" : [ "Parameter \"pair\" has not the correct format <crypto>/<currency>: XBT/EUR/HOL" ],
            "result" : { }
        };
        var result = await tradingControl.convertPair("XBT/EUR/HOL");
        expect(result).to.deep.equal(resultExpected);
    });

    it('returns error if pair is not well formated, ex: string.empty', async () => {
        var resultExpected = {
            "error" : [ "Parameter \"pair\" has not the correct format <crypto>/<currency>: " ],
            "result" : { }
        };
        var result = await tradingControl.convertPair("");
        expect(result).to.deep.equal(resultExpected);
    });

    it('returns ok if pair is well formated, ex: XBT/EUR', async () => {
        var resultExpected = {
            "error" : [  ],
            "result" : { 
                "crypto" : "XBT",
                "cryptoX" : "XXBT",
                "currency" : "EUR",
                "currencyZ" : "ZEUR",
                "pairOriginal" : "XBT/EUR",
                "pairSimple" : "XBTEUR",
                "pairFull" : "XXBTZEUR"
            }
        };
        var result = await tradingControl.convertPair("XBT/EUR");
        expect(result).to.deep.equal(resultExpected);
    });
});

/*
describe('Trading Control, balance', () =>  {
    it('returns internal values creating a BUY Order in test mode', async () => {
        krakenMocked.setBalance({
            "error" : [],
            "result" : {
                "ZUSD" : [3415.8014],
                "ZEUR" : [155.5649],
                "XXBT" : [149.9688412800],
                "XXRP" : [499889.51600000]
            }
        });

        var orderAddedExpected = {
            "error" : [ ],
            "result" : {
                "exchangePercentage": 1,
                "funds": 155.56,
                "fundsMinusCommission": 155.55357161223967,
                "fundsToBuy": 100,
                "maxLimitFundsToBuy": 100,
                "volume": 0.002427573349128744
            }
        };
        var orderAdded = await tradingControl.addOrder(krakenMocked, "buy", "XBTEUR", test = true);
        expect(orderAdded).to.deep.equal(orderAddedExpected);
    });
});
*/