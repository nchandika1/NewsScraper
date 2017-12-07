var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var ArticleSchema = new Schema({
	title: String,
	url: String,
	byLine: String,
	byLineUrl: String,
	created: Date,
	excerpt: String,
	saved: Boolean,
	notes: [
	    {
	      // Store ObjectIds in the array
	      type: Schema.Types.ObjectId,
	      // The ObjectIds will refer to the ids in the Note model
	      ref: "Note"
	    }
  	]
});

var Article = mongoose.model("Article", ArticleSchema);

module.exports = Article;