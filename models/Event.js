var mongoose = require('mongoose');
var url = 'mongodb://localhost:27017/church/events';
mongoose.connect(url);

var db = mongoose.connection;
var schema = mongoose.Schema;

var EventSchema = new schema({
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

var Event = module.exports = mongoose.model('Event', EventSchema);

module.exports.getEventById = function(id, callback){
	Event.findById(id, callback);
}

module.exports.getEvents = function(callback){
	Event.find({}, function(events, err){
		if(err){throw err;}
		if(events){
			callback(events);
		}
	})
}

module.exports.insertEvent = function(eventObject, callback){
	var newEvent = new Event(eventObject);
	Event.save(function(err){
		if(err){throw err;}
		console.log("EVENT POSTED");
	})
}