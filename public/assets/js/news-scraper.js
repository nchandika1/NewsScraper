/*
 * Client side JS funtionality
 */

// Execute the following when the DOM is ready
$(function() {

	// Initiate click functions for Scrape Button
	$(document).on("click", "#new-scrape", function() {
		event.preventDefault();
		console.log("onScrapeNewEntries");
		$.get("/scrape", function(data) {
			console.log(data);
			location.reload();
		});
	});

	// Following two buttons are displayed next to Saved Articles
	// Click handler for Save Article button
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