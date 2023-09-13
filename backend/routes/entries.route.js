let mongoose = require("mongoose"),
express = require("express"),
router = express.Router();

// Student Model
let customerSchema = require("../models/entries");

// CREATE Student
router.post("/create-student", (req, res, next) => {
customerSchema.create(req.body, (error, data) => {
	if (error) {
	return next(error);
	} else {
	console.log(data);
	res.json(data);
	}
});
});

// READ Students
router.get("/", (req, res, next) => {
customerSchema.find((error, data) => {
	if (error) {
	return next(error);
	} else {
	res.json(data);
	}
});
});

router.get("/get-result", (req, res, next) => {
	const filters = req.query.createdBy;
	console.log(filters);
	customerSchema.find((error, data) => {
		if (error) {
		return next(error);
		} else {
			const filteredUser = data.filter(user => {
				 return user["createdBy"] == filters
			})
			 res.json(filteredUser);
		}
	});
});

// UPDATE student
router
.route("/update-student/:id")
// Get Single Student
.get((req, res,next) => {
	customerSchema.findById(
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
	customerSchema.findByIdAndUpdate(
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
		console.log("Student updated successfully !");
		}
	}
	);
});

// Delete Student
router.delete("/delete-student/:id",
(req, res, next) => {
customerSchema.findByIdAndRemove(
	req.params.id, (error, data) => {
	if (error) {
	return next(error);
	} else {
	res.status(200).json({
		msg: data,
	});
	}
});
});

module.exports = router;
