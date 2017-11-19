var mongoose = require('mongoose');
var url = 'mongodb://localhost:27017/church/beliefs';
mongoose.connect(url);

var db = mongoose.connection;
var schema = mongoose.Schema;

var BeliefSchema = new schema({
	title: {
		type: String
	},
	belief: {
        type: String
    },
    verses: {
        type: [String]
    }
})

var Belief = module.exports = mongoose.model('Belief', BeliefSchema);

module.exports.getBeliefById = function(id, callback){
	Belief.findById(id, callback);
}

module.exports.getAllBeliefs = function(callback){
    Belief.find({}, callback);
}

module.exports.insertBelief = function(BeliefObject, callback){
	var newBelief = new Belief(BeliefObject);
	newBelief.save(function(err){
		if(err){callback(false);}
		console.log("Belief POSTED");
		callback(true)
	})
}