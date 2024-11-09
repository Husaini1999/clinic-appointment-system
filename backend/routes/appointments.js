const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const authMiddleware = require('../middleware/auth');

// Middleware to protect the routes
router.use(authMiddleware);

// Get all appointments for staff to view
router.get('/', async (req, res) => {
	try {
		const allAppointments = await Appointment.find();

		res.status(200).json(allAppointments);
	} catch (error) {
		console.error('Error fetching all appointments:', error);
		res.status(500).json({ message: 'Error fetching appointments' });
	}
});

// Get appointments for the authenticated patient
router.get('/patient', async (req, res) => {
	try {
		const patientAppointments = await Appointment.find({
			email: req.user.email,
		});

		res.status(200).json(patientAppointments);
	} catch (error) {
		console.error('Error fetching patient appointments:', error);
		res.status(500).json({ message: 'Error fetching appointments' });
	}
});

// Public appointment booking endpoint
router.post('/create', async (req, res) => {
	try {
		const { name, email, phone, treatment, appointmentTime, notes } = req.body;

		// Basic validation
		if (!name || !email || !phone || !treatment || !appointmentTime) {
			return res
				.status(400)
				.json({ message: 'Please fill in all required fields' });
		}

		// Check for appointment conflicts
		const existingAppointment = await Appointment.findOne({
			appointmentTime: new Date(appointmentTime),
			status: { $in: ['pending', 'approved'] },
		});

		if (existingAppointment) {
			return res
				.status(400)
				.json({ message: 'This time slot is already booked' });
		}

		// Create new appointment
		const newAppointment = new Appointment({
			patientName: name,
			email,
			phone,
			treatment,
			appointmentTime: new Date(appointmentTime),
			notes,
			status: 'pending',
		});

		await newAppointment.save();

		res.status(201).json({
			message: 'Appointment booked successfully',
			appointment: newAppointment,
		});
	} catch (error) {
		console.error('Appointment booking error:', error);
		res.status(500).json({ message: 'Error booking appointment' });
	}
});

// Optional: Add filtering functionality for appointments
router.get('/filter', async (req, res) => {
	const { status } = req.query; // e.g., ?status=pending
	try {
		const filteredAppointments = await Appointment.find({ status });
		res.status(200).json(filteredAppointments);
	} catch (error) {
		console.error('Error fetching filtered appointments:', error);
		res.status(500).json({ message: 'Error fetching appointments' });
	}
});

module.exports = router;
