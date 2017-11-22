var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var config = require('./config');
url = config.db + '/users';
mongoose.connect(url);

var db = mongoose.connection;
var schema = mongoose.Schema;

var UserSchema = new schema({
	username: {
		type: String
	},
	password: {
		type: String
	}
})

var User = module.exports = mongoose.model('User', UserSchema);

module.exports.getUserByUsername = function(username, callback){
	console.log(username);
	var query = {username: username};
	User.findOne(query, callback);
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
	bcrypt.compare(candidatePassword, hash, function(err, isMatch){
		if (err) throw err;
		callback(null, isMatch);
	})
}

module.exports.getUserById = function(id, callback){
	User.findById(id, callback);
}