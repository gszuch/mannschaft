const cookieSessionMath = {
	base: 60 * 1000,
	duration: this.base * 60,
	activeDuration: this.base * 10
}


const Express = require('express');
const Rollbar = require('rollbar');
const Path = require('path');
const BodyParser = require("body-parser");
const Session = require("client-sessions");
const fs = require("fs");
const Multer = require("multer");
const FileUpload = require("express-handlebars");
const RandomID = require("random-id");
const SolrNode = require("./lib/solr-node");


const uploadBranchLogic = require("./includes/uploadBranch.js");
const login = require('./includes/login.js');
const fileManager = require('./includes/fileManager.js');
const mergeLogic = require("./includes/merge.js");
const uploadLogic = require('./includes/upload.js');
const documentLogic = require("./includes/document.js");
const fileLogic = require("./includes/file.js");
const createLogic = require('./includes/create.js');
const branchLogic = require('./includes/branch.js');
const editLogic = require('./includes/edit.js');


const app = Express();
const rollbar = new Rollbar("e23f0a58640f4d118026e1dddc31b822");
const upload = Multer({ dest: 'uploads/' });
const Hbs = require('express-handlebars')
	.create({
		extname: '.hbs',
		defaultLayout: 'main',
		partialsDir: 'views/partials/',
		layoutsDir: 'views/layouts/',
		helpers: require("./public/js/helpers.js").helpers
	});
const client = new SolrNode({
	host: '127.0.0.1',
	protocol: 'http',
	core: 'mannschaft',
	port: '8983'
});


app.engine('hbs', Hbs.engine);
app.set('view engine', 'hbs');
app.set('port', process.env.PORT || 3000);
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


app.get('/branch-type', function (req, res) { branchLogic.branchGet(req, res); });
app.get('/create', function (req, res) { createLogic.createGet(req, res); });
app.get('/edit', function (req, res) { editLogic.editGet(req, res); });
app.get('/file-manager', function (req, res) { fileManager.fileManagerGet(client, req, res); });
app.get('/file/:docID', function (req, res) { fileLogic.fileGet(client, req, res); });
app.get('/logout', function (req, res) { req.session.reset(); res.redirect('/'); });
app.get('/upload-branch', function (req, res) { uploadBranchLogic.uploadBranchGet(client, req, res); });
app.get('/upload', function (req, res) { uploadLogic.uploadGet(req, res); });
app.get("/document/:docID", function (req, res) { documentLogic.documentGet(client, req, res); });
app.get(['/', '/login'], function (req, res) { login.loginGet(req, res); });


app.post('/create', function (req, res) { createLogic.createPost(req, res); });
app.post('/file-manager', function (req, res) { fileManager.fileManagerPost(client, req, res); });
app.post('/upload', upload.single("uploadedFile"), function (req, res) { uploadLogic.uploadPost(client, fs, req, res); });
app.post("/merge", function (req, res) { mergeLogic.mergePost(client, req, res); });
app.post("/upload-branch", upload.single("uploadedFile"), function (req, res) {
	//console.log("File before logic call: " + req.file);
	uploadBranchLogic.uploadBranchPost(client, fs, req, res);
});
app.post(['/', '/login'], function (req, res) { login.loginPost(req, res); });


app.use(function (req, res, next) { res.status(404); res.render('404'); });
app.use(function (err, req, res, next) {
	console.error(err.stack);
	res.status(500);
	res.render('500');
	rollbar.log('err.stack: ' + err.stack);
});


app.listen(app.get('port'), function () {
	console.log('Express started on http://localhost:' +
		app.get('port') + '; press Ctrl-C to terminate.');
});
