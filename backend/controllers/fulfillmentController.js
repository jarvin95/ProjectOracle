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
    var response = generate_message(param, retrieve(param));
    var responseObj = {
        "fulfillmentText": response,
        "fulfillmentMessages": [
            {
                "text": {
                    "text": [message]
                }
            }
        ],
        "source": "Oracle by jr.io"
    };

    return res.json(responseObj);
};

function retrieve(item_string) {
    console.log("retrieve start");
    var query1 = "SELECT `id` FROM Object WHERE name = \"" + item_string + "\";";
    con.query(query1, function (err, result1) {
        if (err) throw err;
        var query2 = "SELECT TOP 1 `reference_object` FROM Instance WHERE `parent_object_id` = \"" + result1 + "\";";
        con.query(query2, function(err, result2) {
            if (err) throw err;
            return result2;
        });
    });
    console.log("retrieve end");
}

function generate_message(item_string, item_location) {
    return item_string + " is " + item_location;
}