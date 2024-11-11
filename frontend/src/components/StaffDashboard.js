import React, { useState, useEffect, useCallback } from 'react';
import {
	Container,
	Grid,
	Paper,
	Typography,
	Tabs,
	Tab,
	Box,
	Card,
	CardContent,
	TextField,
	InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PeopleIcon from '@mui/icons-material/People';
import AppointmentManagement from './AppointmentManagement';
import UserManagement from './UserManagement';

function TabPanel({ children, value, index }) {
	return (
		<div hidden={value !== index}>
			{value === index && <Box sx={{ p: 3 }}>{children}</Box>}
		</div>
	);
}

function StaffDashboard() {
	const [activeTab, setActiveTab] = useState(0);
	const [appointments, setAppointments] = useState([]);
	const [searchTerm, setSearchTerm] = useState('');
	const [stats, setStats] = useState({
		pending: 0,
		approved: 0,
		rejected: 0,
		totalPatients: 0,
	});

	const fetchAppointments = useCallback(async () => {
		try {
			const response = await fetch('/api/appointments', {
				headers: {
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
			});
			if (response.ok) {
				const data = await response.json();
				setAppointments(data);

				// Calculate stats
				setStats({
					pending: data.filter((apt) => apt.status === 'pending').length,
					approved: data.filter((apt) => apt.status === 'approved').length,
					rejected: data.filter((apt) => apt.status === 'rejected').length,
					totalPatients: new Set(data.map((apt) => apt.email)).size,
				});
			}
		} catch (error) {
			console.error('Error fetching appointments:', error);
		}
	}, []);

	useEffect(() => {
		fetchAppointments();
	}, [fetchAppointments]);

	const StatCard = ({ title, value, icon, color }) => (
		<Card sx={{ height: '100%' }}>
			<CardContent>
				<Box
					sx={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
					}}
				>
					<Box>
						<Typography color="textSecondary" gutterBottom>
							{title}
						</Typography>
						<Typography variant="h4" component="div">
							{value}
						</Typography>
					</Box>
					<Box sx={{ color: color }}>{icon}</Box>
				</Box>
			</CardContent>
		</Card>
	);

	return (
		<Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
			{/* Statistics Section */}
			<Grid container spacing={3} sx={{ mb: 4 }}>
				<Grid item xs={12} sm={6} md={3}>
					<StatCard
						title="Pending Appointments"
						value={stats.pending}
						icon={<PendingActionsIcon sx={{ fontSize: 40 }} />}
						color="warning.main"
					/>
				</Grid>
				<Grid item xs={12} sm={6} md={3}>
					<StatCard
						title="Approved Appointments"
						value={stats.approved}
						icon={<CheckCircleIcon sx={{ fontSize: 40 }} />}
						color="success.main"
					/>
				</Grid>
				<Grid item xs={12} sm={6} md={3}>
					<StatCard
						title="Rejected Appointments"
						value={stats.rejected}
						icon={<CancelIcon sx={{ fontSize: 40 }} />}
						color="error.main"
					/>
				</Grid>
				<Grid item xs={12} sm={6} md={3}>
					<StatCard
						title="Total Patients"
						value={stats.totalPatients}
						icon={<PeopleIcon sx={{ fontSize: 40 }} />}
						color="primary.main"
					/>
				</Grid>
			</Grid>

			{/* Search Bar */}
			<TextField
				fullWidth
				variant="outlined"
				placeholder="Search appointments by patient name, email, or treatment..."
				value={searchTerm}
				onChange={(e) => setSearchTerm(e.target.value)}
				sx={{ mb: 4 }}
				InputProps={{
					startAdornment: (
						<InputAdornment position="start">
							<SearchIcon />
						</InputAdornment>
					),
				}}
			/>

			{/* Tabs Section */}
			<Paper sx={{ width: '100%', mb: 2 }}>
				<Tabs
					value={activeTab}
					onChange={(e, newValue) => setActiveTab(newValue)}
					sx={{ borderBottom: 1, borderColor: 'divider' }}
				>
					<Tab label="Appointments" />
					<Tab label="User Management" />
				</Tabs>
			</Paper>

			<TabPanel value={activeTab} index={0}>
				<AppointmentManagement
					appointments={appointments.filter(
						(apt) =>
							apt.patientName
								.toLowerCase()
								.includes(searchTerm.toLowerCase()) ||
							apt.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
							apt.treatment.toLowerCase().includes(searchTerm.toLowerCase())
					)}
					onRefresh={fetchAppointments}
				/>
			</TabPanel>

			<TabPanel value={activeTab} index={1}>
				<UserManagement />
			</TabPanel>
		</Container>
	);
}

export default StaffDashboard;
