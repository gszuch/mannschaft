/**
 * 
 * @param {object} client 
 * @param {object} req 
 * @param {object} res 
 */
function fileGet(client, req, res) {

	if (typeof req.session.user !== 'undefined') {

		const query = "id:" + req.params.docID;
		const searchTerm = client.query().q(query);

		client.search(searchTerm, function (err, results) {
			if (err) {
				console.log(err);
				return;
			}

			let fileName = results.response.docs[0].title;
			let file = results.response.docs[0].contents[0];

			fileName += ".txt";
			res.setHeader('Content-type', "application/octet-stream");
			res.setHeader('Content-disposition', 'attachment; filename=' + fileName);
			res.send(file);

		});

	}
	else {
		res.redirect('/');
	}
}

module.exports = {
	fileGet: fileGet
}