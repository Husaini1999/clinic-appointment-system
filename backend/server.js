require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/openai', require('./routes/openai'));

// MongoDB connection string
const mongoURI = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_CLUSTER}.mongodb.net/${process.env.MONGODB_DATABASE}?retryWrites=true&w=majority`;

console.log('Attempting to connect to MongoDB...');

// Connect to MongoDB
mongoose
	.connect(mongoURI)
	.then(() => {
		console.log('MongoDB Connected Successfully');
	})
	.catch((err) => {
		console.error('MongoDB connection error:', err.message);
		process.exit(1);
	});

// Basic error handling
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
	console.log('Environment:', process.env.NODE_ENV);
});

module.exports = app;
