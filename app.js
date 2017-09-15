// install plugins
const Express = require('express');
const Rollbar = require('rollbar');

// initialize plugins
const app = Express();
const rollbar = new Rollbar("e23f0a58640f4d118026e1dddc31b822");

// set up handlebars view engine
let handlebars = require('express-handlebars')
	.create({ defaultLayout:'main' });
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3000);

app.use(Express.static(__dirname + '/public'));

app.get('/', function(req, res) {
	res.render('home');
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
