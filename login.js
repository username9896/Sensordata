const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose')
mongoose.connect('mongodb+srv://vicky4830:vicky111@cluster0.lmsnl7w.mongodb.net/mydb', { useNewUrlParser: true, useUnifiedTopology: true });

const mqtt = require('mqtt');
const bodyParser = require('body-parser');
const Logindata = require('./models/device1');

const base = `${__dirname}/public`;
const app = express();
app.use(express.static('public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true

}));

const port = 5000;

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/', (req, res) => {
  res.sendFile(`${base}/water.html`);
});

const brokerUrl = 'mqtt://localhost:1883';
const topic = 'sensor_data'
const dandt = 'date'
const loadcell = 'loadcelldata'

const client = mqtt.connect(brokerUrl);

app.get('/send-data/sensor-data', (req, res) => {
  Logindata.find()
    .then(data => {
      res.send(data);
    })
});

client.on('connect', function () {
  console.log('Connected to MQTT broker');

  client.subscribe(topic, function (err) {
    if (err) {
      console.error('Failed to subscribe to topic', err);
    } else {
      console.log('Subscribed to topic', topic);
    }
  });

  client.subscribe(dandt, function (err) {
    if (err) {
      console.error('Failed to subscribe to dandt', err);
    } else {
      console.log('Subscribed to topic', dandt);
    }
  });

  client.subscribe(loadcell, function (err) {
    if (err) {
      console.error('Failed to subscribe to loadcelldata', err);
    } else {
      console.log('Subscribed to topic', loadcell);
    }
  });
});

a = 0;
b = 0;
c = 0;
d = 0;

client.on('message', function (topic, message) {
  // console.log('Received message on topic', topic, ' ', message.toString());

  if (topic === 'sensor_data') {
    data = message;

  } else if (topic === 'date') {
    a = message;
  }
  else if (topic == 'loadcelldata') {
    b = message;
  }

  if (data && a && b) {
    const NewDevice = new Logindata({
      data: data,
      date: a,
      loadcelldata: b
    })
    NewDevice.save()
  }
})

app.listen(port, () => {
  console.log(`Server is listening on port ${port}.`);
});