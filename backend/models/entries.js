const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let customerSchema = new Schema({
	cName: {
		type: String
	},
	address: {
		type: String
	},
	cityPincode: {
		type: String
	},
	date: {
		type: String
	},
	contactNo: {
		type: Number
	},
	billNumber: {
		type: String
	},
	oldBillNumber: {
		type: String
	},
	amount: {
		type: Number
	},
	articleName: {
		type: Array
	},
	principle: [
		new Schema({
			principleAmount: {type: Number},
			interest: {type: Number},
			date: {type: Date}
		})
],
	metal: {
		type: String
	},
	gram: {
		type: Number
	},
	mg: {
		type: Number
	},
	redemptionDate: {
		type: Date
	},
	redemptionAmount: {
		type: Number
	},
	remark: {
		type: String
	},
	presentValue: {
		type: Number
	},
	idProof: {
		type: String
	},
	interest: {
		type: Number
	},
	createdBy: {
		type: String
	},
	deliveryRecNum: {
		type: String
	}
}, {
	collection: 'customerList'
})

module.exports = mongoose.model('Customers', customerSchema)
