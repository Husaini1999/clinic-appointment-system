const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Signup route
router.post('/signup', async (req, res) => {
	const { name, email, password } = req.body;

	try {
		// Check if user already exists
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({ message: 'User already exists' });
		}

		// Validate password length
		if (password.length < 6) {
			return res
				.status(400)
				.json({ message: 'Password must be at least 6 characters' });
		}

		// Create new user
		const newUser = new User({ name, email, password });
		await newUser.save();

		res.status(201).json({ message: 'User registered successfully' });
	} catch (error) {
		console.error('Signup error:', error);
		res.status(500).json({ message: 'Server error' });
	}
});

// Login route
router.post('/login', async (req, res) => {
	const { email, password } = req.body;

	try {
		// Check if user exists
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(400).json({ message: 'Invalid credentials' });
		}

		// Check password
		const isMatch = await user.matchPassword(password);
		if (!isMatch) {
			return res.status(400).json({ message: 'Invalid credentials' });
		}

		// Create and return JWT
		const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
			expiresIn: '1h',
		});
		res.json({
			token,
			user: { id: user._id, name: user.name, email: user.email },
		});
	} catch (error) {
		console.error('Login error:', error);
		res.status(500).json({ message: 'Server error' });
	}
});

module.exports = router;
