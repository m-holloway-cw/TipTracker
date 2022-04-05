const express = require('express');
const mustacheExpress = require("mustache-express");
const bodyParser = require('body-parser');
const app = express();
const request = require('request');
var path = require('path');
const fs = require('fs');
const EventEmitter = require('events');



app.engine('html', mustacheExpress());
app.use(express.static(path.join(__dirname, 'controllers')));
app.use(express.static(path.join(__dirname, 'views')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.engine('ejs', require('ejs').__express);
app.set('views', path.join(__dirname,'./views'));

//globals
  var globalData = {};

  //jules event system
  const julesStream = require('./eventStream');
  const julesStreamSource = new EventEmitter();


app.get('/overlay', function (req, res) {

  res.render('overlay', {serverData: globalData});
});

app.get('/', function (req, res) {

  res.render('controls', {serverData: globalData});
});

app.get('/getData', function (req, res) {

  res.send(globalData);
});

app.get('/events', function(req, res){
  initializeSSEJules(req, res);
});
function initializeSSEJules(req, res) {
  res.writeHead(200, {
		"Content-Type": "text/event-stream",
		"Cache-Control": "no-cache",
		"Connection": "keep-alive"
	});
  julesStreamSource.on("push", function(event, data){
    var msg = JSON.stringify(data.msg);
    res.write("data: " + msg + "\n\n");
  });
  julesStreamSource.setMaxListeners(0);
};



app.post('/', function(req, res){
  var json = req.body;
  var type = json.type;
  switch (type) {
    case 'setCount':
      setCount(json);
      break;
    case 'setColor':
      setColor(json);
      break;
    case 'add':
      addAmount(json);
      break;
    case 'remove':
      remAmount(json);
      break;
    default:
      console.log('Invalid json found');
      console.log(json);
      break;
  }
  res.send('200');
});

function setCount(json){
  globalData.text = json.text;
  globalData.currAmt = parseInt(json.currAmt);
  globalData.goalAmt = parseInt(json.goalAmt);
  sendOverlayUpdate();
}
function setColor(json){
  globalData.tColor = json.tColor;
  globalData.pColor = json.pColor;
  globalData.bgColor = json.bgColor;
  sendOverlayUpdate();
}
function addAmount(json){

  var curr = globalData.currAmt
  globalData.currAmt = parseInt(curr) + parseInt(json.amt);
  sendOverlayUpdate();
}
function remAmount(json){
  var curr = globalData.currAmt
  globalData.currAmt = parseInt(curr) - parseInt(json.amt);
  sendOverlayUpdate();
}

function sendOverlayUpdate(){
  julesStream.julesArray.push({method: "update", data:globalData})
  writeConfig();
}

function writeConfig(){
  fs.writeFile(path.join(process.cwd(), '/config.json'), JSON.stringify(globalData), err =>{
    if(err) console.log(err);
  });
}

function setup(){
  fs.readFile(path.join(process.cwd(), '/config.json'), 'utf8' , (err, data) => {
  if (err) {
    console.error(err)
    return
  }
  globalData = JSON.parse(data);
})
}

app.listen(8080, function () {
console.log('Navigate to http://localhost:8080')
console.log('Overlay at http://localhost:8080/overlay');
});

setup();




exports.app = app;
module.exports.julesStreamSource = julesStreamSource;
