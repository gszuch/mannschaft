function uploadGet(req, res) {
    if (typeof req.session.user !== 'undefined') {

        res.render('upload', {
            title: 'Upload File',
            containerName: 'upload-form',
            hasHeader: true,
            hasHeaderUpload: false,

            // breadcrumbs should be converted to something
            // more modular, perhaps a module?
            hasHeaderBreadcrumbs: true,
            breadcrumbsPath: '/file-manager',
            breadcrumbsText: 'File Manager',

            hasTitleRowBorder: true,
            footerBorder: true,
            hasLogout: true
        });
    }
    else {
        res.redirect('/');
    }
}

function uploadPost(RandomID, client, fs, req, res) {
    // Upload file form

    console.log("User attempted to upload file...");
	
	// Just for testing
	var d = new Date();
	var month = d.getMonth() + 1;
	var testDate = month + "/" + d.getDate() + "/" + d.getFullYear();
	var id = RandomID(10, "0");

	fs.readFile(req.file.path, 'utf8', function(err, contents) {
		var fileContents = contents;
    	var fileActual = req.file.originalname;
    	var fileName = req.body.name;
    	var fileAuthor = req.body.author;
    	var fileDescription = req.body.description;
		var fileStatus;
		
		// Assemble object to add to Solr
		var testObj = {
			id: id, 
			title : fileName,
			actual : fileActual, 
			author: fileAuthor,
			description : fileDescription,
			contents : fileContents,
			date: testDate
		};

		console.log(testObj);

		// Update Solr
		
		client.update(testObj, function(err, result) {
			if (err) {
				console.log(err);
				console.log("Document could not be added!");
			}
			else {
				console.log("Document added to Solr!");
			}
			console.log("Response: ", result.responseHeader);
		});
		
		res.redirect('/file-manager');
	});
}
module.exports = {
    uploadGet: uploadGet,
    uploadPost: uploadPost
}