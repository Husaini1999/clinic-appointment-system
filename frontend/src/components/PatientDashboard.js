import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
	Box,
	Chip,
	TextField,
} from '@mui/material';
import { format } from 'date-fns';

function Dashboard() {
	const [appointments, setAppointments] = useState([]);
	const [patientAppointments, setPatientAppointments] = useState([]);

	// Use useMemo to ensure user is stable
	const user = useMemo(() => JSON.parse(localStorage.getItem('user')), []);

	const fetchAppointments = useCallback(async () => {
		if (!user) return; // Ensure user is defined

		if (user.role === 'patient') {
			try {
				const endpoint = `/api/appointments/patient?email=${encodeURIComponent(
					user.email
				)}`;
				const response = await fetch(endpoint, {
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
				});
				if (!response.ok) {
					throw new Error('Network response was not ok');
				}
				const data = await response.json();
				setPatientAppointments(data);
			} catch (error) {
				console.error('Error fetching patient appointments:', error);
			}
		}
	}, [user]); // Depend on user

	useEffect(() => {
		fetchAppointments(); // Fetch appointments
	}, [fetchAppointments]); // Depend on stable function

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

	const tableHeaders = [
		{ label: 'No.' },
		{ label: 'Treatment' },
		{ label: 'Date & Time' },
		{ label: 'Status' },
		{ label: 'Notes' },
	];

	const today = new Date();

	const upcomingAppointments =
		user.role === 'patient'
			? patientAppointments.filter(
					(appointment) => new Date(appointment.appointmentTime) >= today
			  )
			: appointments.filter(
					(appointment) => new Date(appointment.appointmentTime) >= today
			  );

	const pastAppointments =
		user.role === 'patient'
			? patientAppointments.filter(
					(appointment) => new Date(appointment.appointmentTime) < today
			  )
			: appointments.filter(
					(appointment) => new Date(appointment.appointmentTime) < today
			  );

	return (
		<Container maxWidth="lg" sx={{ mt: 4 }}>
			<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
				<Typography variant="h4" component="h1">
					Welcome, {user.name}
				</Typography>
			</Box>

			{/* Upcoming Appointments Table */}
			<Typography variant="h5" sx={{ mb: 2 }}>
				Upcoming Appointments
			</Typography>
			<TableContainer component={Paper} sx={{ mb: 4 }}>
				<Table>
					<TableHead>
						<TableRow>
							{tableHeaders.map((header, index) => (
								<TableCell key={index}>{header.label}</TableCell>
							))}
						</TableRow>
					</TableHead>
					<TableBody>
						{upcomingAppointments.length > 0 ? (
							upcomingAppointments.map((appointment, index) => (
								<TableRow key={appointment._id}>
									<TableCell>{index + 1}</TableCell>
									<TableCell>{appointment.treatment}</TableCell>
									<TableCell>
										{format(new Date(appointment.appointmentTime), 'PPpp')}
									</TableCell>
									<TableCell>
										<Chip
											label={appointment.status}
											color={getStatusColor(appointment.status)}
										/>
									</TableCell>
									<TableCell>{appointment.notes}</TableCell>
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={tableHeaders.length} align="center">
									No upcoming appointments available.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</TableContainer>

			{/* Past Appointments Table */}
			<Typography variant="h5" sx={{ mb: 2 }}>
				Past Appointments
			</Typography>
			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							{tableHeaders.map((header, index) => (
								<TableCell key={index}>{header.label}</TableCell>
							))}
						</TableRow>
					</TableHead>
					<TableBody>
						{pastAppointments.length > 0 ? (
							pastAppointments.map((appointment, index) => (
								<TableRow key={appointment._id}>
									<TableCell>{index + 1}</TableCell>
									<TableCell>{appointment.treatment}</TableCell>
									<TableCell>
										{format(new Date(appointment.appointmentTime), 'PPpp')}
									</TableCell>
									<TableCell>
										<Chip
											label={appointment.status}
											color={getStatusColor(appointment.status)}
										/>
									</TableCell>
									<TableCell>{appointment.notes}</TableCell>
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={tableHeaders.length} align="center">
									No past appointments available.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</TableContainer>
		</Container>
	);
}

export default Dashboard;
