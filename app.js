// node modules
const Express = require('express');
const Rollbar = require('rollbar');
const BodyParser = require("body-parser");
const Session = require("client-sessions");
const SolrNode = require("solr-node");
const fs = require("fs");
const Multer = require("multer");
const FileUpload = require("express-handlebars");

// initialize plugins
const app = Express();
const rollbar = new Rollbar("e23f0a58640f4d118026e1dddc31b822");

// Connecting to Solr
const client = new SolrNode ({
	host: '52.171.129.65',
	port: '8983',
	core: 'testCore',
	protocol: 'http'
});

// Direct file uploads
const upload = Multer({ dest: 'uploads/'});

// define constants
const cookieSessionMath = {
	base: 60 * 1000,
	duration: this.base * 60,
	activeDuration: this.base * 10
}

// set up handlebars view engine
const Hbs = require('express-handlebars')
	.create({ 
		extname: '.hbs',
		defaultLayout: 'main',
		partialsDir: 'views/partials/',
		layoutsDir: 'views/layouts/'
	});
app.engine('hbs', Hbs.engine);
app.set('view engine', 'hbs');

app.set('port', process.env.PORT || 3000);

app.use(Express.static(__dirname + '/public'));
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));
app.use(Session({
	cookieName: 'session',
	secret: 'ce6NDZCA5Id87XupozbxH6Y3FtkO4a8u',
	duration: cookieSessionMath.duration,
	activeDuration: cookieSessionMath.activeDuration
}));

// primary views and relevant routes / aliases
app.get(['/','/login'], function(req,res){

	rollbar.reportMessage("Visited homepage");

	if (typeof req.session.user !== 'undefined') {
		// Session exists, redirect to file manager
		res.redirect('/file-manager');
	}
	else {
		// Session does not exist, show login
		
		let showError = false;
		if(req.query.q==='showError')
			showError = true;
	
		res.render('login',{
			containerName: 'login',
			showError: showError
		});
	}
		
});

app.post(['/','/login'], function(req, res) {

	let showError = false;
	let errorDefinition = false;

	// Set main user information
	let username = "mannschaft";
	let password = "eins";
	let author = "John Doe";
	
	if (req.body.username == username && req.body.password == password) {

		// Setup user object to store in session
		var user = { name: username, author: author };
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

});

app.get('/file-manager', function(req,res){
	// If session established
	if (typeof req.session.user !== 'undefined') {

		// Pull from solr
		console.log("Retrieving records from Solr...");

		var searchTerm = client.query().q('*:*');
		client.search(searchTerm, function (err, results) {
			if (err) {
				console.log(err);
				return;
			}
			console.log('Response: ', results.response);
			
			res.render('file-manager',{
				title: 'File Manager',
				hasHeader: true,
				hasHeaderUpload: true,
				footerBorder: true,
				hasLogout: true,
				docs: results.response.docs
			});
		});

	}
	else {
		res.redirect('/');
	}
});

app.get('/upload', function(req,res){
	if (typeof req.session.user !== 'undefined') {

		res.render('upload',{
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
});

app.post('/upload', upload.single("uploadedFile"), function(req, res) {
	// Upload file form

	console.log("User attempted to upload file...");
	console.log(req.file.originalname);
	
	// Just for testing
	var d = new Date();
	var month = d.getMonth() + 1;
	var testDate = month + "/" + d.getDate() + "/" + d.getFullYear();

	fs.readFile(req.file.path, 'utf8', function(err, contents) {
		var fileContents = contents;
    	var fileActual = req.file.originalname;
    	var fileName = req.body.name;
    	var fileAuthor = req.body.author;
    	var fileDescription = req.body.description;
		var fileStatus;
		
		// Assemble object to add to Solr
		var testObj = {
			name : fileName,
			actual : fileActual, 
			author: fileAuthor,
			description : fileDescription,
			contents : fileContents,
			date: testDate
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
			console.log("Response: ", result.responseHeader);
		});

		res.redirect('/file-manager');
	});
});

app.get('/document', function(req,res){
	if (typeof req.session.user !== 'undefined') {
		res.render('document',{
			// replace w/ dynamic document name from querystring
			title: 'HelloWorld.txt',
			// replace w/ dynamic document description
			subtitle: 'A file with basic text',
			hasHeader: true,
			
			hasHeaderBreadcrumbs: true,
			breadcrumbsPath: '/file-manager',
			breadcrumbsText: 'File Manager',

			hasHeaderDownload: true,
			fileSize: '7kb',
			uploadDate: '9/9/17',
			uploadTime: '10:10 AM',

			footerBorder: true,
			hasLogout: true
		});
	}
	else {
		res.redirect('/');
	}
});

app.get('/branch-type', function(req,res){
	if (typeof req.session.user !== 'undefined') {
		res.render('branch-type',{
			title: 'Branch File',
			hasHeader: true,
			
			hasHeaderBreadcrumbs: true,
			breadcrumbsPath: '/file-manager',
			breadcrumbsText: 'File Manager',

			footerBorder: true,
			hasLogout: true
		});
	}
	else {
		res.redirect('/');
	}
});

app.get('/edit', function(req,res){
	if (typeof req.session.user !== 'undefined') {
		res.render('edit',{
			title: 'Edit File',
			containerName: 'upload-form',
			hasHeader: true,

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
});

// Logout
app.get('/logout', function(req, res) {
	req.session.reset();
	res.redirect('/');
});

// 404 catch-all handler (middleware)
app.use(function(req, res, next){
	res.status(404);
	res.render('404');
});

// 500 error handler (middleware)
app.use(function(err, req, res, next){
	console.error(err.stack);
	res.status(500);
	res.render('500');
	rollbar.log('err.stack: ' + err.stack);
});

app.listen(app.get('port'), function(){
  console.log( 'Express started on http://localhost:' +
    app.get('port') + '; press Ctrl-C to terminate.' );
});
