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

	// Add a new note to the Note db
	// Also add a reference in Article db
	app.post("/addnote/:id", function(req, res) {
		var id = req.params.id;
		var body = req.body;
		console.log("Post new Note: " + id);
		console.log(body);
		db.Note
		.create(body)
		.then(function(dbNote) {
			return db.Article.findOneAndUpdate({"_id": req.params.id}, { $push: { notes: dbNote._id } }, { new: true });
		});
	});

	// Delete a note from the Note db
	// Also remove its reference from Article db
	app.post("/delete-note/:id", function(req, res) {
		var id = req.params.id;
		console.log("Deleting Notes for  Id: " + id);
		db.Note
		.findOneAndRemove({_id: req.params.id})
		.then(function(dbNote) {
			return db.Article.findOneAndUpdate({"_id": req.body.id}, { $pull: { notes: req.params.id } }, { new: true });
		});
	});
		
	// Retrieve all notes for display for a given article	
	app.get("/notes/:id", function(req, res) {
		var id = req.params.id;
		console.log("Get all notes: " + id);
		db.Article
		.findOne({"_id": req.params.id})
		.populate("notes")
		.then(function(data) {
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

					// With "upsert" set to "true" it will only insert if the entry does not already
					// exist!
					db.Article
					.findOneAndUpdate(scrapeObj, scrapeObj, {upsert: true})
					.then(function(err, data) {
						console.log("DONE");
						if (err) {
							// Gives out error for duplicate entries, which is ok
							// we don't have duplicates
							// console.log("Insert Error: " + err);
							res.send("Scrape Complete");
						} else {
							res.send("Scrape Complete");
						}
					});

					count++;
				}
				// We only want to scrape 20 articles.
				if (count >= MAX_ARTICLES) {
					return false;
				}
			}); // each div
		});// request
	});

	// Save an article.  Set the "saved" field to true
	app.post("/save/:id", function(req, res) {
		console.log("POST Save Article: " + req.params.id);
		db.Article
		.findOneAndUpdate({"_id":req.params.id},{saved: true}, {new: true})
		.then(function(data) {
			res.json(data);
		});
	});

	// Delete an article from saved list.
	app.post("/delete/:id", function(req, res) {
		console.log("POST Delete Saved Article: " + req.params.id);

		// Just toggle the saved field of the entry in the database
		db.Article
		.findOneAndUpdate({"_id":req.params.id},{saved: false, notes: []}, {new: false})
		.then(function(data) {
			for (var i=0; i<data.notes.length; i++) {
				console.log(data.notes[i]);
				db.Note
				.findByIdAndRemove(data.notes[i])
				.then(function(data) {
					console.log("Deleted Notes");
				});
			}
			res.json(data);
		});
	});

	// Retrieve saved articles
	app.get("/saved", function(req, res) {
		console.log("Get all Saved articles");
		db.Article
		.find({saved: true})
		.then(function(dbSaved) {
			res.render('saved', {articles: dbSaved});
		});
	});

	// Route for getting all Articles from the db
	app.get("/articles", function(req, res) {
		console.log("Get All Articles");
		db.Article
		.find({})
		.then(function(dbArticle) {
	    	res.json(dbArticle);
	  	});
	});

	// Initial loading page or Home button
	app.get("/", function(req, res) {
		console.log("GET: Home");
		db.Article
		.find({})
		.then(function(dbArticle) {
			if (dbArticle.length) {
	    		res.render('index', {articles: dbArticle, contentPresent: true});
	    	} else {
	    		res.render('index', {articles: [], contentPresent: false});
	    	}

	  	});
	});
};

module.exports = newsRoutes;


