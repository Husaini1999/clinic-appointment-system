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
	InputAdornment,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
	Grid,
	TableSortLabel,
	TablePagination,
} from '@mui/material';
import { format } from 'date-fns';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

// Separate Approve Modal Component
const ApproveModal = React.memo(
	({ open, onClose, onApprove, appointmentId, notes, onNotesChange }) => (
		<Dialog open={open} onClose={onClose}>
			<DialogTitle>Approve Appointment</DialogTitle>
			<DialogContent>
				<Typography variant="body2" sx={{ mb: 2 }}>
					Are you sure you want to approve this appointment?
				</Typography>
				<TextField
					fullWidth
					multiline
					rows={4}
					label="Notes (Optional)"
					value={notes}
					onChange={onNotesChange}
					margin="normal"
				/>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>Cancel</Button>
				<Button
					onClick={() => onApprove(appointmentId, 'approved')}
					color="success"
					variant="contained"
				>
					Approve
				</Button>
			</DialogActions>
		</Dialog>
	)
);

// Separate Reject Modal Component
const RejectModal = React.memo(
	({ open, onClose, onReject, appointmentId, notes, onNotesChange }) => (
		<Dialog open={open} onClose={onClose}>
			<DialogTitle>Reject Appointment</DialogTitle>
			<DialogContent>
				<Typography variant="body2" sx={{ mb: 2 }}>
					Are you sure you want to reject this appointment?
				</Typography>
				<TextField
					fullWidth
					multiline
					rows={4}
					label="Reason for Rejection (Required)"
					value={notes}
					onChange={onNotesChange}
					margin="normal"
					required
				/>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>Cancel</Button>
				<Button
					onClick={() => onReject(appointmentId, 'rejected')}
					color="error"
					variant="contained"
					disabled={!notes.trim()}
				>
					Reject
				</Button>
			</DialogActions>
		</Dialog>
	)
);

function AppointmentManagement({ appointments, onRefresh }) {
	const [selectedAppointment, setSelectedAppointment] = useState(null);
	const [approveNotes, setApproveNotes] = useState('');
	const [rejectNotes, setRejectNotes] = useState('');
	const [approveModalOpen, setApproveModalOpen] = useState(false);
	const [rejectModalOpen, setRejectModalOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState('all');
	const [treatmentFilter, setTreatmentFilter] = useState('all');
	const [orderBy, setOrderBy] = useState('appointmentTime'); // Empty string means no sort
	const [order, setOrder] = useState('asc');
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(5);

	// Get unique treatments from appointments
	const treatments = [
		'all',
		...new Set(appointments.map((apt) => apt.treatment)),
	];

	// Get all possible statuses
	const statuses = ['all', 'pending', 'approved', 'rejected', 'cancelled'];

	// Enhanced filter logic
	const filteredAppointments = appointments.filter((apt) => {
		const matchesSearch =
			apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			apt.email.toLowerCase().includes(searchTerm.toLowerCase());

		const matchesTreatment =
			treatmentFilter === 'all' || apt.treatment === treatmentFilter;
		const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;

		return matchesSearch && matchesTreatment && matchesStatus;
	});

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
					body: JSON.stringify({
						status: newStatus,
						notes: newStatus === 'approved' ? approveNotes : rejectNotes,
					}),
				}
			);

			if (response.ok) {
				onRefresh();
				handleCloseModals();
			}
		} catch (error) {
			console.error('Error updating appointment status:', error);
		}
	};

	const handleCloseModals = () => {
		setApproveModalOpen(false);
		setRejectModalOpen(false);
		setSelectedAppointment(null);
		setApproveNotes('');
		setRejectNotes('');
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

	// Modified sort function with clear functionality
	const handleRequestSort = (property) => {
		const isAsc = orderBy === property && order === 'asc';
		const isDesc = orderBy === property && order === 'desc';

		if (isDesc) {
			// Clear sort if already in desc order
			setOrder('asc');
			setOrderBy('');
		} else {
			// Toggle between asc and desc
			setOrder(isAsc ? 'desc' : 'asc');
			setOrderBy(property);
		}
	};

	// Sorting function for different data types
	const compareValues = (a, b, property) => {
		if (property === 'appointmentTime') {
			return new Date(a[property]) - new Date(b[property]);
		}
		if (typeof a[property] === 'string') {
			return a[property].localeCompare(b[property]);
		}
		return a[property] - b[property];
	};

	// Modified sorting logic
	const sortedAppointments = React.useMemo(() => {
		if (!orderBy) return filteredAppointments; // Return unsorted if no orderBy

		return [...filteredAppointments].sort((a, b) => {
			const result = compareValues(a, b, orderBy);
			return order === 'asc' ? result : -result;
		});
	}, [filteredAppointments, order, orderBy]);

	// Table headers configuration
	const headCells = [
		{ id: 'patientName', label: 'Patient Name' },
		{ id: 'email', label: 'Email' },
		{ id: 'phone', label: 'Phone' },
		{ id: 'treatment', label: 'Treatment' },
		{ id: 'appointmentTime', label: 'Date & Time' },
		{ id: 'status', label: 'Status' },
		{ id: 'actions', label: 'Actions', sortable: false },
	];

	// Add clear filters function
	const clearAllFilters = () => {
		setSearchTerm('');
		setStatusFilter('all');
		setTreatmentFilter('all');
		setOrderBy('');
		setOrder('asc');
	};

	// Handle page change
	const handleChangePage = (event, newPage) => {
		setPage(newPage);
	};

	// Handle rows per page change
	const handleChangeRowsPerPage = (event) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	// Modify the sorting logic to include pagination
	const sortedAndPaginatedAppointments = React.useMemo(() => {
		const sorted = !orderBy
			? filteredAppointments
			: [...filteredAppointments].sort((a, b) => {
					const result = compareValues(a, b, orderBy);
					return order === 'asc' ? result : -result;
			  });

		// Apply pagination
		return sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
	}, [filteredAppointments, order, orderBy, page, rowsPerPage]);

	// Reset page when filters change
	React.useEffect(() => {
		setPage(0);
	}, [searchTerm, statusFilter, treatmentFilter]);

	return (
		<>
			{/* Search and Filter Section */}
			<Grid container spacing={2} sx={{ mb: 2 }}>
				{' '}
				{/* Reduced margin bottom */}
				{/* Search Field */}
				<Grid item xs={12} md={6}>
					<TextField
						fullWidth
						variant="outlined"
						placeholder="Search by patient name or email..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<SearchIcon />
								</InputAdornment>
							),
						}}
					/>
				</Grid>
				{/* Treatment Filter */}
				<Grid item xs={12} md={3}>
					<FormControl fullWidth>
						<InputLabel>Treatment</InputLabel>
						<Select
							value={treatmentFilter}
							label="Treatment"
							onChange={(e) => setTreatmentFilter(e.target.value)}
						>
							{treatments.map((treatment) => (
								<MenuItem key={treatment} value={treatment}>
									{treatment === 'all' ? 'All Treatments' : treatment}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</Grid>
				{/* Status Filter */}
				<Grid item xs={12} md={3}>
					<FormControl fullWidth>
						<InputLabel>Status</InputLabel>
						<Select
							value={statusFilter}
							label="Status"
							onChange={(e) => setStatusFilter(e.target.value)}
						>
							{statuses.map((status) => (
								<MenuItem key={status} value={status}>
									{status === 'all'
										? 'All Statuses'
										: status.charAt(0).toUpperCase() + status.slice(1)}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</Grid>
			</Grid>

			{/* Active Filters and Clear Button */}
			<Box
				sx={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					mb: 2, // Reduced margin bottom
				}}
			>
				{/* Active Filter Chips */}
				<Box sx={{ display: 'flex', gap: 1 }}>
					{treatmentFilter !== 'all' && (
						<Chip
							label={`Treatment: ${treatmentFilter}`}
							onDelete={() => setTreatmentFilter('all')}
							color="primary"
							size="small"
						/>
					)}
					{statusFilter !== 'all' && (
						<Chip
							label={`Status: ${statusFilter}`}
							onDelete={() => setStatusFilter('all')}
							color="primary"
							size="small"
						/>
					)}
					{orderBy && (
						<Chip
							label={`Sorted by: ${
								headCells.find((cell) => cell.id === orderBy)?.label
							} (${order === 'asc' ? 'A-Z' : 'Z-A'})`}
							onDelete={() => {
								setOrderBy('');
								setOrder('asc');
							}}
							color="primary"
							size="small"
						/>
					)}
				</Box>

				{/* Clear All Button */}
				{(searchTerm ||
					statusFilter !== 'all' ||
					treatmentFilter !== 'all' ||
					orderBy) && (
					<Button
						variant="outlined"
						onClick={clearAllFilters}
						startIcon={<ClearIcon />}
						size="small"
					>
						Clear All Filters
					</Button>
				)}
			</Box>

			{/* Table */}
			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							{headCells.map((headCell) => (
								<TableCell key={headCell.id}>
									{headCell.sortable !== false ? (
										<TableSortLabel
											active={orderBy === headCell.id}
											direction={orderBy === headCell.id ? order : 'asc'}
											onClick={() => handleRequestSort(headCell.id)}
										>
											{headCell.label}
										</TableSortLabel>
									) : (
										headCell.label
									)}
								</TableCell>
							))}
						</TableRow>
					</TableHead>
					<TableBody>
						{sortedAndPaginatedAppointments.map((appointment) => (
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
													setApproveModalOpen(true);
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
													setRejectModalOpen(true);
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

				{/* Add TablePagination */}
				<TablePagination
					rowsPerPageOptions={[5, 10, 25]}
					component="div"
					count={filteredAppointments.length}
					rowsPerPage={rowsPerPage}
					page={page}
					onPageChange={handleChangePage}
					onRowsPerPageChange={handleChangeRowsPerPage}
					sx={{
						borderTop: '1px solid rgba(224, 224, 224, 1)',
					}}
				/>
			</TableContainer>

			<ApproveModal
				open={approveModalOpen}
				onClose={handleCloseModals}
				onApprove={handleStatusUpdate}
				appointmentId={selectedAppointment?._id}
				notes={approveNotes}
				onNotesChange={(e) => setApproveNotes(e.target.value)}
			/>

			<RejectModal
				open={rejectModalOpen}
				onClose={handleCloseModals}
				onReject={handleStatusUpdate}
				appointmentId={selectedAppointment?._id}
				notes={rejectNotes}
				onNotesChange={(e) => setRejectNotes(e.target.value)}
			/>
		</>
	);
}

export default AppointmentManagement;
