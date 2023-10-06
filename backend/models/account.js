const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let accountSchema = new Schema({
	userName: {
		type: String,
		unique: [true, "Enter a unique User Name"]
	},
	accountDetails: {
		type: Array
	},
	companyName: {
		type: String
	},
	accountName: {
		type: String
	},
	address: {
		type: String
	},
	area: {
		type: String
	},
	contactNo: {
type: Number
	},
	pincode: {
		type: String
	},
	license: {
		type: String
	},
	pTanNO: {
		type: String
	}
},
	{
		collection: 'user'

	})

module.exports = mongoose.model('User', accountSchema)
