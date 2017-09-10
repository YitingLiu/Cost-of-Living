var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// See http://mongoosejs.com/docs/schematypes.html

var unitPriceSchema = new Schema({
	name: String,
    suzhou: Number,
    nyc: Number
})

// export model so we can interact with it in other files
module.exports = mongoose.model('UnitPrice',unitPriceSchema);