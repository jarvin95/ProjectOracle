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
    console.log("fulfill");
    var param = req.body.queryResult.parameters.param;
    var item_name = 'wallet';
    // var item_name = req.body.queryResult.parameters.item;
    var intent_name = req.body.queryResult.intent.name;
    console.log(param + " " + intent_name);

    var query = "SELECT * FROM Object WHERE name = \'" + item_name;
    con.query(query, function(err, result) {
        if (err) throw err;
        console.log(result);
        res.json(result);
    })


    /*res.json({
        'param': param,
        'intent_name': intent_name
    });*/
};
