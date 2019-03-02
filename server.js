'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
let bodyParser = require('body-parser');
var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.MONGOLAB_URI);

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use(bodyParser.urlencoded({extended: false}));

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

// testing db connection
let postUrl = require('./myApp.js').PostUrl;
app.post('/api/shorturl/new/', (req, res) => {
  postUrl(req.body.url, (err, doc) => {
    if (err) {
    console.log(err)
    } else {
      console.log(doc);
      res.json(doc);
    }
  });
})

// get redirected
let getShortUrl = require('./myApp.js').GetShortUrl
app.get('/api/shorturl/:short_url?', (req, res) => {
  getShortUrl(req.params.short_url, (err, doc) => {
    err ?
    console.log(err) :
    console.log(doc)
    typeof doc === "string" ?
    res.redirect(doc) :
    res.json(doc)
  })
})

app.listen(port, function () {
  console.log('Node.js listening ...');
});