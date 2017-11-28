/**
 * 
 * @param {object} req 
 * @param {object} res 
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
 * @param {object} client 
 * @param {object} fs 
 * @param {object} req 
 * @param {object} res 
 */
function uploadPost(client, fs, req, res) {
	// Upload file form

	if (typeof req.file !== 'undefined') {

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
			const branchID = 0;
			const fileStatus;

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

			// Getting file size
			const stats = fs.statSync(req.file.path);
			const fileSize = stats.size;

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