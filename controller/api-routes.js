/*
 * Define all routes for the app here.
 */


//Dependencies
var request = require("request");
var cheerio = require("cheerio");
var db = require("../models");

var results = [];
const MAX_ARTICLES = 20;

function newsRoutes(app) {

	app.post("/addnote/:id", function(req, res) {
		var id = req.params.id;
		var body = req.body;
		console.log("Post new Note: " + id);
		console.log(body);
		db.Note
		.create(body)
		.then(function(dbNote) {
			console.log(dbNote);
			return db.Article.findOneAndUpdate({"_id": req.params.id}, { $push: { notes: dbNote._id } }, { new: true });
		});
	});

	app.post("/delete-note/:id", function(req, res) {
		var id = req.params.id;
		console.log("Deleting Notes for  Id: " + id);
		db.Note
		.findOneAndRemove({_id: req.params.id})
		.then(function(dbNote) {
			console.log(dbNote);
			return db.Article.findOneAndUpdate({"_id": req.body.id}, { $pull: { notes: req.params.id } }, { new: true });

		});
	});
		
	app.get("/notes/:id", function(req, res) {
		var id = req.params.id;
		console.log("Get all notes: " + id);
		db.Article.findOne({"_id": req.params.id})
		  .populate("notes")
		  .then(function(data) {
		    console.log(data);
		    res.json(data);
		  });
	});

	// Perform a new scrape and save the results
	// Note that we need to only save the new ones
	// Let us get 20 items for now
	app.get("/scrape", function(req, res) {
		console.log("GET: SCRAPE")

		request("https://techcrunch.com/", function(error, response, html) {
			var $ = cheerio.load(html);
			var count = 0;
			$("div.block-content").each(function(i, element) {
				var title = $(element).children(".post-title").text();
				if (title) {
					var scrapeObj = {
						title: $(element).children(".post-title").text(),
						url: $(element).children(".post-title").children().attr("href"),
						byLine: $(element).children(".byline").children('a').attr("title"),
						byLineUrl: $(element).children(".byline").children('a').attr("href"),
						created: $(element).children(".byline").children(".timestamp").attr("datetime"),
						excerpt: $(element).children(".excerpt").text(),
						saved: false
					};

					db.Article
					.findOneAndUpdate(scrapeObj, scrapeObj, {upsert: true})
					.then(function(err, data) {
						console.log("DONE");
						if (err) {
							console.log("Insert Error: " + err);
							res.send("Scrape Complete");
						} else {
							console.log(data);
							res.send("Scrape Complete");
						}
					});

					count++;
				}
				// We only want to scrape 20 articles.
				if (count >= MAX_ARTICLES) {
					return false;
				}
			});
		});
	});

	// Save an article
	app.post("/save/:id", function(req, res) {
		console.log("POST Save Article: " + req.params.id);
		db.Article
		.findOneAndUpdate({"_id":req.params.id},{saved: true}, {new: true})
		.then(function(data) {
			res.json(data);
		});
	});

	// Delete an article from saved list
	app.post("/delete/:id", function(req, res) {
		console.log("POST Delete Saved Article: " + req.params.id);

		// Just toggle the saved field of the entry in the database
		db.Article
		.findOneAndUpdate({"_id":req.params.id},{saved: false}, {new: true})
		.then(function(data) {
			console.log(data);
			res.json(data);
		});
	});

	// Retrieve saved articles
	app.get("/saved", function(req, res) {
		console.log("Get all Saved articles");
		db.Article
		.find({saved: true})
		.then(function(dbSaved) {
			console.log(dbSaved);
			res.render('saved', {articles: dbSaved});
		});
	});

	// Route for getting all Articles from the db
	app.get("/articles", function(req, res) {
		console.log("Get All Articles");
		db.Article.find({})
		.then(function(dbArticle) {
	    	res.json(dbArticle);
	  	});
	});

	// Initial or Home button
	app.get("/", function(req, res) {
		console.log("GET: Home");
		db.Article.find({})
		.then(function(dbArticle) {
	    	res.render('index', {articles: dbArticle});
	  	});
	});
};

module.exports = newsRoutes;


