/*
 ***** Server JS File.  This is the entry point for the New Scraper app on the server side.
 */

// Dependencies
var express = require("express");
var mongoose = require("mongoose");
var request = require("request");
var cheerio = require("cheerio");
var hbars = require("express-handlebars");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

var db = require("./models");

// Get Express handle and PORT to listen to
var app = express();
var PORT = process.env.PORT || 3000;

// Set Handlebars
app.engine("handlebars", hbars({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Set up app to handle data parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.text());
app.use(bodyParser.json({type: "application/vnd.api+json"}));

// Set up static path to "public" directory
app.use(express.static("public"));

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect("mongodb://localhost/NewsScraperDb", {
  useMongoClient: true
});

// Routes
require("./controller/api-routes.js")(app);

// Listen on the port
app.listen(PORT, function(error) {
	if (error) {
		console.log(error);
	} else {
		console.log("Listening on PORT: " + PORT);
	}
});