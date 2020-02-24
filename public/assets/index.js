// need to link the button on click submit it scrapes the NPR site and shows the result by refreshing the page
$(document).ready(function() {

    //clear the mongoose collection of all articles 
    $("#clear").on("click", function(event){
        console.log("cliked clear")
      event.preventDefault();
      $.ajax({
        type: "delete",
        url: "/delete"
      }).then(function(){
        console.log("everything deleted")
        location.reload();
      }).catch(function(err){
        console.log(err);
      });
    });
    
    //scrape NPR.com for the latest articles
    $("#scrape").on("click", function(event){
      event.preventDefault();
      $.get("/scrape").then(function(){
        location.reload();
      }).catch(function(err){
        console.log(err);
      });
    });
  });