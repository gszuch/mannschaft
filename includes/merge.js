/**
 * 
 * @param {object} client 
 * @param {object} req 
 * @param {object} res 
 */
function mergePost(client, req, res) {

	let mainContents = "";
	let query = "";

	// Assemble the solr search query 
	for (let i = 0; i < req.body.merge.length; i++) {

		if (i == 0) {
			query += "id:" + req.body.merge[i];
		}
		else {
			query += " OR id:" + req.body.merge[i];
		}

	}

	let mergedContents = "";
	let mergedDescription = "";
	let mergedAuthor = "";

	let searchTerm = client.query().q(query);

	client.search(searchTerm, function (err, results) {
		if (err) {
			console.log(err);
			return;
		}
		else {

			for (let i = 0; i < results.response.docs.length; i++) {
				mergedContents += results.response.docs[i].contents + "\n\n";
				mergedDescription += results.response.docs[i].description + "\n\n";
				if (i == 0) {
					mergedAuthor += results.response.docs[i].author;
				}
				else {
					mergedAuthor += " & " + results.response.docs[i].author;
				}
			}

			let d = new Date();
			let month = d.getMonth() + 1;
			let testDate = month + "/" + d.getDate() + "/" + d.getFullYear();

			let id = Date.now();
			let fileName = req.body.newTitle;
			let fileActual = req.body.newTitle + ".txt";
			let fileAuthor = mergedAuthor;
			let fileDescription = mergedDescription;
			let fileContents = mergedContents;
			let branchID = 0;

			let testObj = {
				id: id,
				title: fileName,
				actual: fileActual,
				author: fileAuthor,
				description: fileDescription,
				contents: fileContents,
				date: testDate,
				branchID: branchID
			};

			client.update(testObj, function (err, result) {
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