var spawn = require("child_process").spawn;

var options = {
    cwd: process.cwd(),
    env: process.env,
};

// start child yolo process
var child = spawn('python3', ['/path/to/yolo', 'binary/input/from/post'], options);

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
});