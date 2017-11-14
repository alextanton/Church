var express = require("express");
var expressValidator = require("express-validator");
var flash = require("connect-flash")
var mongodb = require("mongodb");
var MongoClient = mongodb.MongoClient;
var url = 'mongodb://localhost:27017/church';
var fs = require('fs');
var https = require('https');
var request = require('request');
var session = require('express-session');
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;


var app = express();


app.disable('x-powered-by');
app.set('views', __dirname + '/views');
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.use(require('body-parser').urlencoded({extended: false}))
app.use(require('body-Parser').json());
app.set('port', process.env.PORT || 3000);

app.use(session({
	secret: 'key',
	saveUninitialized: true,
	resave: true
}));

var options = {
	key: fs.readFileSync('domain.key'),
	cert: fs.readFileSync('cert.crt')
}

app.use(passport.initialize());
app.use(passport.session());

app.use(expressValidator({
	errorFormatter: function(param, msg, value){
		var namespace = param.split('.');
		var root = namespace.shift();
		formParam = root;

		while(namespace.length) {
			formParam += '[' + namespace.shift() + ']';
		}
		return {
			param: formParam,
			msg: msg,
			value: value
		};
	}
}));

app.use(function(req, res, next){
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
	res.locals.error = req.flash('error');
	next();
})

MongoClient.connect(url, function(err, db) {
	if(db == null){
		console.log(err);
	}
  console.log("Connected successfully to server");

app.use(express.static(__dirname + '/public'));
 app.get('/', function(req, res){
        db.collection('documents').find().sort({$natural:1}).limit(3).toArray(function(err, docs){
            if(req.body.contact){
                    var contact = req.body.contact
            } else {
                    var contact = false;
            }
            request("https://www.googleapis.com/calendar/v3/calendars/charlestonchurchofchrist.org_8oqnmucsna6a5fi3a64vd19hmg%40group.calendar.google.com/events?maxResults=6&timeMin=2017-09-26T14%3A32%3A56.300Z&singleEvents=true&orderBy=startTime&key=AIzaSyDq6QtcXD8sK5Hoa_bSsuGp1xMYvGJ6vu0", function(error, response, body){
                    fs.readdir('./public/img/slideshow/', function(err, files){
                    	var slideshowImages = []
                    	files.forEach(function(file){
                    		slideshowImages.push(file);
                    	})
            			res.render('home', {top3: docs, contact: contact, recent: JSON.parse(body).items, slideshow: slideshowImages});
            		})
            })
        })
});

	app.get('/blogs', function(req, res){
	  var posts = db.collection('documents').find().toArray(function(err, documents){
	 	res.render('blogs', {layout: 'blog.handlebars', test: documents});
	  });
	});

	passport.use(new LocalStrategy(function(username, password, done){
		User.getUserByUsername(username, function(err, user){
			if (err) throw error;
			if(!user){
				return done(null, false, {message: "unknown user"});
			}
			User.comparePassword(password, user.password, function(err, isMatch){
				if(err) throw err;
				if (isMatch){
					return done(null, user);
				} else {
					return done(null, false, {message: "unknown password"})
				}
			})
		})
	}));

	passport.serializeUser(function(user, done) {
	  done(null, user.id);
	});

	passport.deserializeUser(function(id, done) {
	  User.getUserById(id, function(err, user) {
	    done(err, user);
	  });
	});

	app.post('/admin/login', passport.authenticate('local', {successRedirect: '/admin/add', failureRedirect: '/admin/login'}) ,function(req, res){
		res.redirect("/admin/add");
	})

	app.get('/admin/login', function(req, res){
		res.render('login', {layout: 'noFoot.handlebars'})
	})

	app.post('/admin/add/:type', function(req, res){
		if(req.params.type == 'blog'){
			dbOps.insertBlog(db, req.body, "blogs").then(function(result){
				console.log(result);
			});
		} else{
			insertEvent()
		}
		insertBlog(db, req.body);
		res.render("add", {layout: 'noFoot.handlebars'})
	})

	app.get('/admin/add', function(req, res){
		console.log(req.session.isLoggedIn);
		res.render("add", {layout: 'noFoot.handlebars'})
	});

	app.get('/calendar', function(req,res){
		res.render('calendar', {layout: 'blog.handlebars'})
	})

	app.get('/admin/tanton', function(req, res){
		res.cookie("admin", "tanton");
		res.redirect("/admin/add");

	})

	app.get('/blogs/:id', function(req, res){
		var id = new mongodb.ObjectID(req.params.id);
		var post = db.collection('documents').find({_id:id}).toArray(function(err, docs){
			p = docs[0].post.split("\n");
			docs[0].post = p;
			res.render('singleBlog', {layout: 'blog.handlebars', blog: docs[0]})
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