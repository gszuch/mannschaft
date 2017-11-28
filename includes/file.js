/**
 * 
 * @param {*} client 
 * @param {*} req 
 * @param {*} res 
 */
function fileGet(client, req, res) {

    if (typeof req.session.user !== 'undefined') {

		var query = "id:" + req.params.docID;
		var searchTerm = client.query().q(query);

		client.search(searchTerm, function (err, results) {
			if (err) {
					console.log(err);
					return;
			}

			var fileName = results.response.docs[0].title;
			var file =  results.response.docs[0].contents[0];
			
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