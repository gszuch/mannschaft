/**
 * 
 * @param {*} req 
 * @param {*} res 
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
    else {
        res.redirect('/');
    }
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
function createPost(req,res) {

	// Just for testing
	var d = new Date();
	var month = d.getMonth() + 1;
	var testDate = month + "/" + d.getDate() + "/" + d.getFullYear();
	var id = RandomID(10, "0");

	// Get form info
	var fileContents = req.body.contents;
	var fileActual = req.body.name;
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
}

module.exports = {
    createGet: createGet,
    createPost: createPost
}