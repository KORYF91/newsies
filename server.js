// Dependencies
var express = require("express");
var mongojs = require("mongojs");
var mongoose = require("mongoose");
// Require axios and cheerio. This makes the scraping possible
var axios = require("axios");
var cheerio = require("cheerio");
var PORT = 8080;
// Initialize Express
var app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

var db = require("./models");
// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/newies", { useNewUrlParser: true });

// Database configuration
// var databaseUrl = "newies";
// var collections = ["newiesData"];

// // Hook mongojs configuration to the db variable
// var db = mongojs(databaseUrl, collections);
// db.on("error", function(error) {
//   console.log("Database Error:", error);
// });

// Main route (simple Hello World Message)
app.get("/", function(req, res) {
  res.render("index");
});

app.get("/all", function(req, res) {

  db.scrapedData.find({}, function(error, found) {
    if (error) {
      console.log(error);
    }
    else {
      res.json(found);
     // var artcl = {article: found}
      //res.render(index,artcl)
    }
  });
});

// make a button to hit the route on handlebar file.

app.get("/scrape", function(req, res) {
axios.get("https://www.npr.org/").then(function(response) {
  var $ = cheerio.load(response.data);
  var results = [];
  $("div.story-wrap").each(function(i, element) {
   
    var title = $(element).find("h3").text().trim();
    var link = $(element).find("a").attr("href");
    var photo = $(element).find("img.img").attr("src");
    var sum = $(element).find("p.teaser").text();
      console.log(photo);
      console.log(sum);
    if (title && link && photo && sum) {
      if(results.indexOf(title) == -1){
        results.push(title);

        // Insert the data in the scrapedData db
        db.scrapedData.insert({
          title: title,
          link: link,
          photo: photo,
          summary: sum
        },
        function(err, inserted) {
          if (err) {
            console.log(err);
          }
          else {
            console.log(inserted);
          }
        });

      }
    }
  });
});

// Send a "Scrape Complete" message to the browser
res.send("Scrape Complete");
});
// Listen on port 3000
app.listen(PORT, function() {
  console.log("App running on" + PORT);
});
