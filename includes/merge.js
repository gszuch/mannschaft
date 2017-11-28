function mergePost(client, req, res) {
	
	var mainContents = "";
	var query = "";

	// Assemble the solr search query 
	for (var i = 0; i < req.body.merge.length; i++) {
	
		if (i == 0) {
			query += "id:" + req.body.merge[i];
		}
		else {
			query += " OR id:" + req.body.merge[i];
		}

	}

	var mergedContents = "";
	var mergedDescription = "";
	var mergedAuthor = "";

	var searchTerm = client.query().q(query);

    client.search(searchTerm, function (err, results) {
        if (err) {
            console.log(err);
            return;
        }
		else {

			for (var i = 0; i < results.response.docs.length; i++) {
				mergedContents += results.response.docs[i].contents + "\n\n";
				mergedDescription += results.response.docs[i].description + "\n\n";
				if (i == 0) {
					mergedAuthor += results.response.docs[i].author;
				}
				else {
					mergedAuthor += " & " + results.response.docs[i].author;
				}
			}

			var d = new Date();
			var month = d.getMonth() + 1;
			var testDate = month + "/" + d.getDate() + "/" + d.getFullYear();

			var id = Date.now();
			var fileName = req.body.newTitle;
			var fileActual = req.body.newTitle + ".txt";
			var fileAuthor = mergedAuthor;
			var fileDescription = mergedDescription;
			var fileContents = mergedContents;
			var branchID = 0;

			var testObj = {
				id: id, 
				title : fileName,
				actual : fileActual, 
				author: fileAuthor,
				description : fileDescription,
				contents : fileContents,
				date: testDate,
				branchID: branchID
			};
			
			client.update(testObj, function(err, result) {
				if (err) {
					console.log(err);
					console.log("Document could not be added!");
				}
				else {
					console.log("Document added to Solr!");
				}
				console.log("Response: ", result.responseHeader);
					
				res.redirect('/file-manager');
			});
		}
	});

}

module.exports = {
    mergePost: mergePost
}