var express = require('express');
var router = express.Router();
var imageController = require('../controllers/imageController');
var multer = require('multer');
var upload = multer({dest: './uploads/'});

/* Call Isaac's python script and send to DB. */
router.post('/new', upload.any(), imageController.new_image);

/* Query DB with input params*/
router.get('/', imageController.query);

// Get latest object image
router.get('/latest_obj/:objName', imageController.latest_obj);


module.exports = router;
