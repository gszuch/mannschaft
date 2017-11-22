// node modules
const Express = require('express');
const Rollbar = require('rollbar');
const Path = require('path');
const BodyParser = require("body-parser");
const Session = require("client-sessions");
const SolrNode = require("solr-node");
const fs = require("fs");
const Multer = require("multer");
const FileUpload = require("express-handlebars");
const RandomID = require("random-id");

// initialize plugins
const app = Express();
const rollbar = new Rollbar("e23f0a58640f4d118026e1dddc31b822");

// Connecting to Solr
var client = new SolrNode({
    host: '127.0.0.1',
    protocol: 'http',
	core: 'mannschaft-3',
	port: '8983'
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
		layoutsDir: 'views/layouts/',
		helpers: require("./public/js/helpers.js").helpers
	});

app.engine('hbs', Hbs.engine);
app.set('view engine', 'hbs');

app.set('port', process.env.PORT || 3000);

//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(Express.static(Path.join(__dirname + '/public')));
app.use('/document', Express.static(__dirname + '/public'));
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));
app.use(Session({
	cookieName: 'session',
	secret: 'ce6NDZCA5Id87XupozbxH6Y3FtkO4a8u',
	duration: cookieSessionMath.duration,
	activeDuration: cookieSessionMath.activeDuration
}));

// primary views and relevant routes / aliases
var login = require('./includes/login.js');
app.get(['/','/login'], function(req,res){
	login.loginGet(req,res);
});

app.post(['/','/login'], function(req, res) {
	login.loginPost(req,res);
});

// File Manager
var fileManager = require('./includes/fileManager.js');
app.get('/file-manager', function(req,res){
	console.log("FM Request: " + req.session.user.author);
	console.log("Date: " + Date.now());
	fileManager.fileManagerGet(client, req, res);
});


// Searching the File Manager
app.post('/file-manager', function(req,res) {

	console.log("User wants to search the file manager...");
	console.log("Search Term: " + req.body.searchTerm);
	 if (typeof req.session.user !== 'undefined') {

        // Pull from solr
        console.log("Retrieving records from Solr...");
		var term = "*" + req.body.searchTerm + "*";
        var searchTerm = client.query().q(term);
        client.search(searchTerm, function (err, results) {
            if (err) {
                console.log(err);
                return;
            }

            // Check to see if any docs or empty
            var resultDocs = "";
            if (typeof results.response.docs !== 'undefined') {
               resultDocs = results.response.docs;
            }

			console.log("Search Value: " + req.body.searchTerm);

            res.render('file-manager', {
                title: 'Search Results',
                hasHeader: true,
				hasHeaderUpload: true,
				hasHeaderBreadcrumbs: true,
				searchValue: req.body.searchTerm,
				breadcrumbsPath: '/file-manager',
				breadcrumbsText: 'File Manager',
                footerBorder: true,
                hasLogout: true,
                docs: resultDocs
            });
        });

    }
    else {
        res.redirect('/');
    };
});

// Upload
var uploadLogic = require('./includes/upload.js');
app.get('/upload', function(req,res){
	uploadLogic.uploadGet(req, res);
});

app.post('/upload', upload.single("uploadedFile"), function(req, res) {
	uploadLogic.uploadPost(RandomID, client, fs, req, res);
});

// Upload to Branch
app.get('/upload-branch', function(req, res) {

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

				// breadcrumbs should be converted to something
				// more modular, perhaps a module?
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

});

app.post("/upload-branch", upload.single("uploadedFile"), function(req, res) {
	// Just for testing
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
				
			res.redirect('/file-manager');
		});
		
	});
	
});
// Document
var documentLogic = require("./includes/document.js");
app.get("/document/:docID", function(req,res) {
	console.log("D Request: " + req.session.user.author);
	documentLogic.documentGet(client, req, res);
});

// File Download
app.get('/file/:docID', function(req,res) {
	if (typeof req.session.user !== 'undefined') {

		console.log("ID: " + req.params.docID);
		var query = "id:" + req.params.docID;
		var searchTerm = client.query().q(query);
		client.search(searchTerm, function (err, results) {
			if (err) {
					console.log(err);
					return;
			}

			var fileName = results.response.docs[0].title;
			var file =  results.response.docs[0].contents[0];
			console.log("Download: " + file);
			//fileName = fileName.replace(/[#@!$^%*&()=~`'"{|}]/g, "");
			fileName += ".txt";
			res.setHeader('Content-type', "application/octet-stream");
			res.setHeader('Content-disposition', 'attachment; filename=' + fileName);
			res.send(file);

		});
	}
	else {
		res.redirect('/');
	}


});

// Create Text File for Solr Entry
var createLogic = require('./includes/create.js');
app.get('/create', function(req, res) {
	createLogic.createGet(req, res);
});

app.post('/create', function(req, res) {
	createLogic.createPost(req, res);
});

// Branch Type
var branchLogic = require('./includes/branch.js');
app.get('/branch-type', function(req,res){
	branchLogic.branchGet(req, res);
});

// Edit
var editLogic = require('./includes/edit.js');
app.get('/edit', function(req,res){
	editLogic.editGet(req, res);
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
