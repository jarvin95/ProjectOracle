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
var fs = require('fs');
var gm = require('gm').subClass({ imageMagick: true });
var path = require('path');

var options = {
    cwd: '/home/ashiswin/Documents/ProjectOracle/image_processing/',
    env: process.env
};


/*Call Isaac's function then send to DB*/
exports.new_image = function(req, res, next){

    var filename = req.files[0]['filename'];
    var cameraId = req.body["cameraID"];
    var img_path = "../backend/uploads/" + filename;
    var yoloErr;
    var output;

    // start child yolo process
    var child = spawn('python3', ['process_image.py', img_path], options);

    // save all the outputs
    child.stdout.on('data', function(data) {
        output = data.toString();
        console.log("output: " + output);
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

            Object.keys(json_data).forEach(function(key) {
                // check if object exists
                console.log("Check whether " + key + " exists in Objects")
                con.query(selectObjectQuery, [key, cameraId], function(select_err, select_result) {

                    // if exists, delete from instances, and update
                    if (select_result.length > 0) {
                        con.query(deleteInstanceQuery, [select_result[0].id]);

                        // update object latest photo
                        parent_img_path = './uploads/' + filename;
                        fs.createReadStream(parent_img_path).pipe(fs.createWriteStream('./uploads/obj-' + select_result[0].id));

                        console.log(key + " exists, updating")
                        for (var index in json_data[key]) {
                            var bounding_box = json_data[key][index].slice(0,4).join();
                            var reference_object = json_data[key][index][6];

                            con.query(insertInstanceQuery, [select_result[0].id, reference_object, bounding_box]);
                        }

                    } else {
                        // else, create 
                        console.log(key + " does not exist, creating");
                        con.query(insertObjectQuery, [key, cameraId], function(insert_err, insert_result) {
                            if (!insert_err) {
                                
                                // update object latest photo
                                parent_img_path = './uploads/' + filename;
                                fs.createReadStream(parent_img_path).pipe(fs.createWriteStream('./uploads/obj-' + insert_result.insertId));

                                for (var index in json_data[key]) {
                                    var bounding_box = json_data[key][index].slice(0,4).join();
                                    var reference_object = json_data[key][index][6];

                                    con.query(insertInstanceQuery, [insert_result.insertId, reference_object, bounding_box]);
                                }

                            } else {
                                console.log(insert_err);
                            }
                        });
                    }

                    // update camera latest photo
                    parent_img_path = './uploads/' + filename;
                    fs.createReadStream(parent_img_path).pipe(fs.createWriteStream('./uploads/cam-' + cameraId));
                });
            });

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

exports.latest_obj = function(req, res, next) {

    var objName = req.params.objName;
    var cameraId = 2;
    var queryString = "SELECT `id` FROM Object WHERE `name` = ? AND `parent_camera_id` = ?";

    con.query(queryString, [objName, cameraId], function(err, result){
        
        if (result.length > 0) {
            var filename = "./uploads/obj-" + result[0].id;    
            var img = fs.readFileSync(filename);
            res.writeHead(200, {'Content-Type': 'image/jpg'});
            res.end(img, 'binary');
        } else {
            res.json({'success': false, 'message': 'object not found'});
        }
    });
}


exports.latest_cam = function(req, res, next) {

    var filename = "./uploads/cam-2";    
    var img = fs.readFileSync(filename);

    res.writeHead(200, {'Content-Type': 'image/jpg'});
    res.end(img, 'binary');
}


exports.obj_crops = function(req, res, next) {

    gm('./uploads/cam-2')
        .crop(100, 100, 0, 0)
        .write('./tmp.jpg', (err) => {
            if (err) {
                console.log(err); 
            } else {
                res.sendFile(path.resolve('./tmp.jpg') , { root: __dirname });
            }
        });
}

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
