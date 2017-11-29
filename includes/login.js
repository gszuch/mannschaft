/**
 * 
 * @param {object} req 
 * @param {object} res 
 */
function loginGet(req, res) {

	if (typeof req.session.user !== 'undefined') {
		// Session exists, redirect to file manager
		res.redirect('/file-manager');
	}
	else {
		// Session does not exist, show login
		let showError = false;
		if (req.query.q === 'showError')
			showError = true;

		res.render('login', {
			containerName: 'login',
			showError: showError
		});
	}
}

/**
 * 
 * @param {object} req 
 * @param {object} res 
 */
function loginPost(req, res) {
	let showError = false;
	let errorDefinition = false;

	// Set main user information
	let username = "mannschaft";
	let password = "eins";
	let author = "John Doe";

	if (req.body.username == username && req.body.password == password) {

		// Setup user object to store in session
		const user = { name: username, author: author };
		req.session.user = user;

		res.redirect('/file-manager');
	}
	else {

		showError = true;

		if (req.body.username == "" && req.body.password == "") {
			// Both fields are empty
			errorDefinition = "Error! Please fill out both fields.";
		}
		else if (req.body.username == "") {
			// Empty username
			errorDefinition = "Error! Please enter a username.";
		}
		else if (req.body.password == "") {
			// Empty password 
			errorDefinition = "Error! Please enter a password.";
		}
		else if (req.body.username != username || req.body.password != password) {
			// Login Credentials are wrong
			errorDefinition = "Error! Wrong login information.";
		}
		else {
			// Unknown error
			errorDefinition = "Error! Try again.";
		}

		res.render('login', {
			containerName: 'login',
			showError: showError,
			errorDefinition: errorDefinition,
			hasLogout: false
		})
	}

}

module.exports = {
	loginGet: loginGet,
	loginPost: loginPost
}