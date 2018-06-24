// Import the appropriate service and chosen wrappers

const {
  dialogflow,
  Image,
} = require('actions-on-google')

const express = require('express')
const bodyParser = require('body-parser')

var https = require('https');
var fs = require('fs');
const options = {
    cert: fs.readFileSync("/etc/letsencrypt/live/www.kodyac.tech-0001/fullchain.pem"),
    key: fs.readFileSync("/etc/letsencrypt/live/www.kodyac.tech-0001/privkey.pem")
};


// Create an app instance
const app = dialogflow()
const e = express().use(bodyParser.json(), app)



// Register handlers for Dialogflow intents
app.intent('Default Welcome Intent', conv => {
  conv.ask('Hi, how is it going?')
  conv.ask(`Here's a picture of a cat`)
  conv.ask(new Image({
    url: 'https://developers.google.com/web/fundamentals/accessibility/semantics-builtin/imgs/160204193356-01-cat-500.jpg',
    alt: 'A cat',
  }))
})

// Intent in Dialogflow called `Goodbye`
app.intent('Goodbye', conv => {
  conv.close('See you later!')
})

app.intent('Default Fallback Intent', conv => {
  conv.ask(`I didn't understand. Can you tell me something else?`)
})


var port = normalizePort('8080');
e.set('port', port);

/**
 * Create HTTP server.
 */

//var server = http.createServer(app);
var server = https.createServer(options, e)

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}