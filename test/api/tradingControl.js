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
                "funds": 155.5649,
                "fundsMinusCommission": 154.009251,
                "fundsToBuy": 100,
                "maxLimitFundsToBuy": 100,
                "volume": 0.002427573349128744,
                "price": 41193.4
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
                "volume": 0,
                "price": 0
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
                "descr" : { "order" : "buy 0.002427573 XBTEUR @ market" },
                "txid" : [ "OAVY7T-MV5VK-KHDF5X" ],
                "price" : 41193.4
            }
        };
        var orderAdded = await tradingControl.addOrder(krakenMocked, "buy", "XBT/EUR", test = false);
        expect(orderAdded).to.deep.equal(orderAddedExpected);
    });
});

describe('Trading Control, getFunds', () =>  {
    it('returns error when balance not exists', async () => {
        krakenMocked.setBalance({
            "error" : [],
            "result" : null
        });

        let fundsExpected = { 
            "error" : [ ], 
            "result" : { 
                "funds" : 0
            }
        };

        let fundsFound = await tradingControl.getFunds(krakenMocked, "XXBT");

        //console.log(fundsFound);
        expect(fundsFound).to.deep.equal(fundsExpected);
    });

    it('returns correct balance when currency parameter is equal to balance currency', async () => {
        krakenMocked.setBalance({
            "error" : [],
            "result" : {
                "ZUSD" : [3415.8014],
                "ZEUR" : [155.5649],
                "XXBT" : [149.9688412800],
                "XXRP" : [499889.51600000],
                "ADA"  : [1234.8765]
            }
        });

        let fundsExpected = { 
            error: [], 
            result: { funds: 149.96884128 } 
        };

        let fundsFound = await tradingControl.getFunds(krakenMocked, "XXBT");

        //console.log(fundsFound);
        expect(fundsFound).to.deep.equal(fundsExpected);
    });

    it('returns correct balance when currency parameter includes balance currency', async () => {
        krakenMocked.setBalance({
            "error" : [],
            "result" : {
                "ZUSD" : [3415.8014],
                "ZEUR" : [155.5649],
                "XXBT" : [149.9688412800],
                "XXRP" : [499889.51600000],
                "ADA"  : [1234.8765]
            }
        });

        let fundsExpected = { 
            error: [], 
            result: { funds: 1234.8765 } 
        };

        let fundsFound = await tradingControl.getFunds(krakenMocked, "XADA");

        //console.log(fundsFound);
        expect(fundsFound).to.deep.equal(fundsExpected);
    });

    it('returns correct balance when balance currency includes parameter currency', async () => {
        krakenMocked.setBalance({
            "error" : [],
            "result" : {
                "ZUSD" : [3415.8014],
                "ZEUR" : [155.5649],
                "XXBT" : [149.9688412800],
                "XXRP" : [499889.51600000],
                "ADA"  : [1234.8765]
            }
        });

        let fundsExpected = { 
            error: [], 
            result: { funds: 499889.51600000 } 
        };

        let fundsFound = await tradingControl.getFunds(krakenMocked, "XRP");

        //console.log(fundsFound);
        expect(fundsFound).to.deep.equal(fundsExpected);
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

describe('Trading Control, formatLogs', () =>  {
    it('formats logs successfully if logs has the log columns empty', async () => {
        let logsFormattedExpected = '💚 - 1 - 2021-03-03 10:17:59 - \n' +
            '❤ - 2 - 2021-03-03 10:17:59 - { "error" : [ "error desconegut" ], "result" : { } }\n';

        let logs = [
            {
                id: 1,
                date: '2021-03-03 10:17:59',
                log: ''
            },
            {
                id: 2,
                date: '2021-03-03 10:17:59',
                log: '{ "error" : [ "error desconegut" ], "result" : { } }'
            }
        ];

        let result = await tradingControl.formatLogs(logs);
        expect(result).to.deep.equal(logsFormattedExpected);
    });

    it('formats logs successfully if logs has a string into the log columns', async () => {
        let logsFormattedExpected = '💚 - 1 - 2021-03-03 10:17:59 - string indeterminat\n' +
            '❤ - 2 - 2021-03-03 10:17:59 - { "error" : [ "error desconegut" ], "result" : { } }\n';

        let logs = [
            {
                id: 1,
                date: '2021-03-03 10:17:59',
                log: 'string indeterminat'
            },
            {
                id: 2,
                date: '2021-03-03 10:17:59',
                log: '{ "error" : [ "error desconegut" ], "result" : { } }'
            }
        ];

        let result = await tradingControl.formatLogs(logs);
        expect(result).to.deep.equal(logsFormattedExpected);
    });

    it('formats logs successfully if logs has the expected structure, with a JSON into the log column', async () => {
        let logsFormattedExpected = '💚 - 1 - 2021-03-03 10:17:59 - { "error" : [], "result" : { } }\n' +
            '❤ - 2 - 2021-03-03 10:17:59 - { "error" : [ "error desconegut" ], "result" : { } }\n';

        let logs = [
            {
                id: 1,
                date: '2021-03-03 10:17:59',
                log: '{ "error" : [], "result" : { } }'
            },
            {
                id: 2,
                date: '2021-03-03 10:17:59',
                log: '{ "error" : [ "error desconegut" ], "result" : { } }'
            }
        ];

        let result = await tradingControl.formatLogs(logs);
        expect(result).to.deep.equal(logsFormattedExpected);
    });
});

describe('Trading Control, calculateProfit', () =>  {
    it('returns error if the buy order not exists', async () => {
        var resultExpected = {
            "error" : [ "Buy order is not defined" ],
            "result" : -1
        };

        var buyOrder = undefined;
        var sellOrder = {
            "descr": { "order":"sell 0.00359600 XBTEUR @ market" },
            "txid":["OYSDDM-46HXD-XG6JMQ"],
            "price":42465.1
        };

        var result = await tradingControl.calculateProfit(buyOrder, sellOrder);
        expect(result).to.deep.equal(resultExpected);
    });

    it('returns error if the sell order not exists', async () => {
        var resultExpected = {
            "error" : [ "Sell order is not defined" ],
            "result" : -1
        };

        var buyOrder = {
            "descr": { "order":"buy 0.00114940 XBTEUR @ market" },
            "txid":["OG5AH5-B4KHL-ZWTK7O"],
            "price":43500.6
        };
        var sellOrder = undefined;

        var result = await tradingControl.calculateProfit(buyOrder, sellOrder);
        expect(result).to.deep.equal(resultExpected);
    });

    it('returns error if the buy order has invalid structure', async () => {
        var resultExpected = {
            "error" : [ "Buy order has bad structure" ],
            "result" : -1
        };

        var buyOrder = {
            // falta descr
            "txid":["OG5AH5-B4KHL-ZWTK7O"],
            "price":43500.6
        };
        var sellOrder = {
            "descr": { "order":"sell 0.00359600 XBTEUR @ market" },
            "txid":["OYSDDM-46HXD-XG6JMQ"],
            "price":42465.1
        };

        var result = await tradingControl.calculateProfit(buyOrder, sellOrder);
        expect(result).to.deep.equal(resultExpected);
    });

    it('returns error if the sell order has invalid structure', async () => {
        var resultExpected = {
            "error" : [ "Sell order has bad structure" ],
            "result" : -1
        };

        var buyOrder = {
            "descr": { "order":"buy 0.00114940 XBTEUR @ market" },
            "txid":["OG5AH5-B4KHL-ZWTK7O"],
            "price":43500.6
        };
        var sellOrder = {
            "descr": { "order":"sell 0.00359600 XBTEUR @ market" },
            "txid":["OYSDDM-46HXD-XG6JMQ"]
            // falta price
        };

        var result = await tradingControl.calculateProfit(buyOrder, sellOrder);
        expect(result).to.deep.equal(resultExpected);
    });

    it('returns error if the buy order descr attribute has not the correct format', async () => {
        var resultExpected = {
            "error" : [ "Buy order descr property must have 5 elements and has 3" ],
            "result" : -1
        };

        var buyOrder = {
            "descr": { "order":"buy 0.00114940 XBTEUR" },  //<--Format ordre incorrecte
            "txid":["OG5AH5-B4KHL-ZWTK7O"],
            "price":43500.6
        };
        var sellOrder = {
            "descr": { "order":"sell 0.00359600 XBTEUR @ market" },
            "txid":["OYSDDM-46HXD-XG6JMQ"],
            "price":42465.1
        };

        var result = await tradingControl.calculateProfit(buyOrder, sellOrder);
        expect(result).to.deep.equal(resultExpected);
    });

    it('returns error if the buy order descr attribute has not the correct format', async () => {
        var resultExpected = {
            "error" : [ "Buy order descr volume is not a number XXXXXX" ],
            "result" : -1
        };

        var buyOrder = {
            "descr": { "order":"buy XXXXXX XBTEUR @ market" },  //<--- el valor de compra no és un numèric
            "txid":["OG5AH5-B4KHL-ZWTK7O"],
            "price":43500.6
        };
        var sellOrder = {
            "descr": { "order":"sell 0.00359600 XBTEUR @ market" },
            "txid":["OYSDDM-46HXD-XG6JMQ"],
            "price":42465.1
        };

        var result = await tradingControl.calculateProfit(buyOrder, sellOrder);
        expect(result).to.deep.equal(resultExpected);
    });

    it('returns error if the buy order descr attribute has not the correct format', async () => {
        var resultExpected = {
            "error" : [ "Sell order descr property must have 5 elements and has 6" ],
            "result" : -1
        };

        var buyOrder = {
            "descr": { "order":"buy 0.00114940 XBTEUR @ market" },
            "txid":["OG5AH5-B4KHL-ZWTK7O"],
            "price":43500.6
        };
        var sellOrder = {
            "descr": { "order":"sell 0.00359600 XBTEUR @ market incorrectvalue" },  //<--- format incorrecte
            "txid":["OYSDDM-46HXD-XG6JMQ"],
            "price":42465.1
        };

        var result = await tradingControl.calculateProfit(buyOrder, sellOrder);
        expect(result).to.deep.equal(resultExpected);
    });

    it('returns error if the buy order descr attribute has not the correct format', async () => {
        var resultExpected = {
            "error" : [ "Sell order descr volume is not a number nnnn" ],
            "result" : -1
        };

        var buyOrder = {
            "descr": { "order":"buy 0.00114940 XBTEUR @ market" },
            "txid":["OG5AH5-B4KHL-ZWTK7O"],
            "price":43500.6
        };
        var sellOrder = {
            "descr": { "order":"sell nnnn XBTEUR @ market" },  //<--- volume is not a number
            "txid":["OYSDDM-46HXD-XG6JMQ"],
            "price":42465.1
        };

        var result = await tradingControl.calculateProfit(buyOrder, sellOrder);
        expect(result).to.deep.equal(resultExpected);
    });

    it('returns the profit successfully', async () => {
        var resultExpected = {
            "error" : [ ],
            "result" : 143.64126635999997
        };

        var buyOrder = {
            "descr": { "order":"buy 0.00114940 XBTEUR @ market" },
            "txid":["OG5AH5-B4KHL-ZWTK7O"],
            "price":43500.6
        };
        //49,99958964
        var sellOrder = {
            "descr": { "order":"sell 0.0045600 XBTEUR @ market" },
            "txid":["OYSDDM-46HXD-XG6JMQ"],
            "price":42465.1
        };
        //193,640856

        var result = await tradingControl.calculateProfit(buyOrder, sellOrder);
        expect(result).to.deep.equal(resultExpected);
    });
});