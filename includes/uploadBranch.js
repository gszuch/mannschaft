/**
 * 
 * @param {object} client 
 * @param {object} req 
 * @param {object} res 
 */
function uploadBranchGet(client, req, res) {
	if (typeof req.session.user !== 'undefined') {

		// Search for Solr Document Title based on URL ID
		const query = "id:" + req.query.id;
		const searchTerm = client.query().q(query);
		client.search(searchTerm, function (err, results) {
			if (err) {
				console.log(err);
				return;
			}

			const fileName = results.response.docs[0].title;

			res.render('upload', {
				title: 'Upload File to Branch',
				containerName: 'upload-form',
				hasHeader: true,
				hasHeaderUpload: false,

				fileName: fileName,

				hasHeaderBreadcrumbs: true,
				breadcrumbsPath: '/file-manager',
				breadcrumbsText: 'File Manager',

				id: req.query.id,

				hasTitleRowBorder: true,
				footerBorder: true,
				hasLogout: true
			});
		});


	}
	else {
		res.redirect('/');
	}
}

/**
 * 
 * @param {object} client 
 * @param {object} fs 
 * @param {object} req 
 * @param {object} res 
 */
function uploadBranchPost(client, fs, req, res) {

	const d = new Date();
	const month = d.getMonth() + 1;
	const testDate = month + "/" + d.getDate() + "/" + d.getFullYear();
	const id = Date.now();

	fs.readFile(req.file.path, 'utf8', function (err, contents) {
		const fileContents = contents;
		const fileActual = req.file.originalname;
		const fileName = req.body.name;
		const fileAuthor = req.body.author;
		const fileDescription = req.body.description;

		// Document ID of parent doc
		const branchID = req.body.docID;
		//const fileStatus;

		// Assemble object to add to Solr
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

		// Update Solr
		client.update(testObj, function (err, result) {
			if (err) {
				console.log(err);
				console.log("Document could not be added!");
			}
			else {
				console.log("Document added to Solr!");
			}

			res.redirect('/file-manager');
		});

		fs.unlinkSync(req.file.path);

	});

}

module.exports = {
	uploadBranchGet: uploadBranchGet,
	uploadBranchPost: uploadBranchPost
}