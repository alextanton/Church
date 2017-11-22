var mongoose = require('mongoose');
var config = require('../config');
var url = config.db + '/events';
mongoose.connect(url);

var db = mongoose.connection;
var schema = mongoose.Schema;

var EventSchema = new schema({
	title: {
		type: String
	},
	where: {
		type: String
	},
	date: {
		type: String
	},
	dateObject: {
		type: Date
	},
	image: {
		type: String
	},
	desc: {
		type: String
	}
})

var Event = module.exports = mongoose.model('Event', EventSchema);

module.exports.getEventById = function(id, callback){
	Event.findById(id, callback);
}

module.exports.getUpComingEvents = function(callback){
	var today = new Date().getTime();
	Event.find().sort({'dateObject': 'desc'}).limit(6).exec(callback)
}

module.exports.insertEvent = function(eventObject, callback){
	eventObject.dateObject = new Date();
	var newEvent = new Event(eventObject);
	newEvent.save(function(err){
		if(err){callback(false);}
		console.log("EVENT POSTED");
		callback(true)
	})
}