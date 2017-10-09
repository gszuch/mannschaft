// install plugins
const Express = require('express');
const Rollbar = require('rollbar');

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

// primary views and relevant routes / aliases
app.get(['/','/login'], function(req,res){
	if(req.path!=='/login')
		res.redirect(302,'/login');

	let showError = false;
	if(req.query.q==='showError')
		showError = true;

	res.render('login',{
		containerName: 'login',
		showError: showError
	});
});

app.get('/file-manager', function(req,res){
	res.render('file-manager',{
		title: 'File Manager',
		hasHeader: true,
		hasHeaderUpload: true,
		footerBorder: true
	});
});

app.get('/upload', function(req,res){
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
	})
});

app.get('/document', function(req,res){
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
	})
});

app.get('/branch-type', function(req,res){
	res.render('branch-type',{
		title: 'Branch File',
		hasHeader: true,
		
		hasHeaderBreadcrumbs: true,
		breadcrumbsPath: '/file-manager',
		breadcrumbsText: 'File Manager',

		footerBorder: true
	})
});

app.get('/edit', function(req,res){
	res.render('edit',{
		title: 'Edit File',
		containerName: 'upload-form',
		hasHeader: true,

		hasHeaderBreadcrumbs: true,
		breadcrumbsPath: '/file-manager',
		breadcrumbsText: 'File Manager',

		hasTitleRowBorder: true,
		footerBorder: true
	})
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
