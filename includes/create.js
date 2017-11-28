/**
 * 
 * @param {object} req 
 * @param {object} res 
 */
function createGet(req, res) {

	if (typeof req.session.user !== 'undefined') {
		res.render('create-text-file', {
			title: 'Create File',
			containerName: 'create-form',
			hasHeader: true,
			hasHeaderUpload: false,

			hasHeaderBreadcrumbs: true,
			breadcrumbsPath: '/create',
			breadcrumbsText: 'Create File',

			hasTitleRowBorder: true,
			footerBorder: true,
			hasLogout: true
		});
	}
	else res.redirect('/');
}

/**
 * 
 * @param {object} req 
 * @param {object} res 
 */
function createPost(req, res) {

	// Just for testing
	const d = new Date();
	const month = d.getMonth() + 1;
	const testDate = month + "/" + d.getDate() + "/" + d.getFullYear();
	const id = RandomID(10, "0");

	// Get form info
	const fileContents = req.body.contents;
	const fileActual = req.body.name;
	const fileName = req.body.name;
	const fileAuthor = req.body.author;
	const fileDescription = req.body.description;
	const fileStatus;

	// Assemble object to add to Solr
	const testObj = {
		id: id,
		title: fileName,
		actual: fileActual,
		author: fileAuthor,
		description: fileDescription,
		contents: fileContents,
		date: testDate
	};

	console.log(testObj);

	// Update Solr
	client.update(testObj, function (err, result) {
		if (err) {
			console.log(err);
			console.log("Document could not be added!");
		}
		else console.log("Document added to Solr!");

		console.log("Response: ", result.responseHeader);
	});

	res.redirect('/file-manager');
}

module.exports = {
	createGet: createGet,
	createPost: createPost
}