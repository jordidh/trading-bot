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

describe('Trading Control', () =>  {
    it('creates a BUY Order', async () => {
        var orderAddedExpected = {
            "error" : [ ],
            "result" : {
                "descr" : [ { "order" : "buy 0.00024033 XBTEUR @ market" } ],
                "txid" : [ "OAVY7T-MV5VK-KHDF5X" ]
            }
        };
        var orderAdded = await tradingControl.addOrder(krakenMocked, "buy", "XBTEUR");
        expect(orderAdded).to.deep.equal(orderAddedExpected);
    });
});