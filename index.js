const express = require("express");
const app = express();
const port = 8000;
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");

// Middleware
app.use(express.json());
app.use(cors());

// Database connection
let url =
	"mongodb+srv://ritikraj1875:Z7VwN1Ypj3eYUKW9@cluster0.y5obe.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(url, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});
mongoose.connection.on("connected", () => {
	console.log("Database Connected");
});
mongoose.connection.on("error", (err) => {
	console.log("Database connection error:", err);
});

// Models
const Users = mongoose.model("Users", {
	username: String,
	userId: String,
	firstName: String,
	lastName: String,
	dob: String,
	gender: String,
	location: String,
	phoneNumber: String,
	password: String,
	email: String,
});
const Workers = mongoose.model("Workers", {
	username: String,
	userId: String,
	firstName: String,
	lastName: String,
	dob: String,
	gender: String,
	location: String,
	phoneNumber: String,

	password: String,
	email: String,
});
const AssignWork = mongoose.model("assignwork", {
	userId: { type: String, required: true },
	name: String,
	phone: String,
	address: String,
	service: String,
	message: String,
});

const works = mongoose.model("works", {
	name: String,
	phone: String,
	location: String,
	work: String,
});
const ArchivedWork = mongoose.model("ArchivedWork", {
	_id: mongoose.Schema.Types.ObjectId,
	userId: { type: String, required: true },
	name: String,
	phone: String,
	address: String,
	service: String,
	message: String,
	archivedAt: { type: Date, default: Date.now },
});
const Rag = mongoose.model("Rag", {
	name: String,
	phone: String,
	location: String,
});

// Routes
app.get("/", (req, res) => {
	res.send("Hello World");
});

app.post("/signup_user", (req, res) => {
	console.log(req.body);
	const { username, password, email } = req.body;

	const user = new Users({
		username,
		password,
		email,
	});

	user
		.save()
		.then(() => {
			res.send({ message: "Save Success" });
		})
		.catch(() => {
			res.send({ message: "Server Error" });
		});
});
app.post("/profile_user", (req, res) => {
	console.log("Updating user profile:", req.body);
	const {
		userId,
		firstName,
		lastName,
		dob,
		gender,
		location,
		phoneNumber,
		email,
	} = req.body;

	Users.findOneAndUpdate(
		{ userId },
		{
			firstName,
			lastName,
			dob,
			gender,
			location,
			phoneNumber,
			email,
		},
		{ new: true, upsert: true } // Upsert to create if doesn't exist
	)
		.then(() => {
			res.status(200).send({ message: "Profile updated successfully" });
		})
		.catch((error) => {
			console.error("Error updating profile:", error);
			res.status(500).send({ message: "Server Error" });
		});
});
// fetch profile user

app.get("/profile_user/:userId", (req, res) => {
	const { userId } = req.params;
	Users.findOne({ userId })
		.then((user) => {
			if (user) {
				res.json(user);
			} else {
				res.status(404).send({ message: "User not found" });
			}
		})
		.catch((error) => {
			console.error("Error fetching user profile:", error);
			res.status(500).send({ message: "Server Error" });
		});
});
// Sign up worker
app.post("/signup_worker", (req, res) => {
	console.log("Signing up worker:", req.body);
	const { username, password, email } = req.body;

	// Ideally, hash the password before saving it
	const worker = new Workers({
		username,
		password, // Make sure to hash this in a real app
		email,
	});

	worker
		.save()
		.then(() => {
			res.status(201).send({ message: "Worker saved successfully" });
		})
		.catch((error) => {
			console.error("Error saving worker:", error);
			res.status(500).send({ message: "Server Error" });
		});
});

// Profile update for worker
app.post("/profile_worker", (req, res) => {
	console.log("Updating worker profile:", req.body);
	const {
		userId,
		firstName,
		lastName,
		dob,
		gender,
		location,
		phoneNumber,
		email,
	} = req.body;

	Workers.findOneAndUpdate(
		{ userId },
		{
			firstName,
			lastName,
			dob,
			gender,
			location,
			phoneNumber,
			email,
		},
		{ new: true, upsert: true } // Upsert to create if doesn't exist
	)
		.then(() => {
			console.log("Updated Profile Data:");
			res.status(200).send({ message: "Profile updated successfully" });
		})
		.catch((error) => {
			console.error("Error updating worker profile:", error);
			res.status(500).send({ message: "Server Error" });
		});
});
//fetch worker
app.get("/profile_worker/:userId", (req, res) => {
	const { userId } = req.params;
	Workers.findOne({ userId }) // Use Workers instead of Users
		.then((worker) => {
			if (worker) {
				res.json(worker);
			} else {
				res.status(404).send({ message: "Worker not found" });
			}
		})
		.catch((error) => {
			console.error("Error fetching worker profile:", error);
			res.status(500).send({ message: "Server Error" });
		});
});
app.post("/login_user", (req, res) => {
	console.log(req.body);
	const username = req.body.username;
	const password = req.body.password;

	Users.findOne({ username: username }).then((result) => {
		console.log(result, "User Data");
		if (!result) {
			res.send({ message: "User Not found" });
		} else {
			if (result.password === password) {
				const token = jwt.sign(
					{
						data: result,
					},
					"MYKEY",
					{ expiresIn: "1h" }
				);
				res.send({ message: "User found", token: token, userId: result._id });
			} else {
				res.send({ message: "Incorrect Password" });
			}
		}
	});
});

app.post("/login_worker", (req, res) => {
	console.log(req.body);
	const { username, password } = req.body;

	Workers.findOne({ username }).then((result) => {
		console.log(result, "Worker Data");
		if (!result) {
			res.send({ message: "User Not found" });
		} else {
			if (result.password === password) {
				const token = jwt.sign(
					{
						data: result,
					},
					"MYKEY",
					{ expiresIn: "1h" }
				);
				res.send({ message: "User found", token: token, userId: result._id });
			} else {
				res.send({ message: "Incorrect Password" });
			}
		}
	});
});
// assign work
app.post("/assignwork", async (req, res) => {
	const { id, name, phone, address, service, message } = req.body;

	const workAssignment = new AssignWork({
		userId: id, // Store the userId from the request
		name,
		phone,
		address,
		service,
		message,
	});

	try {
		const savedTask = await workAssignment.save();
		res.send({ message: "Work assigned successfully", data: savedTask });
	} catch (error) {
		console.error("Error assigning work:", error);
		res.status(500).send({ message: "Server Error" });
	}
});

// Endpoint to get all work assignments
// app.get("/assignwork", async (req, res) => {
// 	try {
// 		const work = await AssignWork.find();
// 		res.status(200).json(work);
// 	} catch (error) {
// 		res.status(500).json({ message: error.message });
// 	}
// });
app.get("/assignwork", async (req, res) => {
	const userId = req.query.userId; // Get the userId from the query parameters

	try {
		const tasks = await AssignWork.find({ userId }); // Filter tasks by userId
		res.send(tasks);
	} catch (error) {
		console.error("Error fetching work assignments:", error);
		res.status(500).send({ message: "Server Error" });
	}
});
app.get("/assignedwork", async (req, res) => {
	try {
		const tasks = await AssignWork.find(); // Ensure it returns userId
		res.send(tasks);
	} catch (error) {
		console.error("Error fetching work assignments:", error);
		res.status(500).send({ message: "Server Error" });
	}
});
// Delete an assigned work by ID
app.delete("/assignwork/:id", (req, res) => {
	const { id } = req.params;

	AssignWork.findByIdAndDelete(id)
		.then(() => {
			res.send({ message: "Work assignment deleted successfully" });
		})
		.catch((error) => {
			console.error("Error deleting work assignment:", error);
			res.status(500).send({ message: "Server Error" });
		});
});
//archived scheema
// Archive work assignment
app.post("/archivework", (req, res) => {
	const { _id, name, phone, address, service, message, userId } = req.body;

	const archivedWork = new ArchivedWork({
		_id,
		name,
		phone,
		address,
		service,
		message,
		userId, // Store the userId in the archive
	});

	archivedWork
		.save()
		.then((savedTask) => {
			console.log("Archived Work:", savedTask);
			res.send({ message: "Work archived successfully" });
		})
		.catch((error) => {
			console.error("Error archiving work assignment:", error);
			res.status(500).send({ message: "Server Error" });
		});
});
//fetch archive
app.get("/archive/:userId", (req, res) => {
	const { userId } = req.params;
	ArchivedWork.find({ userId }) // Use find instead of findOne
		.then((tasks) => {
			if (tasks.length > 0) {
				res.json(tasks);
			} else {
				res
					.status(404)
					.send({ message: "No archived work found for this user" });
			}
		})
		.catch((error) => {
			console.error("Error fetching archived work:", error);
			res.status(500).send({ message: "Server Error" });
		});
});

//rag post

app.post("/api/rag", async (req, res) => {
	try {
		const { name, phone, location } = req.body;

		const newRag = new Rag({ name, phone, location });
		await newRag.save();
		console.log("Data saved successfully", newRag);

		res.status(201).json({ message: "Data saved successfully" });
	} catch (error) {
		res.status(500).json({ error: "Server error" });
	}
});
//get rag

app.get("/api/rag", async (req, res) => {
	try {
		const rags = await Rag.find(); // Retrieve all Rags from the database
		res.status(200).json(rags); // Send the data as a JSON response
	} catch (error) {
		res.status(500).json({ error: "Server error" });
	}
});
//rag delete
// DELETE request to remove a Rag entry
app.delete("/api/rag", async (req, res) => {
	try {
		const { name, phone, location } = req.body;

		// Log the received data
		console.log("Received data:", req.body);

		// Check if all required fields are provided
		if (!name || !phone || !location) {
			return res.status(400).json({ error: "All fields are required" });
		}

		// Perform the delete operation
		const deletedRag = await Rag.findOneAndDelete({ name, phone, location });

		// If no document was found to delete, return a 404 error
		if (!deletedRag) {
			return res.status(404).json({ error: "Rag entry not found" });
		}

		// Success
		res
			.status(200)
			.json({ message: "Rag entry deleted successfully", deletedRag });
	} catch (err) {
		// Log the error and return a 500 error with a message
		console.error("Deletion error:", err.message);
		res.status(500).json({ error: "Failed to delete Rag entry" });
	}
});

// Start the server
app.listen(port, () => {
	console.log(`App is Listening on the port ${port}`);
});
