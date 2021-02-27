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
                "fundsMinusCommission": 155.55357161223967,
                "fundsToBuy": 100,
                "maxLimitFundsToBuy": 100,
                "volume": 0.002427573349128744
            }
        };
        var orderAdded = await tradingControl.addOrder(krakenMocked, "buy", "XBTEUR", test = true);
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
        var orderAdded = await tradingControl.addOrder(krakenMocked, "buy", "XBTEUR", test = true);
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
                "descr" : [ { "order" : "buy 0.00242757 XBTEUR @ market" } ],
                "txid" : [ "OAVY7T-MV5VK-KHDF5X" ]
            }
        };
        var orderAdded = await tradingControl.addOrder(krakenMocked, "buy", "XBTEUR", test = false);
        expect(orderAdded).to.deep.equal(orderAddedExpected);
    });
});