import React, { useState, useEffect, useCallback } from 'react';
import {
	Container,
	Paper,
	Typography,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableRow,
	TableHead,
	Button,
	Box,
	Chip,
	TextField,
} from '@mui/material';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
	const [appointments, setAppointments] = useState([]);
	const [filteredAppointments, setFilteredAppointments] = useState([]);
	const [filter, setFilter] = useState('');
	const navigate = useNavigate();
	const user = JSON.parse(localStorage.getItem('user'));

	const fetchAppointments = useCallback(async () => {
		try {
			const endpoint =
				user.role === 'patient'
					? '/api/appointments/patient'
					: '/api/appointments';

			const response = await fetch(endpoint, {
				headers: {
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
			});

			if (!response.ok) {
				throw new Error('Network response was not ok');
			}

			const data = await response.json();
			setAppointments(data);
			setFilteredAppointments(data);
		} catch (error) {
			console.error('Error fetching appointments:', error);
		}
	}, [user.role]);

	useEffect(() => {
		fetchAppointments();
	}, [fetchAppointments]);

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

	const handleFilterChange = (event) => {
		const value = event.target.value;
		setFilter(value);
		if (value) {
			const filtered = appointments.filter((appointment) =>
				appointment.status.toLowerCase().includes(value.toLowerCase())
			);
			setFilteredAppointments(filtered);
		} else {
			setFilteredAppointments(appointments);
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

			{user.role === 'staff' && (
				<Box sx={{ mb: 2 }}>
					<TextField
						label="Filter by Status"
						variant="outlined"
						value={filter}
						onChange={handleFilterChange}
					/>
				</Box>
			)}

			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>No.</TableCell>
							<TableCell>Date & Time</TableCell>
							{user.role === 'staff' && <TableCell>Patient Name</TableCell>}
							<TableCell>Treatment</TableCell>
							<TableCell>Status</TableCell>
							<TableCell>Notes</TableCell>
							{user.role === 'staff' && <TableCell>Actions</TableCell>}
						</TableRow>
					</TableHead>
					<TableBody>
						{(user.role === 'patient'
							? filteredAppointments.filter(
									(appointment) => appointment.status !== 'cancelled'
							  )
							: filteredAppointments
						).map((appointment, index) => (
							<TableRow key={appointment._id}>
								<TableCell>{index + 1}</TableCell>
								<TableCell>
									{format(new Date(appointment.appointmentTime), 'PPpp')}
								</TableCell>
								<TableCell>{appointment.notes}</TableCell>
								{user.role === 'staff' && (
									<TableCell>{appointment.patientName}</TableCell>
								)}
								<TableCell>{appointment.treatment}</TableCell>
								<TableCell>
									<Chip
										label={appointment.status}
										color={getStatusColor(appointment.status)}
									/>
								</TableCell>

								<TableCell>
									{appointment.status === 'pending' &&
										user.role === 'staff' && (
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
