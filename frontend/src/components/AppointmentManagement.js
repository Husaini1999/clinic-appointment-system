import React, { useState } from 'react';
import {
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Button,
	Typography,
	Box,
	Chip,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
} from '@mui/material';
import { format } from 'date-fns';

function AppointmentManagement({ appointments, onStatusUpdate, onRefresh }) {
	const [selectedAppointment, setSelectedAppointment] = useState(null);
	const [notes, setNotes] = useState('');
	const [open, setOpen] = useState(false);

	const handleStatusUpdate = async (appointmentId, newStatus) => {
		try {
			const response = await fetch(
				`/api/appointments/${appointmentId}/status`,
				{
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
					body: JSON.stringify({ status: newStatus, notes }),
				}
			);

			if (response.ok) {
				onRefresh();
				setOpen(false);
				setSelectedAppointment(null);
				setNotes('');
			}
		} catch (error) {
			console.error('Error updating appointment status:', error);
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
		<>
			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>Patient Name</TableCell>
							<TableCell>Email</TableCell>
							<TableCell>Phone</TableCell>
							<TableCell>Treatment</TableCell>
							<TableCell>Date & Time</TableCell>
							<TableCell>Status</TableCell>
							<TableCell>Actions</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{appointments.map((appointment) => (
							<TableRow key={appointment._id}>
								<TableCell>{appointment.patientName}</TableCell>
								<TableCell>{appointment.email}</TableCell>
								<TableCell>{appointment.phone}</TableCell>
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
								<TableCell>
									{appointment.status === 'pending' && (
										<Box sx={{ display: 'flex', gap: 1 }}>
											<Button
												variant="contained"
												color="success"
												size="small"
												onClick={() => {
													setSelectedAppointment(appointment);
													setOpen(true);
												}}
											>
												Approve
											</Button>
											<Button
												variant="contained"
												color="error"
												size="small"
												onClick={() => {
													setSelectedAppointment(appointment);
													setOpen(true);
												}}
											>
												Reject
											</Button>
										</Box>
									)}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>

			<Dialog open={open} onClose={() => setOpen(false)}>
				<DialogTitle>Update Appointment Status</DialogTitle>
				<DialogContent>
					<TextField
						fullWidth
						multiline
						rows={4}
						label="Notes"
						value={notes}
						onChange={(e) => setNotes(e.target.value)}
						margin="normal"
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setOpen(false)}>Cancel</Button>
					<Button
						onClick={() =>
							handleStatusUpdate(selectedAppointment?._id, 'approved')
						}
						color="success"
					>
						Approve
					</Button>
					<Button
						onClick={() =>
							handleStatusUpdate(selectedAppointment?._id, 'rejected')
						}
						color="error"
					>
						Reject
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}

export default AppointmentManagement;
