/**
 * 
 * @param {*} client 
 * @param {*} req 
 * @param {*} res 
 */
function uploadBranchGet(client, req, res) {
	if (typeof req.session.user !== 'undefined') {
		
		// Search for Solr Document Title based on URL ID
		var query = "id:" + req.query.id;
		var searchTerm = client.query().q(query);
		client.search(searchTerm, function (err, results) {
			if (err) {
					console.log(err);
					return;
			}

			var fileName = results.response.docs[0].title;
			
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
 * @param {*} client 
 * @param {*} fs 
 * @param {*} req 
 * @param {*} res 
 */
function uploadBranchPost(client, fs, req, res) {
	
	var d = new Date();
	var month = d.getMonth() + 1;
	var testDate = month + "/" + d.getDate() + "/" + d.getFullYear();
	var id = Date.now();

	fs.readFile(req.file.path, 'utf8', function(err, contents) {
		var fileContents = contents;
    	var fileActual = req.file.originalname;
    	var fileName = req.body.name;
    	var fileAuthor = req.body.author;
		var fileDescription = req.body.description;
		
		// Document ID of parent doc
		var branchID = req.body.docID;
		var fileStatus;
		
		// Assemble object to add to Solr
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

		// Update Solr
		client.update(testObj, function(err, result) {
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