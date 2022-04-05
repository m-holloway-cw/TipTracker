
const server = require.main.require('./start.js');


var julesArray = new Array();
module.exports.julesArray = julesArray;
const Queue = require('better-queue');
/* create and initialize queue and function fu*/
function fu (json, cb) {
  //console.log(json);
  var system = json.system;
  // send with system, listen for key on page side
  server.julesStreamSource.emit("push", "message", { msg: json });
  cb(null, json);
}
var q = new Queue(fu);


setInterval(function(){
    //grab first element of array and send to the queue
    if(julesArray.length){
      q.push(julesArray.shift(), function(err, result){});
    }
}, 1000);

setInterval(function(){
  q.push({update:"connection test jules stream", number:"3"}, function(err, result){
    if(err) console.log(err);
    //console.log(result);
  });
}, 30000);
