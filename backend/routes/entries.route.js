let mongoose = require("mongoose"),
express = require("express"),
router = express.Router();
const fs = require('fs');

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

// get All entries by user Name 
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

router.get("/download", (req, res, next) => {
	const filters = req.query.createdBy;
	console.log(filters);
	customerSchema.find((error, data) => {
		if (error) {
		return next(error);
		} else {
			const filteredUser = data.filter(user => {
				 return user["createdBy"].trim() == filters.trim()
			})
			 res.json(filteredUser);
			 fs.writeFile( 'C:\\pbl\\backend\\data\\' +filters+ '.json', JSON.stringify(filteredUser), err => {
				if (err) {
				  console.error(err);
				}
				console.log("file written successfully");
			  });
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
})

.patch((req, res, next) => {
	let id = req.params.id;
	let principleDetails = req.body.principle;
  
	customerSchema.findByIdAndUpdate(id, { $set: { principle: principleDetails } }, { new: true }).then(updatedUser => {
	  res.send(updatedUser);
	});
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
