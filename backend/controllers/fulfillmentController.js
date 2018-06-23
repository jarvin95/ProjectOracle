var connection = {
    host: "devostrum.no-ip.info",
    user: "oracle",
    password: "oracle",
    database: "oracle"
};

var mysql = require('mysql');
var con = mysql.createConnection(connection);

con.connect();

exports.fulfill = function (req, res, next) {
    if (req.body === 'undefined') {
        return res.sendStatus(400);
    }
    var intent_name = req.body.queryResult.intent.name; // TODO: Check if intent is get_item intent if there is more than one intent

    res.setHeader('Content-Type', 'application/json');
    console.log(req.body);
    var param = req.body.queryResult.parameters['item'];
    var response = "";

    console.log("retrieve start");
    var query1 = "SELECT `id` FROM `Object` WHERE `name` = \"" + param + "\" LIMIT 1;";
    con.query(query1, function (err, result1) {
        if (err) throw err;
        console.log("result1: " + result1);
        if (typeof(result1) === "undefined") {
            response = "I don't know what a " + param + " is.";
            console.log(responseObj(response));
            return res.json(responseObj(response));
        }
        var query2 = "SELECT `reference_object` FROM `Instance` WHERE `parent_object_id` = \"" + result1 + "\" ORDER BY ID DESC LIMIT 1;";
        con.query(query2, function (err, result2) {
            if (err) throw err;
            console.log("result2: " + result2);
            if (typeof(result2) === "undefined") {
                response = param + " cannot be found.";
                console.log(responseObj(response));
                return res.json(responseObj(response));
            }
            response = param + " is " + result2;
            console.log(responseObj(response));
            return res.json(responseObj(response));
        });
    });
};

/*function responseObj(response) {
    var responseObj = {
        "fulfillmentText": " ",
        "fulfillmentMessages": [
            {
                "text": {
                    "text": [response]
                }
            }
        ],
        "source": "Oracle by jr.io"
    };
    return responseObj;
}*/

function responseObj(response) {
    var responseObj = {
        "fulfillmentText": " ",
        "fulfillmentMessages": [
            {
                "card": {
                    "title": "Test Title",
                    "subtitle": "test"

                }
            }
        ],
        "source": "Oracle by jr.io"
    };
    return responseObj;
}

