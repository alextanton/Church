var mongoose = require('mongoose');
var config = require('./config');
var url = config.db + '/blogs';
var mammoth = require("mammoth");
mongoose.connect(url);

var db = mongoose.connection;
var schema = mongoose.Schema;

var BlogSchema = new schema({
	title: {
		type: String
	},
	author: {
		type: String
	},
	post: {
		type: String
	},
	datePosted: {
		type: String
	},
	image: {
		type: String
	}
})

var Blog = module.exports = mongoose.model('Blog', BlogSchema);

module.exports.getBlogById = function(id, callback){
	Blog.findById(id, callback);
}

module.exports.getBlogs = function(callback){
	Blog.find({}, callback);
}

module.exports.getTop3Blogs = function(callback){
	var q = Blog.find().sort({date: -1}).limit(3);
	q.exec(callback);
}

module.exports.insertBlog = function(blogObject, callback){
	blogObject.datePosted = Blog.formatDate(new Date());
	var newBlog = new Blog(blogObject);
	newBlog.save(callback);
}

module.exports.uploadBlogWithDocx = function(path, reqBlog, callback){
	mammoth.convertToHtml({path: path})
    .then(function(result){
        var html = result.value;
		reqBlog.post = html;
		Blog.insertBlog(reqBlog);
        callback(true);
    }).catch(function(err){
		callback(false);
	})
    .done();
}

module.exports.formatDate = function(date){
	var monthNames = [ "January", "February", "March", "April", "May", "June",
	"July", "August", "September", "October", "November", "December" ];
	var days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
	weekday = days[date.getDay()];
	month = monthNames[date.getMonth()];
	year = date.getFullYear();
	day = date.getDate();
	fString = weekday + ", " + month + " " + day + ", " + year;
	return fString;
}