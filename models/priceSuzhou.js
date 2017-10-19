var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// See http://mongoosejs.com/docs/schematypes.html

var priceSuzhouSchema = new Schema({
	name: String,
    price: Number,
})

// export model so we can interact with it in other files
module.exports = mongoose.model('priceSuzhou',priceSuzhouSchema);