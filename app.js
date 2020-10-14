const express = require('express');
const bodyParser = require('body-parser');
const http = require("http");
const cors = require('cors');


const port = process.env.PORT || 4002;
// create the express server and create an object to store subscriptions
var app = express();
app.use(cors());
app.options('*', cors());
app.set('subscriptions', {});
app.use(bodyParser.json());


const server = http.createServer(app);

// import web-push to help set up Push notifications
const webPush = require('web-push');

// these VAPID keys are for validating connections
const vapidKeys = webPush.generateVAPIDKeys();
process.env.VAPID_PUBLIC_KEY = vapidKeys.publicKey;
process.env.VAPID_PRIVATE_KEY = vapidKeys.privateKey;

// add the VAPID keys to web push
webPush.setVapidDetails(
  'http://localhost:3001/',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// webPush.setVapidDetails(
//   'http://localhost:3001/',
//   'BJZWuHMx8wVbUa-YxUGsDCRc2iB2i5TvRN4QYXqVCk0lQWxdqaX0iY1MFX-Ze97TizsE8s6NNlEZtZC2GxoiNzo',
//   'cC3Trh3r6fsWKrnJybaZoGSHx_Z3xxcg8vltghaoZaQ'
// );



// create a route that will allow the client to retrieve our VAPID public key
app.get('/pushKey',(request, response) => { response.send(process.env.VAPID_PUBLIC_KEY); });

// create a route that will allow the client to send us their subscription info
app.post('/subscribe', (request, response) => {
  console.log('added for subscription');
  // use the subscription endpoint as a key for storing the subscription
  request.app.get('subscriptions')[request.body.endpoint] = request.body;
  // 201 response means: "Created", hence the subscription has been created
  response.sendStatus(201);
});

// create a route that will allow the client to delete their subscription
app.post('/unsubscribe', (request, response) => {
  // use the subscription endpoint as a key for storing the subscription
  delete request.app.get('subscriptions'); //[request.body.endpoint]
  // this should probably be 200, but we'll continue to use 201 for simplicity
  response.sendStatus(201);
});

/* when we want to send a push notification, we do this: */

// get all the subscriptions
app.get('/getNotification',(request, response) => { 
  console.log(app.settings['subscriptions']);
  Object.values(app.settings['subscriptions'])
  .forEach((subscription, index) => {
    console.log(index);
    // for each subscription, send a notification
    webPush.sendNotification(subscription, 'Notification Payload')
      .then(() => {
        // after a notification has been sent
      }).catch((e) => {
        // handle errors
      });
});
response.sendStatus(201);
});


server.listen(port, () => console.log(`Listening on port ${port}`));