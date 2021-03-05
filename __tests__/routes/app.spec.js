/**
 * To run tests: $ jest __test__/routes/
 */
const frisby = require('frisby');

//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

describe('Buy and Sell Posts', function() {
    it('should fail if body is empty', function () {
        return frisby.post('http://localhost:4401/')
            //.inspectJSON()
            .expect("status", 400)
            .expect("jsonStrict", { error: [ "request body can not be empty" ] });
    });

    it('should fail if body does not has token property', function () {
        return frisby.post('http://localhost:4401/', {
                badProperty : "some value"
            })
            //.inspectJSON()
            .expect("status", 400)
            .expect("jsonStrict", { error: [ "request body must have property \"token\"" ] });
    });

    it('should fail if body does not has action property', function () {
        return frisby.post('http://localhost:4401/', {
                badProperty : "some value",
                token : "TEST_TOKEN"
            })
            //.inspectJSON()
            .expect("status", 400)
            .expect("jsonStrict", { error: [ "request body must have property \"action\"" ] });
    });

    it('should fail if body has action property with values other than BUY or SELL', function () {
        return frisby.post('http://localhost:4401/', {
                action : "some value",
                token : "TEST_TOKEN"
            })
            //.inspectJSON()
            .expect("status", 400)
            .expect("jsonStrict", { error: [ "request body property \"action\" only accepts values \"buy\" or \"sell\"" ] });
    });

    it('should fail if body does not has pair property', function () {
        return frisby.post('http://localhost:4401/', {
                action : "buy",
                token : "TEST_TOKEN"
            })
            //.inspectJSON()
            .expect("status", 400)
            .expect("jsonStrict", { error: [ "request body must have property \"pair\"" ] });
    });

    it('should create a buy order successfully', function() {
        return frisby.post('http://localhost:4401/', {
            action : "buy",
            pair: "XBT/EUR",
            token : "TEST_TOKEN",
            test : "mock-kraken"
        })
        //.inspectJSON()
        .expect("status", 200)
        .expect("jsonStrict", {
            "error": [],
            "result": {
                "descr": [
                    {
                        "order": "buy 0.002427573 XBTEUR @ market"
                    }
                ],
                "txid": [
                    "OAVY7T-MV5VK-KHDF5X"
                ],
                "price": 41193.4
            }
        });
    });

    it('should create a sell order successfully', function() {
        // preu = volum * preu/u
        // preu de compra = 0,002427573 × 41193,4 = 99,999985618
        // preu de venda = 0,002427573 × 45193,4 = 109,710277618
        // benefici = 109,710277618 − 99,999985618 = 9,710292
        return frisby.post('http://localhost:4401/', {
            action : "sell",
            pair: "XBT/EUR",
            token : "TEST_TOKEN",
            test : "mock-kraken",
            testBalance : {
                "error" : [],
                "result" : {
                    "XXBT" : [0.002427573]  //<--- volum total invertit en XBT
                }
            },
            testCryptoValue : {
                "error": [],
                "result": {
                    "XXBTZEUR": {
                        a: [ '45193.40000', '1', '1.000' ],  //<--- aquest valor és el que ens defineix el preu de venda de XBT a EUR
                        b: [ '41193.30000', '2', '2.000' ],
                        c: [ '41194.30000', '0.10000000' ],
                        v: [ '4019.56938193', '5793.50042560' ],
                        p: [ '41371.13767', '41107.71138' ],
                        t: [ 43719, 64168 ],
                        l: [ '39912.00000', '39610.80000' ],
                        h: [ '42515.10000', '42515.10000' ],
                        o: '40907.50000'                  
                    }
                }
            },
            testBuyOrder : {
                "descr" : { "order" : "buy 0.002427573 XBTEUR @ market" },  //<---volum=0.002427573 => 100 EUR quan el XBTEUR=41193.40000
                "txid" : [ "OAVY7T-MV5VK-KHDF5X" ],
                "price" : 41193.4   //<---- aquest valor ens indica el preu de compra
            }
        })
        .inspectJSON()
        .expect("status", 200)
        .expect("jsonStrict", {
            "error" : [],
            "result" : {
                "descr" : { "order": "sell 0.002427573 XBTEUR @ market" },
                "txid" : [ "OAVY7T-MV5VK-KHDF5X" ],
                "price" : 45193.4,
                "profit" : 9.710291999999995
            }
        });
    });
});