import React, { useState, useEffect } from 'react';
import {
	Container,
	Paper,
	Typography,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableRow,
	Button,
	Box,
	Chip,
} from '@mui/material';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
	const [appointments, setAppointments] = useState([]);
	const navigate = useNavigate();
	const user = JSON.parse(localStorage.getItem('user'));

	useEffect(() => {
		fetchAppointments();
	}, []);

	const fetchAppointments = async () => {
		try {
			const response = await fetch('/api/appointments', {
				headers: {
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
			});
			const data = await response.json();
			setAppointments(data);
		} catch (error) {
			console.error('Error fetching appointments:', error);
		}
	};

	const getStatusColor = (status) => {
		switch (status) {
			case 'approved':
				return 'success';
			case 'pending':
				return 'warning';
			case 'rejected':
				return 'error';
			case 'cancelled':
				return 'default';
			default:
				return 'default';
		}
	};

	return (
		<Container maxWidth="lg" sx={{ mt: 4 }}>
			<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
				<Typography variant="h4" component="h1">
					Welcome, {user.name}
				</Typography>
				<Button
					variant="contained"
					color="primary"
					onClick={() => navigate('/booking')}
				>
					Book New Appointment
				</Button>
			</Box>

			<TableContainer component={Paper}>
				<Table>
					<TableBody>
						{appointments.map((appointment) => (
							<TableRow key={appointment._id}>
								<TableCell>
									{format(new Date(appointment.appointmentTime), 'PPpp')}
								</TableCell>
								<TableCell>{appointment.treatment}</TableCell>
								<TableCell>
									<Chip
										label={appointment.status}
										color={getStatusColor(appointment.status)}
									/>
								</TableCell>
								<TableCell>{appointment.notes}</TableCell>
								{user.role === 'staff' && (
									<TableCell>{appointment.patientName}</TableCell>
								)}
								<TableCell>
									{appointment.status === 'pending' && (
										<Button
											variant="outlined"
											color="error"
											size="small"
											onClick={() => {
												/* Add cancel logic */
											}}
										>
											Cancel
										</Button>
									)}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</Container>
	);
}

export default Dashboard;
