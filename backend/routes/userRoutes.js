const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// Get all users (staff only)
router.get('/', auth, async (req, res) => {
	try {
		// Check if requesting user is staff
		if (req.user.role !== 'staff') {
			return res.status(403).json({ message: 'Access denied' });
		}

		const users = await User.find().select('-password');
		res.json(users);
	} catch (error) {
		res.status(500).json({ message: 'Server error' });
	}
});

// Get specific user by ID
router.get('/:id', auth, async (req, res) => {
	try {
		// Check if user is requesting their own info or is staff
		if (
			req.user.role !== 'staff' &&
			req.user._id.toString() !== req.params.id
		) {
			return res.status(403).json({ message: 'Access denied' });
		}

		const user = await User.findById(req.params.id).select('-password');
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		res.json(user);
	} catch (error) {
		res.status(500).json({ message: 'Server error' });
	}
});

// Update user role (staff only)
router.put('/:id/role', auth, async (req, res) => {
	try {
		// Check if requesting user is staff
		if (req.user.role !== 'staff') {
			return res.status(403).json({ message: 'Access denied' });
		}

		const { role } = req.body;
		if (!['patient', 'staff'].includes(role)) {
			return res.status(400).json({ message: 'Invalid role' });
		}

		const user = await User.findByIdAndUpdate(
			req.params.id,
			{ role },
			{ new: true }
		).select('-password');

		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		res.json(user);
	} catch (error) {
		res.status(500).json({ message: 'Server error' });
	}
});

module.exports = router;
