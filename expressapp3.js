var express = require("express");

var MongoClient = require('mongodb').MongoClient
var url = 'mongodb://localhost:27017/blogs';
assert = require('assert');

var insertBlog = function(db) {
  var collection = db.collection('documents');
  collection.insertOne({
  	title: "test",
  	author: "Seymour Butts",
  	post: "alksjdfkasjdlkjfalskdjlfkasjdkfalskdlkfajskdflaksdjlkfjaskalksjdfkasjdlkjfalskdjlfkasjdkfalskdlkfajskdflaksdjlkfjaskalksjdfkasjdlkjfalskdjlfkasjdkfalskdlkfajskdflaksdjlkfjaskalksjdfkasjdlkjfalskdjlfkasjdkfalskdlkfajskdflaksdjlkfjaskalksjdfkasjdlkjfalskdjlfkasjdkfalskdlkfajskdflaksdjlkfjaskalksjdfkasjdlkjfalskdjlfkasjdkfalskdlkfajskdflaksdjlkfjaskalksjdfkasjdlkjfalskdjlfkasjdkfalskdlkfajskdflaksdjlkfjaskalksjdfkasjdlkjfalskdjlfkasjdkfalskdlkfajskdflaksdjlkfjaskalksjdfkasjdlkjfalskdjlfkasjdkfalskdlkfajskdflaksdjlkfjaskalksjdfkasjdlkjfalskdjlfkasjdkfalskdlkfajskdflaksdjlkfjaskalksjdfkasjdlkjfalskdjlfkasjdkfalskdlkfajskdflaksdjlkfjaskalksjdfkasjdlkjfalskdjlfkasjdkfalskdlkfajskdflaksdjlkfjaskalksjdfkasjdlkjfalskdjlfkasjdkfalskdlkfajskdflaksdjlkfjaskalksjdfkasjdlkjfalskdjlfkasjdkfalskdlkfajskdflaksdjlkfjaskalksjdfkasjdlkjfalskdjlfkasjdkfalskdlkfajskdflaksdjlkfjaskalksjdfkasjdlkjfalskdjlfkasjdkfalskdlkfajskdflaksdjlkfjaskalksjdfkasjdlkjfalskdjlfkasjdkfalskdlkfajskdflaksdjlkfjaskalksjdfkasjdlkjfalskdjlfkasjdkfalskdlkfajskdflaksdjlkfjaskalksjdfkasjdlkjfalskdjlfkasjdkfalskdlkfajskdflaksdjlkfjaskalksjdfkasjdlkjfalskdjlfkasjdkfalskdlkfajskdflaksdjlkfjaskalksjdfkasjdlkjfalskdjlfkasjdkfalskdlkfajskdflaksdjlkfjaskalksjdfkasjdlkjfalskdjlfkasjdkfalskdlkfajskdflaksdjlkfjaskalksjdfkasjdlkjfalskdjlfkasjdkfalskdlkfajskdflaksdjlkfjaskalksjdfkasjdlkjfalskdjlfkasjdkfalskdlkfajskdflaksdjlkfjaskalksjdfkasjdlkjfalskdjlfkasjdkfalskdlkfajskdflaksdjlkfjaskalksjdfkasjdlkjfalskdjlfkasjdkfalskdlkfajskdflaksdjlkfjask",
  	posted: new Date()
  }).then(function(result) {
  	console.log("Blog Posted")
  })
}

MongoClient.connect(url, function(err, db) {
  console.log("Connected successfully to server");
  	var app = express();

	app.disable('x-powered-by');
	app.set('views', __dirname + '/views');
	var handlebars = require('express-handlebars').create({defaultLayout:'main'});

	app.engine('handlebars', handlebars.engine);
	app.set('view engine', 'handlebars');
	app.use(require('body-parser').urlencoded({extended: true}))

	app.set('port', process.env.PORT || 3000);

	app.use(express.static(__dirname + '/public'));
	app.get('/', function(req, res){
	  res.render('home');
	});

	app.get('/blogs', function(req, res){
	  var posts = db.collection('documents').find().toArray(function(err, documents){
	 	res.render('blogs', {layout: 'blog.handlebars', test: documents});
	  });
	});

	app.get('/admin/blog', function(req, res){
		insertBlog(db);
	});

	app.get('/blogs/:id', function(req, res){
		var id = req.params.id;
		var post = db.collection('documents').find().toArray(function(err, docs){
			res.render(/*Need to make blog post partial*/)
		})
	})

	app.listen(app.get('port'), function(){
	  console.log('Express started on http://localhost:' +
	    app.get('port') + '; press Ctrl-C to terminate');
	});

});