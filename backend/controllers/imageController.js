const connection = {
    host: "devostrum.no-ip.info",
    user: "oracle",
    password: "oracle",
    database: "oracle"
};

const mysql = require('mysql');
const con = mysql.createConnection(connection);

con.connect();

var spawn = require("child_process").spawn;


var options = {
    cwd: process.cwd(),
    env: process.env
};




/*Call Isaac's function then send to DB*/
exports.new_image = function(req, res, next){

  /*  var imageBase64 = req.body["imageBase64"];
    var width = req.body["width"];
    var height = req.body["height"];
    var cameraId = req.body["cameraId"];
*/
    // Filename = req.files[0]["filename"]
    console.log(req)
    res.send("OK")

    // start child yolo process
/*    var child = spawn('python3', ['process_image.py', imageBase64, width, height,cameraId], options);

    // save all the outputs
    child.stdout.on('data', function(data) {
        console.log(data.toString());
    });

    // log error if any
    child.stderr.on('data', function(data) {
        console.log("ERR child process: " + data.toString());
        yoloErr = "Generator Algorithm: " + data.toString();
    });

    // once child process ends, update SQL table
    child.on('close', function(code) {
        if (!yoloErr) {

        } else {
            res.json({"success":false, "message":yoloErr});
        }
    });*/
};

/*Query DB*/
exports.query = function(req,res,next){

    var queryString = "SELECT * FROM Object"
    con.query( queryString , function( err , result ){
        if (err){res.send(err)}

        else {
            res.json(result)
        }
    })

};

/*exports.read_result_from_id = function (req, res, next) {
    // Return all Result
    if (typeof(req.query) === "undefined" || typeof (req.query.id) === "undefined") {
        var query = "SELECT * FROM Result WHERE isDeleted = FALSE";
    }
    //Return only the Result with the given routineId
    else {
        var query = "SELECT * FROM Result WHERE `id` = \"" +
            req.query.id + "\" AND isDeleted = FALSE";
    }
    con.query(query, function (err, result) {
        if (err) throw err;
        console.log(result);
        res.json(result);
    });
}*/
