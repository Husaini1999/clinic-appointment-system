import React, { useEffect, useState } from 'react';
import {
	Container,
	Typography,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableRow,
	Paper,
	Chip,
} from '@mui/material';

function StaffDashboard() {
	const [appointments, setAppointments] = useState([]);

	useEffect(() => {
		fetchAppointments();
	}, []);

	const fetchAppointments = async () => {
		const response = await fetch('/api/staffAppointments', {
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
			<Typography variant="h4">Staff Dashboard</Typography>

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
								<TableCell>{appointment.patientName}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</Container>
	);
}

export default StaffDashboard;
