var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// See http://mongoosejs.com/docs/schematypes.html

var itemSchema = new Schema({
    expense: Number,
	name: String,
    category: String,
    quantity: Number,
    date: { type: Date, default: Date.now }
})

// export model so we can interact with it in other files
module.exports = mongoose.model('Item',itemSchema);