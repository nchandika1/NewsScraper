/*
 * Client side JS funtionality
 */

// Click function for Home Button
function onClickHomeBtn() {
	console.log("onClickHomeBtn");
}

// Click function for Saved Entries Button
function onSavedEntriesBtn() {
	console.log("onSavedEntriesBtn");
	$.get("/saved", function(data) {
		console.log(data);
	});
}

// Click function for Scrape New Entries Button
function onScrapeNewEntries() {
	event.preventDefault();
	console.log("onScrapeNewEntries");
	event.pre
	$.get("/scrape", function(data) {
		console.log(data);
	});
}

// Grab the articles as a json
// $.getJSON("/articles", function(data) {
// 	console.log(data);
// 	$("#articles").empty();
// 	for (var i = 0; i < data.length; i++) {
// 		$("#articles").append("<a href=" + data[i].url + " target=\"_blank\" style=\"font-weight:bold;\">" + data[i].title + "</a>");
// 		$("#articles").append("<h6>" + data[i].byLine + "</h6>");
// 		$("#articles").append("<h6>" + data[i].created + "</h6>")
// 		$("#articles").append("<p>" + data[i].excerpt + "</p>");
// 		var btnDiv = $("<button>");
// 		btnDiv.attr("class", "save-article");
// 		btnDiv.attr("data-id", data[i]._id);
// 		btnDiv.text("Save Article");
// 		$("#articles").append(btnDiv);
// 		$("#articles").append("<hr>");
// 	}
// });


// Execute the following when the DOM is ready
$(function() {

	// Initiate click functions for the menu items
	$(document).on("click", "#home", onClickHomeBtn);
	// $(document).on("click", "#saved", onSavedEntriesBtn);
	$(document).on("click", "#new-scrape", onScrapeNewEntries);

	// Click handler to Save Article button
	$(document).on("click", ".save-article", function() {
		var id = $(this).attr("data-id");
		console.log("Save an Article: " + id);
		$.ajax({
			url: "/save/" + id,
			method: "POST"
		}).done(function(data) {
			console.log(data);
		});
	});	

	// Click handler for Delete Saved Article button
	$(document).on("click", ".delete-article", function() {
		var id = $(this).attr("data-id");
		console.log("Delete an Article: " + id);
		$.ajax({
			url: "/delete/" + id,
			method: "POST"
		}).done(function(data) {
			console.log("REload");
			location.reload();
		});
	});	
});