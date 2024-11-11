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
	IconButton,
	Tooltip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import CancelIcon from '@mui/icons-material/Cancel';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { format } from 'date-fns';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { canCancelAppointments } from '../utils/roleUtils';
import { enhancedTableStyles } from './styles/tableStyles';
import NotesHistory from './NotesHistory';

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

// Create a collapsible cell component
const CollapsibleNotesCell = ({ notes }) => {
	const [isExpanded, setIsExpanded] = useState(false);

	return (
		<TableCell
			sx={{
				borderRight: 'none',
				borderLeft: 'none',
				padding: '8px',
				verticalAlign: 'middle',
				textAlign: notes?.length === 0 ? 'center' : 'left',
				color: notes?.length === 0 ? 'text.secondary' : 'inherit',
			}}
		>
			{notes?.length === 0 ? (
				'No notes available'
			) : (
				<Box
					sx={{
						position: 'relative',
						textAlign: 'left',
					}}
				>
					<Box
						sx={{
							maxHeight: isExpanded ? 'none' : '60px',
							overflow: 'hidden',
							transition: 'max-height 0.3s ease-in-out',
							textAlign: 'left',
						}}
					>
						<NotesHistory notes={notes} />
					</Box>
					<IconButton
						size="small"
						onClick={() => setIsExpanded(!isExpanded)}
						sx={{
							position: 'absolute',
							bottom: -8,
							right: -8,
							backgroundColor: 'background.paper',
							boxShadow: 1,
							'&:hover': { backgroundColor: 'grey.100' },
						}}
					>
						{isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
					</IconButton>
				</Box>
			)}
		</TableCell>
	);
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
		{ id: 'patientName', label: 'Patient Name', width: '10%' },
		{ id: 'email', label: 'Email', width: '12%' },
		{ id: 'phone', label: 'Phone', width: '10%' },
		{ id: 'treatment', label: 'Treatment', width: '12%' },
		{ id: 'appointmentTime', label: 'Date & Time', width: '11%' },
		{ id: 'notes', label: 'Notes History', width: '15%' },
		{ id: 'status', label: 'Status', width: '8%' },
		{ id: 'actions', label: 'Actions', sortable: false, width: '12%' },
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

	// Add handleCancel function
	const handleCancel = (appointment) => {
		setSelectedAppointment(appointment);
		setCancelModalOpen(true);
	};

	// Replace the existing tableStyles with this
	const mergedTableStyles = {
		...enhancedTableStyles.root,
		width: '100%',
		tableLayout: 'fixed',
		'& .MuiTableCell-root': {
			...enhancedTableStyles.root['& .MuiTableCell-root'],
			padding: '16px',
			height: 'auto',
			verticalAlign: 'middle',
			textAlign: 'center',
		},
		'& .MuiTableRow-root': {
			...enhancedTableStyles.root['& .MuiTableRow-root'],
		},
		'& .MuiTableHead-root': {
			'& .MuiTableCell-root': {
				backgroundColor: (theme) => theme.palette.primary.main,
				color: 'white',
				fontWeight: 'bold',
				whiteSpace: 'nowrap',
				textAlign: 'center',
			},
		},
	};

	return (
		<Box sx={{ width: '100%', overflow: 'hidden' }}>
			{/* Search and Filter Section */}
			<Grid container spacing={2} sx={{ mt: 1, mb: 2 }}>
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
					...enhancedTableStyles.tableContainer,
					width: '100%',
					overflowX: 'hidden',
					overflowY: 'hidden', // Prevent vertical scroll
					'& .MuiTable-root': {
						tableLayout: 'fixed',
					},
				}}
			>
				<Table sx={mergedTableStyles} stickyHeader>
					<TableHead>
						<TableRow>
							{headCells.map((headCell) => (
								<TableCell
									key={headCell.id}
									width={headCell.width}
									sx={{
										whiteSpace: 'nowrap',
										textAlign: 'center',
									}}
								>
									{headCell.sortable !== false ? (
										<TableSortLabel
											active={orderBy === headCell.id}
											direction={orderBy === headCell.id ? order : 'asc'}
											onClick={() => handleRequestSort(headCell.id)}
											sx={{
												color: 'white !important',
												'& .MuiTableSortLabel-icon': {
													color: 'white !important',
												},
												'&.Mui-active': {
													color: 'white !important',
													'& .MuiTableSortLabel-icon': {
														color: 'white !important',
													},
												},
											}}
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
										verticalAlign: 'middle',
										display: 'table-cell',
										textAlign: 'center',
									}}
								>
									{appointment.patientName}
								</TableCell>

								<TableCell
									sx={{
										wordBreak: 'break-word',
										minHeight: '60px',
										verticalAlign: 'middle',
										display: 'table-cell',
										textAlign: 'center',
									}}
								>
									{appointment.email}
								</TableCell>

								<TableCell
									sx={{
										whiteSpace: 'nowrap',
										minHeight: '60px',
										verticalAlign: 'middle',
										display: 'table-cell',
										textAlign: 'center',
									}}
								>
									{appointment.phone}
								</TableCell>

								<TableCell
									sx={{
										wordBreak: 'break-word',
										minHeight: '60px',
										verticalAlign: 'middle',
										display: 'table-cell',
										textAlign: 'center',
									}}
								>
									{appointment.treatment}
								</TableCell>

								<TableCell
									sx={{
										minHeight: '60px',
										textAlign: 'center',
										verticalAlign: 'middle',
										display: 'table-cell',
										alignItems: 'center',
									}}
								>
									{format(new Date(appointment.appointmentTime), 'PP')}
									<br />
									{format(new Date(appointment.appointmentTime), 'p')}
								</TableCell>

								<CollapsibleNotesCell notes={appointment.noteHistory} />

								<TableCell
									sx={{
										minHeight: '60px',
										display: 'table-cell',
										textAlign: 'center',
										verticalAlign: 'middle',
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
										padding: '8px',
										textAlign: 'center',
										verticalAlign: 'middle',
										width: '12%',
									}}
								>
									{appointment.status === 'pending' && (
										<Box
											sx={{
												display: 'inline-flex',
												justifyContent: 'center',
												gap: 1,
												'& .MuiIconButton-root': {
													padding: '4px',
												},
											}}
										>
											<Tooltip title="Approve Appointment" arrow>
												<IconButton
													size="small"
													color="success"
													onClick={() => {
														setSelectedAppointment(appointment);
														setApproveModalOpen(true);
													}}
												>
													<CheckCircleIcon fontSize="small" />
												</IconButton>
											</Tooltip>

											<Tooltip title="Reject Appointment" arrow>
												<IconButton
													size="small"
													color="error"
													onClick={() => {
														setSelectedAppointment(appointment);
														setRejectModalOpen(true);
													}}
												>
													<BlockIcon fontSize="small" />
												</IconButton>
											</Tooltip>

											{canCancel && (
												<Tooltip title="Cancel Appointment" arrow>
													<IconButton
														size="small"
														color="warning"
														onClick={() => handleCancel(appointment)}
													>
														<CancelIcon fontSize="small" />
													</IconButton>
												</Tooltip>
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
