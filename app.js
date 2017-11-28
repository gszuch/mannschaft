// node modules
const Express = require('express');
const Rollbar = require('rollbar');
const Path = require('path');
const BodyParser = require("body-parser");
const Session = require("client-sessions");
const SolrNode = require("./lib/solr-node");
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
	core: 'mannschaft',
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
	fileManager.fileManagerGet(client, req, res);
});

// Searching the File Manager
app.post('/file-manager', function(req,res) {
	fileManager.fileManagerPost(client, req, res);
});

// Merge
var mergeLogic = require("./includes/merge.js");
app.post("/merge", function(req, res) {
	mergeLogic.mergePost(client, req, res);
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
var uploadBranchLogic = require("./includes/uploadBranch.js")
app.get('/upload-branch', function(req, res) {
	uploadBranchLogic.uploadBranchGet(client, req, res);
});

app.post("/upload-branch", upload.single("uploadedFile"), function(req, res) {
	//console.log("File before logic call: " + req.file);
	uploadBranchLogic.uploadBranchPost(client, fs, req, res);
});

// Document
var documentLogic = require("./includes/document.js");
app.get("/document/:docID", function(req,res) {
	documentLogic.documentGet(client, req, res);
});

// File Download
var fileLogic = require("./includes/file.js");
app.get('/file/:docID', function(req,res) {
	fileLogic.fileGet(client, req, res);
});

// Create Text File for Solr Entry
var createLogic = require('./includes/create.js');
app.get('/create', function(req, res) {
	createLogic.createGet(req, res);
});

app.post('/create', function(req, res) {
	createLogic.createPost(req, res);
});

// Branch Type - DONT REMOVE
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