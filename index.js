var twilio = require('twilio');
var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');

var config = require('./config');
console.log(config.accountSid, config.authToken);

// Create a Twilio REST API client for authenticated requests to Twilio
var client = twilio(config.accountSid, config.authToken);

// start
var app = express();

app.set('port', (process.env.PORT || 5000));

// Parse incoming request bodies as form-encoded
app.use(bodyParser.urlencoded({
    extended: true,
}));

// Use morgan for HTTP request logging
app.use(morgan('combined'));

app.get('/', function(req, res) {
    res.send('OK: ' + config.test);
    // //Create TwiML response
    // var twiml = new twilio.TwimlResponse();
    // twiml.say("Hello from your Sy Le.");

    // res.writeHead(200, {'Content-Type': 'text/xml'});
    // res.end(twiml.toString());
});


// Handle an AJAX POST request to place an outbound call
app.post('/call', function(request, response) {
    // This should be the publicly accessible URL for your application
    // Here, we just use the host for the application making the request,
    // but you can hard code it or use something different if need be
    var salesNumber = request.body.salesNumber;
    var url = 'http://' + request.headers.host + '/outbound/' + encodeURIComponent(salesNumber)

    var options = {
        to: request.body.phoneNumber,
        from: config.twilioNumber,
        url: url,
    };

    // Place an outbound call to the user, using the TwiML instructions
    // from the /outbound route
    client.calls.create(options)
      .then(function (message) {
        console.log(message.responseText);
        response.send({
            message: 'Thank you! We will be calling you shortly.',
        });
      })
      .catch(function (error) {
        console.log(error);
        response.status(500).send(error);
      });
});

// Return TwiML instuctions for the outbound call
app.post('/outbound/:salesNumber', function(request, response) {
    var salesNumber = request.params.salesNumber;
    var twimlResponse = new VoiceResponse();

    twimlResponse.say('Thanks for contacting our sales department. Our ' +
                      'next available representative will take your call. ',
                      { voice: 'alice' });

    twimlResponse.dial(salesNumber);

    response.send(twimlResponse.toString());
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

