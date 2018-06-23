var express = require('express');
var router = express.Router();
var fulfillmentController = require('../controllers/fulfillmentController');

/* Handles post request from Dialogflow */
router.post('/', fulfillmentController.fulfill);

module.exports = router;
