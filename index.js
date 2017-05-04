// https://www.twilio.com/docs/tutorials/browser-calls-node-express#generate-a-capability-token
var twilio = require('twilio');
var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var ClientCapability = require('twilio').jwt.ClientCapability;
var VoiceResponse = twilio.twiml.VoiceResponse;


// internal
var config = require('./config');

// start
var app = express();

app.set('port', (process.env.PORT || 5000));

// Parse incoming req bodies as form-encoded
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// Use morgan for HTTP req logging
app.use(morgan('combined'));

app.get('/', function(req, res) {
    res.send('OK: ');
});


app.post('/generate', function (req, res) {
  var clientName = "support_agent";

  var capability = new ClientCapability({
      accountSid: config.accountSid,
      authToken: config.authToken
  });
  capability.addScope(
    new ClientCapability.OutgoingClientScope({
      applicationSid: config.appId}));
  capability.addScope(
    new ClientCapability.IncomingClientScope(clientName));

  var token = capability.toJwt();
  res.setHeader('Content-Type', 'application/json');
  res.json({ token: token });
});

app.get('/voice', function(req, res){
    res.set('Content-Type', 'text/xml');
    res.send([
        '<?xml version="1.0" encoding="UTF-8" ?>',
        '<Response> ',
        '    <Say>Hello World</Say>',
        '    <Play>https://api.twilio.com/Cowbell.mp3</Play>',
        '</Response>',
    ].join('\n'));
});

app.post('/voice', twilio.webhook({validate: false}), function(req, res, next) {
    console.log('req.body', req.body);
  var phoneNumber = req.body.phoneNumber;
  var callerId = config.twilioNumber;
  // var twiml = new VoiceResponse();

  // var dial = twiml.dial({callerId : callerId});
  // if (phoneNumber != null) {
  //   dial.number(phoneNumber);
  // }

  // res.send(twiml.toString());

    res.set('Content-Type', 'text/xml');
    res.send([
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<Response>',
        '<Say> Please wait while we connect you to the Lead</Say>',
        '<Dial callerId="' + callerId + '" record="record-from-start">',
        '    <Number>' + phoneNumber + '</Number>',
        '</Dial>',
        '</Response>',
    ].join('\n'));
});



// // Handle an AJAX POST req to place an outbound call
// app.post('/call', function(req, res) {
//     // This should be the publicly accessible URL for your application
//     // Here, we just use the host for the application making the req,
//     // but you can hard code it or use something different if need be
//     var salesNumber = req.body.salesNumber;
//     var fromNumber = req.body.fromNumber || config.twilioNumber;
//     var url = 'http://' + req.headers.host + '/outbound/' + encodeURIComponent(salesNumber)


//     var options = {
//         to: req.body.phoneNumber,
//         from: fromNumber,
//         url: url,
//     };

//     // // Place an outbound call to the user, using the TwiML instructions
//     // // from the /outbound route
//     client.calls.create(options)
//       .then(function (message) {
//         console.log(message.resText);
//         res.send({
//             message: 'Thank you! We will be calling you shortly.',
//             url: url
//         });
//       })
//       .catch(function (error) {
//         console.log(error);
//         res.status(500).send(error);
//       });
// });

// // Return TwiML instuctions for the outbound call
// app.post('/outbound/:salesNumber', function(req, res) {
//     try{
//         var salesNumber = req.params.salesNumber;
//         // var twimlres = new Voiceres();

//         // twimlres.say('Thanks for contacting our sales department. Our ' +
//         //                   'next available representative will take your call. ',
//         //                   { voice: 'alice' });

//         // twimlres.dial(salesNumber);

//         // res.send(twimlres.toString());


//         var resp = new twilio.TwimlResponse();
//         resp.say({voice:'alice'}, 'Welcome to Acme Corporation!' +
//             'Thanks for contacting our sales department. Our ' +
//                           'next available representative will take your call. ');

//         // The <Gather> verb requires nested TwiML, so we pass in a function
//         // to generate the child nodes of the XML document
//         resp.gather({ timeout:30 }, function() {

//             // In the context of the callback, "this" refers to the parent TwiML
//             // node. The parent node has functions on it for all allowed child
//             // nodes. For <Gather>, these are <Say> and <Play>.
//             this.say('For sales, press 1. For support, press 2.');

//         });

//         //Render the TwiML document using "toString"
//         res.writeHead(200, {
//             'Content-Type':'text/xml'
//         });
//         res.end(resp.toString());

//     } catch(e){
//         res.send('Error: '+ e)
//     }
// });

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

