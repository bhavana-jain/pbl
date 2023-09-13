let mongoose = require("mongoose"),
express = require("express"),
router = express.Router();

const { default: userEvent } = require("@testing-library/user-event");
// Student Model
let accountSchema  = require("../models/account");

// CREATE Student
router.post("/create-account", (req, res, next) => {
	accountSchema.create(req.body, (error, data) => {
		if (error) {
		return next(error);
		} else {
		console.log(data);
		res.json(data);
		}
	});
	});

// READ Students
router.get("/get-account", (req, res, next) => {
	const filters = req.query.userName;
	console.log(filters);
	 accountSchema.find((error, data) => {
		if (error) {
		return next(error);
		} else {
			const filteredUser = data.filter(user => {
				 return user["userName"] == filters
			})
			 res.json(filteredUser);
		}
	});
});

router.get("/", (req, res, next) => {
	accountSchema.find((error, data) => {
		if (error) {
		return next(error);
		} else {
		res.json(data);
		}
	});
	});

	// UPDATE student
router
.route("/update-account/:id")
// Get Single Student
.get((req, res,next) => {
	accountSchema.findById(
		req.params.id, (error, data) => {
	if (error) {
		return next(error);
	} else {
		res.json(data);
	}
	});
})

// Update Student Data
.put((req, res, next) => {
	accountSchema.findByIdAndUpdate(
	req.params.id,
	{
		$set: req.body,
	},
	(error, data) => {
		if (error) {
		return next(error);
		console.log(error);
		} else {
		res.json(data);
		console.log("account updated successfully !");
		}
	}
	);
});

module.exports = router;
