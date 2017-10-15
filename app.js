// install plugins
const Express = require('express');
const Rollbar = require('rollbar');
const bodyParser = require("body-parser");
var session = require("client-sessions");

// initialize plugins
const app = Express();
const rollbar = new Rollbar("e23f0a58640f4d118026e1dddc31b822");

// set up handlebars view engine
let handlebars = require('express-handlebars')
	.create({ 
		defaultLayout:'main',
		partialsDir: 'views/partials/'
	});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3000);

app.use(Express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
	cookieName: 'session',
	secret: 'ce6NDZCA5Id87XupozbxH6Y3FtkO4a8u',
	duration: 60 * 60 * 1000,
	activeDuration: 10 * 60 * 1000
}));

// primary views and relevant routes / aliases
app.get(['/','/login'], function(req,res){
	//if(req.path!=='/login')
	//	res.redirect(302,'/login');

	if (typeof req.session.user !== 'undefined') {
		//console.log("Session exists");
		res.redirect('/file-manager');
	}
	else {
		console.log("Session does not exist");
		
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

		res.render('login', {
			containerName: 'login',
			showError: showError
		})
	}

});

app.get('/file-manager', function(req,res){
	// If session established
	if (typeof req.session.user !== 'undefined') {
		res.render('file-manager',{
			title: 'File Manager',
			hasHeader: true,
			hasHeaderUpload: true,
			footerBorder: true
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
			footerBorder: true
		});
	}
	else {
		res.redirect('/');
	}
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

			footerBorder: true
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

			footerBorder: true
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
			footerBorder: true
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
	rollbar.log(
		'full url requested: ' + 
		req.protocol + '://' + req.get('host') + req.originalUrl
	);
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
