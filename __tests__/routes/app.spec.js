/**
 * To run tests: $ jest __test__/routes/
 */
const frisby = require('frisby');

//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

describe('Buy and Sell Posts', function() {
    /*
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
*/
    it('should create a sell order successfully', function() {
        return frisby.post('http://localhost:4401/', {
            action : "sell",
            pair: "XBT/EUR",
            token : "TEST_TOKEN",
            test : "mock-kraken"
        })
        //.inspectJSON()
        .expect("status", 200)
        .expect("jsonStrict", {
            "error" : [],
            "result" : {
                "descr" : [
                    {
                        "order": "sell 0.002427573 XBTEUR @ market"
                    }
                ],
                "txid" : [
                    "OAVY7T-MV5VK-KHDF5X"
                ],
                "price" : 41193.4,
                "profit" : 200
            }
        });
    });
});