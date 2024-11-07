import React, { useState } from 'react';
import {
	Box,
	Container,
	Paper,
	TextField,
	Button,
	Typography,
	Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

function Login() {
	const [formData, setFormData] = useState({
		email: '',
		password: '',
	});
	const [error, setError] = useState('');
	const navigate = useNavigate();

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const response = await fetch('/api/auth/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(formData),
			});

			const data = await response.json();

			if (response.ok) {
				localStorage.setItem('token', data.token);
				localStorage.setItem('user', JSON.stringify(data.user));

				const pendingBooking = sessionStorage.getItem('pendingBooking');
				if (pendingBooking) {
					sessionStorage.removeItem('pendingBooking');
					navigate('/dashboard');
				} else {
					navigate('/dashboard');
				}
			} else {
				setError(data.message);
			}
		} catch (err) {
			setError('An error occurred. Please try again.');
		}
	};

	return (
		<Container component="main" maxWidth="xs">
			<Box
				sx={{
					marginTop: 8,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
				}}
			>
				<Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
					<Typography component="h1" variant="h5" align="center">
						Primer Clinic Login
					</Typography>
					{error && (
						<Alert severity="error" sx={{ mt: 2 }}>
							{error}
						</Alert>
					)}
					<Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
						<TextField
							margin="normal"
							required
							fullWidth
							id="email"
							label="Email Address"
							name="email"
							autoComplete="email"
							autoFocus
							value={formData.email}
							onChange={handleChange}
						/>
						<TextField
							margin="normal"
							required
							fullWidth
							name="password"
							label="Password"
							type="password"
							id="password"
							autoComplete="current-password"
							value={formData.password}
							onChange={handleChange}
						/>
						<Button
							type="submit"
							fullWidth
							variant="contained"
							sx={{ mt: 3, mb: 2 }}
						>
							Sign In
						</Button>
					</Box>
				</Paper>
			</Box>
		</Container>
	);
}

export default Login;
