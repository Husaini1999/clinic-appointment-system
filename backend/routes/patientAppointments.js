const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const authMiddleware = require('../middleware/auth');

// Middleware to protect the route
router.use(authMiddleware);

// Get appointments for the authenticated patient
router.get('/', async (req, res) => {
	try {
		const patientEmail = req.user.email; // Assuming the user's email is stored in the token
		const appointments = await Appointment.find({ email: patientEmail });

		res.status(200).json(appointments);
	} catch (error) {
		console.error('Error fetching patient appointments:', error);
		res.status(500).json({ message: 'Error fetching appointments' });
	}
});

module.exports = router;
