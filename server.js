// Dependencies
const express = require("express");
// const mongojs = require("mongojs");
const mongoose = require("mongoose");
// Require axios and cheerio. This makes the scraping possible
const axios = require("axios");
const cheerio = require("cheerio");
// Sets an initial port. We"ll use this later in our listener
var PORT = process.env.PORT || 8080;

// Initialize Express
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

const db = require("./models");


// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/newies";

mongoose.connect(MONGODB_URI, { useNewUrlParser: true });


// Connect to the Mongo DB
// mongoose.connect("mongodb://localhost/newies", { useNewUrlParser: true });

// Database configuration
// const databaseUrl = "newies";
// const collections = ["newiesData"];

// // Hook mongojs configuration to the db constiable
// const db = mongojs(databaseUrl, collections);
// db.on("error", function(error) {
//   console.log("Database Error:", error);
// });

// Main route (simple Hello World Message)
app.get("/", function(req, res) {
  res.render("index");
});



// make a button to hit the route on handlebar file.

app.get("/scrape", function(req, res) {
axios.get("https://www.npr.org/").then(function(response) {
  const $ = cheerio.load(response.data);
  
  $("div.story-wrap").each(function(i, element) {
    const results = [];
    const title = $(element).find("h3").text().trim();
    const link = $(element).find("a").attr("href");
    const photo = $(element).find("img.img").attr("src");
    const sum = $(element).find("p.teaser").text();
      console.log(photo);
      console.log(sum);
    if (title && link && photo && sum) {
      if(results.indexOf(title) === -1){
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

app.get("/all", function(req, res) {

  db.scrapedData.find({})
  .then(function(error, found) {
    if (error) {
      console.log(error);
    }
    else {
      res.json(found);
     // const artcl = {article: found}
      //res.render(index,artcl)
    }
  });
});
// Listen on port 3000
app.listen(PORT, function() {
  console.log("App running on" + PORT);
});
