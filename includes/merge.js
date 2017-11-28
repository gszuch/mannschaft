/**
 * 
 * @param {object} client 
 * @param {object} req 
 * @param {object} res 
 */
function mergePost(client, req, res) {

	const mainContents = "";
	const query = "";

	// Assemble the solr search query 
	for (const i = 0; i < req.body.merge.length; i++) {

		if (i == 0) {
			query += "id:" + req.body.merge[i];
		}
		else {
			query += " OR id:" + req.body.merge[i];
		}

	}

	const mergedContents = "";
	const mergedDescription = "";
	const mergedAuthor = "";

	const searchTerm = client.query().q(query);

	client.search(searchTerm, function (err, results) {
		if (err) {
			console.log(err);
			return;
		}
		else {

			for (const i = 0; i < results.response.docs.length; i++) {
				mergedContents += results.response.docs[i].contents + "\n\n";
				mergedDescription += results.response.docs[i].description + "\n\n";
				if (i == 0) {
					mergedAuthor += results.response.docs[i].author;
				}
				else {
					mergedAuthor += " & " + results.response.docs[i].author;
				}
			}

			const d = new Date();
			const month = d.getMonth() + 1;
			const testDate = month + "/" + d.getDate() + "/" + d.getFullYear();

			const id = Date.now();
			const fileName = req.body.newTitle;
			const fileActual = req.body.newTitle + ".txt";
			const fileAuthor = mergedAuthor;
			const fileDescription = mergedDescription;
			const fileContents = mergedContents;
			const branchID = 0;

			const testObj = {
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