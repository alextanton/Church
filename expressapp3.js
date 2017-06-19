var express = require("express");

var MongoClient = require('mongodb').MongoClient
var url = 'mongodb://localhost:27017/blogs';
var fs = require('fs');
var https = require('https');

var app = express();
app.disable('x-powered-by');
app.set('views', __dirname + '/views');
var handlebars = require('express-handlebars').create({defaultLayout:'main'});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.use(require('body-parser').urlencoded({extended: true}))

app.set('port', process.env.PORT || 3000);

var options = {
	key: fs.readFileSync('domain.key'),
	cert: fs.readFileSync('cert.crt')
}

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

	app.use(express.static(__dirname + '/public'));
	app.get('/', function(req, res){
		db.collection('documents').find().sort({$natural:1}).limit(3).toArray(function(err, docs){
			if(req.body.contact){
				var contact = req.body.contact
			} else {
				var contact = false;
			}
			res.render('home', {top3: docs, contact: contact});
		})
	});

	app.get('/blogs', function(req, res){
	  var posts = db.collection('documents').find().toArray(function(err, documents){
	 	res.render('blogs', {layout: 'blog.handlebars', test: documents});
	  });
	});

	app.get('/admin/blog', function(req, res){
		insertBlog(db);
	});

	app.get('/calendar', function(req,res){
		res.render('calendar', {layout: 'blog.handlebars'})
	})

	app.get('/blogs/:id', function(req, res){
		var id = req.params.id;
		var post = db.collection('documents').find().toArray(function(err, docs){
			res.render(/*Need to make blog post partial*/)
		})
	})

	app.post('/contact', function(req, res){
		email = "Email: " + req.body.email + "\n";
		name = "Name: " + req.body.name + "\n";
		subject = "Subject: " + req.body.subject + "\n";
		message = "Message: " + req.body.message + "\n";
		wr = "---------------------------\n" + name + email + subject + message + "---------------------------"
		fs.writeFile("test.txt", wr, function(err){
			console.log(err);
		})
		console.log("File written!")
		res.redirect('/#foot?contact=true');
	})
});

https.createServer(options, app).listen(3000, function() {
    console.log('Server listening on port %d in %s mode', this.address().port, app.settings.env);
});