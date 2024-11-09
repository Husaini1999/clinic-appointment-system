const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const authMiddleware = require('../middleware/auth');

// Middleware to protect the route
router.use(authMiddleware);

// Get all appointments for staff
router.get('/', async (req, res) => {
	try {
		const appointments = await Appointment.find();

		res.status(200).json(appointments);
	} catch (error) {
		console.error('Error fetching staff appointments:', error);
		res.status(500).json({ message: 'Error fetching appointments' });
	}
});

// Optional: Add filtering functionality
router.get('/filter', async (req, res) => {
	const { status } = req.query; // e.g., ?status=pending
	try {
		const appointments = await Appointment.find({ status });
		res.status(200).json(appointments);
	} catch (error) {
		console.error('Error fetching filtered appointments:', error);
		res.status(500).json({ message: 'Error fetching appointments' });
	}
});

module.exports = router;
