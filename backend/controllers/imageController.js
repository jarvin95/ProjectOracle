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
    cwd: '/home/ashiswin/Documents/ProjectOracle/image_processing/',
    env: process.env
};


var query1 = "SELECT `id` FROM Object WHERE name = \"" + item_string + "\";";
con.query(query1, function (err, result1) {
    if (err) throw err;
    var query2 = "SELECT TOP 1 `reference_object` FROM Instance WHERE `parent_object_id` = \"" + result1 + "\";";
    con.query(query2, function(err, result2) {
        if (err) throw err;
        return result2;
    });
});


/*Call Isaac's function then send to DB*/
exports.new_image = function(req, res, next){

    var filename = req.files[0]['filename'];
    var cameraId = req.body["cameraId"];
    var img_path = "../backend/uploads/" + filename;
    var yoloErr;
    var output;

    // start child yolo process
    var child = spawn('python3', ['process_image.py', img_path], options);

    // save all the outputs
    child.stdout.on('data', function(data) {
        output = data.toString();
    });

    // log error if any
    child.stderr.on('data', function(data) {
        console.log("ERR child process: " + data.toString());
        yoloErr = "Generator Algorithm: " + data.toString();
    });

    // once child process ends, update SQL table
    child.on('close', function(code) {
        if (!yoloErr && output) {
            var json_data = JSON.parse(output);
            var selectObjectQuery = "SELECT * FROM Object WHERE `name` = ? AND `parent_camera_id` = ?";
            var insertObjectQuery = "INSERT INTO Object (`name`, `parent_camera_id`) VALUES (?,?)"
            var deleteInstanceQuery = "DELETE FROM Instance WHERE `parent_object_id` = ?";
            var insertInstanceQuery = "INSERT INTO Instance (`parent_object_id`, `reference_object`, `bounding_box`) VALUES (?,?,?)"

            for (var key in json_data) {
                // check if object exists
                con.query(selectObjectQuery, [key, cameraId], function(select_err, select_result) {
                    
                    // if exists, delete from instances, and update
                    if (Object.keys(select_result).length) {
                        con.query(deleteInstanceQuery, [select_result[0].id]);

                        for (var index in json_data[key]) {
                            var bounding_box = json_data[key][index].slice(0,5).join();
                            var reference_object = json_data[key][index][6];

                            con.query(insertInstanceQuery, [select_result[0].id, reference_object, bounding_box]);
                        }

                    } else {
                        // else, create 
                        con.query(insertObjectQuery, [key, cameraId], function(insert_err, insert_result) {
                            if (!insert_err) {
                                for (var index in json_data[key]) {
                                    var bounding_box = json_data[key][index].slice(0,5).join();
                                    var reference_object = json_data[key][index][6];

                                    con.query(insertInstanceQuery, [insert_result.insertId, reference_object, bounding_box]);
                                }
                            }
                        });
                    }
                });
            }

            res.json({"success":true});
        } else {
            res.json({"success":false, "message":yoloErr});
        }
    });
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
