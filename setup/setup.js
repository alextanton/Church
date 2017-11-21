var bcrypt = require('bcryptjs');
var User = require("../models/User")

var newUser = new User({
	username: "*********",
	password: "*********"
});

bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(newUser.password, salt, function(err, hash) {
        	newUser.password = hash;
        	newUser.save(function(err){
        		process.exit()
        	});
    	});
	});
