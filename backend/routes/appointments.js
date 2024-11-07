const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');

// Public appointment booking endpoint
router.post('/public', async (req, res) => {
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
		const appointment = new Appointment({
			patientName: name,
			email,
			phone,
			treatment,
			appointmentTime: new Date(appointmentTime),
			notes,
			status: 'pending',
		});

		await appointment.save();

		// Here you would typically send confirmation emails
		// You'll need to implement email sending functionality

		res.status(201).json({
			message: 'Appointment booked successfully',
			appointment,
		});
	} catch (error) {
		console.error('Appointment booking error:', error);
		res.status(500).json({ message: 'Error booking appointment' });
	}
});

// CRUD operations for appointments

module.exports = router;
