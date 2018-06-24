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
        if (typeof(result1) === undefined) {
            return res.json("");
        }
        var object_id = result1[0].id;
        console.log("result1: " + object_id);
        if (typeof(object_id) === undefined) {
            response = "I don't know what a " + param + " is.";
            console.log(responseObj(response, param));
            return res.json(responseObj(response, param));
        }
        /*var query2 = "SELECT `reference_object` FROM `Instance` WHERE `parent_object_id` = \"" + object_id + "\" ORDER BY ID DESC LIMIT 1;";
        con.query(query2, function (err, result2) {
            if (err) throw err;
            var position = result2[0].reference_object;
            console.log("result2: " + position);
            if (typeof(position) === undefined) {
                response = "Your" + param + " cannot be found";
                console.log(responseObj(response, param));
                return res.json(responseObj(response, param));
            }
            response = "I found your " + param + " on or around " + position + " in the living room";
            console.log(responseObj(response, param));
            return res.json(responseObj(response, param));
        });*/

        var query2 = "SELECT `reference_object` FROM `Instance` WHERE `parent_object_id` = \"" + object_id + "\" ORDER BY ID DESC;";
        con.query(query2, function (err, result2) {
            if (err) throw err;
            var array_of_positions = [];
            result2.forEach(function(element) {
                array_of_positions.push(element.reference_object);
            });
            console.log(array_of_positions);

            var r =  responseObj(array_of_positions, param);
            console.log(r);
            return res.json(r);
        });
    });
};

function responseObj(array_of_positions, param) {
    var response = "";
    if (array_of_positions.length == 0) {
        response = "I don't see your " + param + " anywhere.";
        console.log(response);
        return {
            "fulfillmentText": response,
            "source": "Oracle by jr.io"
        };
    }
    else if(array_of_positions.length == 1) {
        response = "I found your " + param + " on or around " + array_of_positions[0] + " in the living room.";
        console.log(response);
        return {
            "fulfillmentText": response,
            "source": "Oracle by jr.io"
        };
    }
    else {
        response = "I found " + array_of_positions.length + " " + param + ". Which one do you want me to find?";
        console.log(response);
        var items = [];
        var count = 0;
        array_of_positions.forEach(function(element) {
            items.push({
                "optionInfo": {
                    "key": param + count
                },
                "title": param + count,
                "description": element,
                "image": {
                    "url": "http://example.com/math_and_prime.jpg",
                    "accessibilityText": "Math & prime numbers"
                }
            });
            count++;
        });
        console.log(items);
        return {
            "conversationToken": "",
            "expectUserResponse": true,
            "expectedInputs": [
                {
                    "inputPrompt": {
                        "initialPrompts": [
                            {
                                "textToSpeech": response
                            }
                        ],
                        "noInputPrompts": []
                    },
                    "possibleIntents": [
                        {
                            "intent": "actions.intent.OPTION",
                            "inputValueData": {
                                "@type": "type.googleapis.com/google.actions.v2.OptionValueSpec",
                                "carouselSelect": {
                                    "items": items
                                }
                            }
                        }
                    ]
                }
            ]
        };
    }
}

/*function responseObj(response) {
    var responseObj = {
        "fulfillmentText": response,
        "source": "Oracle by jr.io"
    };
    return responseObj;
}*/

/*
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
                        },
                        {
                            "carouselBrowse": {
                                "items": [
                                    {
                                        "title": "Title of item 1",
                                        "description": "Description of item 1",
                                        "footer": "Item 1 footer",
                                        "image": {
                                            "url": "https://www.gstatic.com/mobilesdk/170329_assistant/assistant_color_96dp.png",
                                            "accessibilityText": "Google Assistant Bubbles"
                                        },
                                        "openUrlAction": {
                                            "url": "https://github.com"
                                        }
                                    },
                                    {
                                        "title": "Title of item 2",
                                        "description": "Description of item 2",
                                        "footer": "Item 2 footer",
                                        "image": {
                                            "url": "https://www.gstatic.com/mobilesdk/170329_assistant/assistant_color_96dp.png",
                                            "accessibilityText": "Google Assistant Bubbles"
                                        },
                                        "openUrlAction": {
                                            "url": "https://google.com"
                                        }
                                    }
                                ]
                            }
                        }
                    ]
                }
            }
        },
        "outputContexts": [

        ]
    };
    return responseObj;
}
*/
/*

function responseObj(response) {
    var responseObj = {
        "fulfillmentText": response,
        "source": "Oracle by jr.io"
    };
    return responseObj;
}
*/

