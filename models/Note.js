/*
 *  Defines the model for Notes database.  Note Article refers to this model
 *  Simple Document that stores text from the notes.
 */

var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var NoteSchema = new Schema({
	text: String
});

var Note = mongoose.model("Note", NoteSchema);

module.exports = Note;
