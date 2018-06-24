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
        var object_id = result1[0].id;
        console.log("result1: " + object_id);
        if (typeof(object_id) === undefined) {
            response = "I don't know what a " + param + " is.";
            console.log(responseObj(response, param));
            return res.json(responseObj(response, param));
        }
        var query2 = "SELECT `reference_object` FROM `Instance` WHERE `parent_object_id` = \"" + object_id + "\" ORDER BY ID DESC LIMIT 1;";
        con.query(query2, function (err, result2) {
            if (err) throw err;
            var position = result2[0].reference_object;
            console.log("result2: " + position);
            if (typeof(position) === undefined) {
                response = "Your" + param + " cannot be found";
                console.log(responseObj(response, param));
                return res.json(responseObj(response, param));
            }
            response = "Your " + param + " is " + position + " in the living room";
            console.log(responseObj(response, param));
            return res.json(responseObj(response, param));
        });
    });
};

/*function responseObj(response) {
    var responseObj = {
        "fulfillmentText": response,
        "source": "Oracle by jr.io"
    };
    return responseObj;
}*/

function responseObj(response, object_name) {
    var responseObj = {
        "fulfillmentText": response,
        "fulfillmentMessages": [
            {
                "card": {
                    "title": "card_title",
                    "subtitle": "response",
                    "imageUri": "https://assistant.google.com/static/images/molecule/Molecule-Formation-stop.png",
                    "buttons": [
                        {
                            "text": "buttonText",
                            "postback": "http://assistant.google.com/"
                        }
                    ]
                }
            }
        ],
        "source": "Oracle by jr.io",
        "payload": {
            "google": {
                "expectUserResponse": true,
                "richResponse": {
                    "items": [
                        {
                            "simpleResponse": {
                                "textToSpeech": response
                            }
                        }
                    ]
                }
            }
        }
    };
    return responseObj;
}
