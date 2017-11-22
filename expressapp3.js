var express = require("express");
var expressValidator = require("express-validator");
var flash = require("connect-flash")
var fs = require('fs');
var https = require('https');
var helmet = require('helmet');
var request = require('request');
var session = require('express-session');
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/User');
var Blog = require('./models/Blog');
var Event = require('./models/Event');
var Belief = require('./models/Belief');


var app = express();


app.disable('x-powered-by');
app.set('views', __dirname + '/views');
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.use(helmet());
app.use(require('body-parser').urlencoded({extended: false}))
app.use(require('body-parser').json());

var multer = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + '.html');
    }
});
var upload = multer({ dest: "./public/uploads/" });

app.set('port', process.env.PORT || 3000);

app.use(session({
	secret: '************',
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

app.use(flash());

app.use(function(req, res, next){
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
	res.locals.error = req.flash('error');
	next();
})

app.use(express.static(__dirname + '/public'));
 app.get('/', function(req, res){
	 Blog.getTop3Blogs(function(err, blogs){
		Event.getUpComingEvents(function(err, events){
			fs.readdir('./public/img/slideshow/', function(err, files){
				var slideshowImages = []
				files.forEach(function(file){
					slideshowImages.push(file);
				})
				res.render('home', {top3: blogs, recent: events, slideshow: slideshowImages});
			})
		})
	 });
});

	passport.use("poop", new LocalStrategy({
  		usernameField: 'username',
  		passwordField: 'password'
			},
		function(username, password, done){
		User.getUserByUsername(username, function(err, user){
			if (err) return done(err);
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

	app.post('/admin/login', passport.authenticate('poop', {successRedirect: '/admin/add', failureRedirect: '/admin/login'}) ,function(req, res){
		res.redirect("/admin/add");
	})

	app.get('/admin/login', function(req, res){
		res.render('login', {layout: 'noFoot.handlebars'})
	})

	app.post('/admin/add/blog', ensureAuthenticated, upload.single('file'),function(req, res, next){
		Blog.uploadBlogWithDocx(req.file.path, req.body, function(isPosted){
			if(isPosted){
				res.render("add", {layout: 'noFoot.handlebars'})
			}else{
				res.statusCode = 500;
			}
		}); 
	})

	app.post('/admin/add/event', ensureAuthenticated,function(req, res, next){
		Event.insertEvent(req.body, function(eventPosted){
			if(eventPosted){
				res.render("add", {layout: 'noFoot.handlebars'})
			}else {
				res.sendStatus = 500;
			}
		});
	})

	app.post('/admin/blog/upload', ensureAuthenticated, upload.single('file'), function(req, res, next){
			Blog.uploadBlogAsDocx(req.file.path, function(html){	
		});
		res.redirect("/admin/add");
	})

	app.get('/blogs', function(req, res){
		Blog.getBlogs(function(err, blogs){
			if(err){
				//
			} else {
				res.render('blogs', {layout: 'blog.handlebars', test: blogs});
			}
		});
	});

	app.get('/admin/add', ensureAuthenticated, function(req, res){
		res.render("add", {layout: 'noFoot.handlebars'})
	});

	function ensureAuthenticated(req, res, next){
		if(req.isAuthenticated()){
			return next();
		} else {
			//req.flash('error_msg','You are not logged in');
			res.redirect('/admin/login');
		}
	}

	app.get('/calendar', function(req,res){
		res.render('calendar', {layout: 'blog.handlebars'})
	})

	app.get('/blogs/:id', function(req, res){
		Blog.getBlogById(req.params.id, function(err, blog){
			if(err){
				res.statusCode = 500;
			} else {
				res.render('singleBlog', {layout: 'blog.handlebars', blog: blog})
			}
		});
	})

	app.post('/contact', function(req, res){
		email = "Email: " + req.body.email + "\n";
		name = "Name: " + req.body.name + "\n";
		subject = "Subject: " + req.body.subject + "\n";
		message = "Message: " + req.body.message + "\n";
		wr = "---------------------------\n" + name + email + subject + message + "---------------------------"
		fs.writeFile("test.txt", wr, function(err){
			//
			})
			res.redirect('/#foot?contact=true');
		})

	app.post("/admin/add/belief", ensureAuthenticated,function(req, res){
		req.body.verses = req.body.verses.split(',');
		Belief.insertBelief(req.body, function(err){
			if(!err){/**/}
			else{
				res.redirect("/admin/add");
			}
		})
	})

	app.get("/beliefs", function(req, res){
		Belief.getAllBeliefs(function(err, beliefs){
			res.render('beliefs', {layout: 'belief.handlebars', beliefs: beliefs});
		});
	})

	app.get("/family", function(req, res){
		res.render('familygroups', {layout: 'blank.handlebars'})
	})

https.createServer(options, app).listen(3000, function() {
    console.log('Server listening on port %d in %s mode', this.address().port, app.settings.env);
});


// Might want this later for getting stuff out of google calendar...
// request("https://www.googleapis.com/calendar/v3/calendars/charlestonchurchofchrist.org_8oqnmucsna6a5fi3a64vd19hmg%40group.calendar.google.com/events?maxResults=6&timeMin=2017-09-26T14%3A32%3A56.300Z&singleEvents=true&orderBy=startTime&key=AIzaSyDq6QtcXD8sK5Hoa_bSsuGp1xMYvGJ6vu0", function(error, response, body){
// 	fs.readdir('./public/img/slideshow/', function(err, files){
// 		var slideshowImages = []
// 		files.forEach(function(file){
// 			slideshowImages.push(file);
// 		})
// 		res.render('home', {top3: docs, contact: contact, recent: JSON.parse(body).items, slideshow: slideshowImages});
// 	})
// })