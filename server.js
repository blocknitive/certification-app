"use strict"
var express = require('express')
var app = express()

// for start ipfs node
const IPFS = require('ipfs');
const node = new IPFS();

// helpers libraries
var bodyParser = require('body-parser');
var path = require('path');
var moment = require('moment');;

// support json encoded bodies
app.use(bodyParser.json()); 

// support encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); 

// static files
app.use(express.static(path.join(__dirname, 'public')));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

node.on('ready', () => {
  console.log("IPFS Node is READY");
})

app.get('/', function (req, res) {
  res.render('index');
})

// Upload JSON file to IPFS
app.post('/uploadJson', function (req, res) {
  var data = JSON.parse(req.body.json);
  data.certificationDate = moment(new Date()).format("DD/MM/YYYY").toString();
  // using ipfs node for upload JSON file as String to the Distributed Web
  node.files.add([new Buffer(JSON.stringify(data))], (err, ipfsResponse) => {
    // Returning whole response to client
    res.send(ipfsResponse)
  });
})

// View certificated.ejs with filled data
app.get('/certificated/:hashCertificated/:txId?', function (req, res) {
  // here we get the JSON file uploaded before from IPFS Distributed Network
  node.files.cat(req.params.hashCertificated, function (err, file) {
    // little kind of error control
    if (err) {
      res.send('There is a no valid hash for get the Certificate', 500);
    }

    var data = JSON.parse(file.toString());
    data.txId = req.params.txId;
    // render data response into certificates.ejs
    res.render('certificate', data)
  })
});


// endpoint for 404 errors
app.get('*', function(req, res){
  res.send('what???', 404);
});

// start the localhost server at port 3000
app.listen(3000, function () { console.log("Listen on http://localhost:3000")})

