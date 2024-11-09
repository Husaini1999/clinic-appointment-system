import React, { useEffect, useState } from 'react';
import {
	Container,
	Typography,
	Button,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableRow,
	Paper,
	Chip,
} from '@mui/material';

function PatientDashboard() {
	const [appointments, setAppointments] = useState([]);

	useEffect(() => {
		fetchAppointments();
	}, []);

	const fetchAppointments = async () => {
		const response = await fetch('/api/patientAppointments', {
			headers: {
				Authorization: `Bearer ${localStorage.getItem('token')}`,
			},
		});
		const data = await response.json();
		setAppointments(data);
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
		<Container>
			<Typography variant="h4">Patient Dashboard</Typography>
			<Button
				variant="contained"
				color="primary"
				onClick={() => {
					/* Logic to book appointment */
				}}
			>
				Book New Appointment
			</Button>

			<TableContainer component={Paper} sx={{ mt: 2 }}>
				<Table>
					<TableBody>
						{appointments.map((appointment) => (
							<TableRow key={appointment._id}>
								<TableCell>
									{new Date(appointment.appointmentTime).toLocaleString()}
								</TableCell>
								<TableCell>{appointment.treatment}</TableCell>
								<TableCell>
									<Chip
										label={appointment.status}
										color={getStatusColor(appointment.status)}
									/>
								</TableCell>
								<TableCell>{appointment.notes}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</Container>
	);
}

export default PatientDashboard;
