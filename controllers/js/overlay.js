var evt = {
  init : function(){
    var src = new EventSource("http://localhost:8080/events");
    src.addEventListener("message", function(event){
            var data = JSON.parse(event.data);
            var type = data.method;
            if(type === "update"){
              updateElements(data.data);
            }//ignore other messages
        }, false);
      }
    };

function getCounter(){
  $.ajax({
    url: '/getData',
    type: 'get',
    success:function(data){
      updateElements(data);
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
        alert("Error occurred in request");
      }
  });
}

function updateElements(data){

  var bgColor = data.bgColor;
  var pColor = data.pColor;
  var tColor = data.tColor;
  var text = data.text;
  var currAmt = data.currAmt;
  var goalAmt = data.goalAmt;


  //percentage for progress and goal stuff
  var perc = parseFloat(currAmt/goalAmt).toFixed(2)*100+"%";
  document.getElementsByClassName("bar")[0].style.width =  perc;

  document.getElementsByClassName("bar")[0].style.backgroundColor =  pColor;
  document.getElementsByClassName("w3-dark-grey")[0].style = 'background-color:'+bgColor + '!important';
  document.getElementsByClassName("text")[0].style.color =  tColor;

  document.getElementById("desc").innerHTML = text;
  document.getElementById("currAmt").innerHTML = '$'+currAmt;
  document.getElementById("totalAmt").innerHTML = '$'+goalAmt;
}


$(document).ready(function(){
  evt.init();
  getCounter();
});
