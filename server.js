// Dependencies
var express = require("express");
var exphbs = require("express-handlebars")
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
// Sets an initial port. We"ll use this later in our listener
var PORT = process.env.PORT || 3000;
var db = require("./models");
// Initialize Express
var app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));
// Handlebars
app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main",
  }),
);
app.set("view engine", "handlebars");
// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/npr";
mongoose.connect(MONGODB_URI, { useNewUrlParser: true }).then(function () {
  console.log(`Connected to database ${MONGODB_URI}`);
});
// sConnect to the Mongo DB
//  mongoose.connect("mongodb://localhost/npr", { useNewUrlParser: true });
// Main route (LANDING PAGE)
app.get("/", function(req, res) {
  db.Article.find({}).lean()
  .then(function(dbArticle) {
  var hbsObject = {
    data: dbArticle
  };
      res.render("index", hbsObject);

  })
  .catch(function(err) {
    // If an error occurred, send it to the client
    res.json(err);
  });
  // res.render("index");
});

//Delete route - clear the database 
app.delete("/delete", function(req, res) {
  db.Article.deleteMany({}).then(function () {
    res.status("200").send("deleted collection")
  });
});
// make a button to hit the route on handlebar file.
app.get("/scrape", function(req, res) {
axios.get("https://www.npr.org/").then(function(response) {
  var $ = cheerio.load(response.data);
  var results = {};
   $("div.story-wrap").each(function(i, element) {
    results.title = $(element)
    .find("h3")
    .text()
    .trim(); 
    results.link = $(element)
    .find("a")
    .attr("href");
    results.photo = $(element)
    .find("img.img")
    .attr("src");
    results.summary = $(element)
    .find("p.teaser")
    .text();
      // console.log(photo);
      console.log(results.summary);
    if (results.title && results.link && results.photo && results.summary) {
      if(results.title.indexOf(results.title) === -1){
        results.push(results.title);
       }
       db.Article.create(results)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, log it
          console.log(err);
        });
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
