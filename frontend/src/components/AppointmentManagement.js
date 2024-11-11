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
import { canCancelAppointments } from '../utils/roleUtils';

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

// Add this after the RejectModal component
const CancelModal = React.memo(
	({ open, onClose, onCancel, appointmentId, notes, onNotesChange }) => (
		<Dialog open={open} onClose={onClose}>
			<DialogTitle>Cancel Appointment</DialogTitle>
			<DialogContent>
				<Typography variant="body2" sx={{ mb: 2 }}>
					Are you sure you want to cancel this appointment?
				</Typography>
				<TextField
					fullWidth
					multiline
					rows={4}
					label="Cancellation Reason (Required)"
					value={notes}
					onChange={onNotesChange}
					margin="normal"
					required
				/>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>Back</Button>
				<Button
					onClick={() => onCancel(appointmentId, 'cancelled')}
					color="warning"
					variant="contained"
					disabled={!notes.trim()}
				>
					Cancel Appointment
				</Button>
			</DialogActions>
		</Dialog>
	)
);

// Update the tableStyles constant
const tableStyles = {
	width: '100%',
	tableLayout: 'fixed',
	'& .MuiTableCell-root': {
		padding: '16px',
		height: 'auto',
		verticalAlign: 'top', // Align content to top
	},
	'& .MuiTableCell-head': {
		backgroundColor: '#f5f5f5',
		fontWeight: 'bold',
		whiteSpace: 'nowrap', // Keep headers on single line
	},
};

function AppointmentManagement({ appointments, onRefresh }) {
	const [selectedAppointment, setSelectedAppointment] = useState(null);
	const [approveNotes, setApproveNotes] = useState('');
	const [rejectNotes, setRejectNotes] = useState('');
	const [cancelNotes, setCancelNotes] = useState('');
	const [approveModalOpen, setApproveModalOpen] = useState(false);
	const [rejectModalOpen, setRejectModalOpen] = useState(false);
	const [cancelModalOpen, setCancelModalOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState('all');
	const [treatmentFilter, setTreatmentFilter] = useState('all');
	const [orderBy, setOrderBy] = useState('appointmentTime'); // Empty string means no sort
	const [order, setOrder] = useState('asc');
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(5);
	const user = JSON.parse(localStorage.getItem('user'));
	const canCancel = canCancelAppointments(user.role);

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
						notes:
							newStatus === 'approved'
								? approveNotes
								: newStatus === 'rejected'
								? rejectNotes
								: cancelNotes,
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
		setCancelModalOpen(false);
		setSelectedAppointment(null);
		setApproveNotes('');
		setRejectNotes('');
		setCancelNotes('');
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

	// Keep the sorting logic
	const sortedAppointments = React.useMemo(() => {
		if (!orderBy) return filteredAppointments;

		return [...filteredAppointments].sort((a, b) => {
			const result = compareValues(a, b, orderBy);
			return order === 'asc' ? result : -result;
		});
	}, [filteredAppointments, order, orderBy]);

	// Add the pagination logic
	const sortedAndPaginatedAppointments = React.useMemo(() => {
		return sortedAppointments.slice(
			page * rowsPerPage,
			page * rowsPerPage + rowsPerPage
		);
	}, [sortedAppointments, page, rowsPerPage]);

	// Table headers configuration
	const headCells = [
		{ id: 'patientName', label: 'Patient Name', width: '15%' },
		{ id: 'email', label: 'Email', width: '18%' },
		{ id: 'phone', label: 'Phone', width: '12%' },
		{ id: 'treatment', label: 'Treatment', width: '13%' },
		{ id: 'appointmentTime', label: 'Date & Time', width: '12%' },
		{ id: 'status', label: 'Status', width: '10%' },
		{ id: 'actions', label: 'Actions', sortable: false, width: '20%' },
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

	// Reset page when filters change
	React.useEffect(() => {
		setPage(0);
	}, [searchTerm, statusFilter, treatmentFilter]);

	// Add handleCancel function
	const handleCancel = (appointment) => {
		setSelectedAppointment(appointment);
		setCancelModalOpen(true);
	};

	return (
		<Box sx={{ width: '100%', overflow: 'hidden' }}>
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

			{/* Updated Table Container */}
			<TableContainer
				component={Paper}
				sx={{
					width: '100%',
					overflowX: 'hidden',
					'& .MuiTable-root': {
						minWidth: 'auto',
						tableLayout: 'fixed',
					},
				}}
			>
				<Table sx={tableStyles}>
					<TableHead>
						<TableRow>
							{headCells.map((headCell) => (
								<TableCell
									key={headCell.id}
									sx={{
										whiteSpace: 'nowrap',
										width: headCell.width || 'auto',
										textAlign: headCell.id === 'actions' ? 'center' : 'left',
									}}
								>
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
								<TableCell
									sx={{
										wordBreak: 'break-word',
										minHeight: '60px',
									}}
								>
									{appointment.patientName}
								</TableCell>

								<TableCell
									sx={{
										wordBreak: 'break-word',
										minHeight: '60px',
									}}
								>
									{appointment.email}
								</TableCell>

								<TableCell
									sx={{
										whiteSpace: 'nowrap',
										minHeight: '60px',
									}}
								>
									{appointment.phone}
								</TableCell>

								<TableCell
									sx={{
										wordBreak: 'break-word',
										minHeight: '60px',
									}}
								>
									{appointment.treatment}
								</TableCell>

								<TableCell
									sx={{
										minHeight: '60px',
										textAlign: 'center',
									}}
								>
									{format(new Date(appointment.appointmentTime), 'PP')}
									<br />
									{format(new Date(appointment.appointmentTime), 'p')}
								</TableCell>

								<TableCell
									sx={{
										minHeight: '60px',
										display: 'flex',
										justifyContent: 'center',
										alignItems: 'center',
									}}
								>
									<Chip
										label={
											appointment.status.charAt(0).toUpperCase() +
											appointment.status.slice(1)
										}
										color={getStatusColor(appointment.status)}
										size="small"
										sx={{ minWidth: '80px' }}
									/>
								</TableCell>

								<TableCell
									sx={{
										minHeight: '60px',
										width: '15%',
									}}
								>
									{appointment.status === 'pending' && (
										<Box
											sx={{
												display: 'flex',
												flexDirection: 'row', // Keep buttons in a row
												gap: 0.5,
												flexWrap: 'nowrap', // Prevent wrapping
												'& .MuiButton-root': {
													minWidth: 'auto',
													padding: '4px 8px',
													fontSize: '0.75rem',
													whiteSpace: 'nowrap',
												},
											}}
										>
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
											{canCancel && (
												<Button
													variant="contained"
													color="warning"
													size="small"
													onClick={() => handleCancel(appointment)}
												>
													Cancel
												</Button>
											)}
										</Box>
									)}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>

			{/* Update TablePagination styles */}
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
					backgroundColor: '#fff',
				}}
			/>

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

			<CancelModal
				open={cancelModalOpen}
				onClose={handleCloseModals}
				onCancel={handleStatusUpdate}
				appointmentId={selectedAppointment?._id}
				notes={cancelNotes}
				onNotesChange={(e) => setCancelNotes(e.target.value)}
			/>
		</Box>
	);
}

export default AppointmentManagement;
