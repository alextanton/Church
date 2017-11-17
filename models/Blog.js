var mongoose = require('mongoose');
var url = 'mongodb://localhost:27017/church/blogs';
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

module.exports.insertBlog = function(blogObject, callback){
	var newBlog = new Blog(blogObject);
	newBlog.save(callback);
}