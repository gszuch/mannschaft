/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
function uploadGet(req, res) {
    if (typeof req.session.user !== 'undefined') {

        res.render('upload', {
            title: 'Upload File',
            containerName: 'upload-form',
            hasHeader: true,
            hasHeaderUpload: false,

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

/**
 * 
 * @param {*} RandomID 
 * @param {*} client 
 * @param {*} fs 
 * @param {*} req 
 * @param {*} res 
 */
function uploadPost(RandomID, client, fs, req, res) {
    // Upload file form
	
	if (typeof req.file !== 'undefined') {
		
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
			var branchID = 0;
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

			// Getting file size
			var stats = fs.statSync(req.file.path);
			var fileSize = stats.size;

			if (fileSize <= 999999999) {

				if (req.body.name == "" || req.body.author == "" || req.body.description == "") {
					// If any field empty trigger error
					res.render('upload', {
						title: 'Upload File',
						containerName: 'upload-form',
						hasHeader: true,
						hasHeaderUpload: false,
			
						hasHeaderBreadcrumbs: true,
						breadcrumbsPath: '/file-manager',
						breadcrumbsText: 'File Manager',
			
						showError: true,
						errorDefinition: "Form error, please try again.",
						hasTitleRowBorder: true,
						footerBorder: true,
						hasLogout: true
					});
				}
				else {
					// Uploads file to solr
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
			} 
			else {
				
				res.render('upload', {
					title: 'Upload File',
					containerName: 'upload-form',
					hasHeader: true,
					hasHeaderUpload: false,
		
					hasHeaderBreadcrumbs: true,
					breadcrumbsPath: '/file-manager',
					breadcrumbsText: 'File Manager',
		
					showError: true,
					errorDefinition: "File too large.",
					hasTitleRowBorder: true,
					footerBorder: true,
					hasLogout: true
				});
			}
			
			fs.unlinkSync(req.file.path);
		});
	}
	else {
		console.log("User tried to not upload file");
		res.render('upload', {
            title: 'Upload File',
            containerName: 'upload-form',
            hasHeader: true,
            hasHeaderUpload: false,

            hasHeaderBreadcrumbs: true,
            breadcrumbsPath: '/file-manager',
            breadcrumbsText: 'File Manager',

			showError: true,
            hasTitleRowBorder: true,
            footerBorder: true,
            hasLogout: true
        });
	}
}
module.exports = {
    uploadGet: uploadGet,
    uploadPost: uploadPost
}