import React, { useState, useEffect } from 'react';
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
	Select,
	MenuItem,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	InputAdornment,
	Grid,
	TablePagination,
	Chip,
	TableSortLabel,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

function UserManagement() {
	const [users, setUsers] = useState([]);
	const [selectedUser, setSelectedUser] = useState(null);
	const [open, setOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(5);
	const [orderBy, setOrderBy] = useState('name');
	const [order, setOrder] = useState('asc');
	const [confirmationOpen, setConfirmationOpen] = useState(false);
	const [newRole, setNewRole] = useState('');

	useEffect(() => {
		fetchUsers();
	}, []);

	const fetchUsers = async () => {
		try {
			const response = await fetch('/api/users', {
				headers: {
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
			});
			if (response.ok) {
				const data = await response.json();
				setUsers(data);
			}
		} catch (error) {
			console.error('Error fetching users:', error);
		}
	};

	const handleRoleUpdate = async () => {
		try {
			const response = await fetch(`/api/users/${selectedUser?._id}/role`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
				body: JSON.stringify({ role: newRole }),
			});

			if (response.ok) {
				fetchUsers();
				handleCloseAll();
			}
		} catch (error) {
			console.error('Error updating user role:', error);
		}
	};

	// Handle close all modals
	const handleCloseAll = () => {
		setOpen(false);
		setConfirmationOpen(false);
		setSelectedUser(null);
		setNewRole('');
	};

	// Handle role selection
	const handleRoleSelection = (role) => {
		setNewRole(role);
		setConfirmationOpen(true);
	};

	// Sorting function
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

	// Compare function for sorting
	const compareValues = (a, b, property) => {
		if (typeof a[property] === 'string') {
			return a[property].localeCompare(b[property]);
		}
		return a[property] - b[property];
	};

	// Modified filtering and sorting logic
	const sortedAndFilteredUsers = React.useMemo(() => {
		const filtered = users.filter(
			(user) =>
				user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				user.email.toLowerCase().includes(searchTerm.toLowerCase())
		);

		if (!orderBy) return filtered;

		return [...filtered].sort((a, b) => {
			const result = compareValues(a, b, orderBy);
			return order === 'asc' ? result : -result;
		});
	}, [users, searchTerm, orderBy, order]);

	// Calculate paginated users from sorted results
	const paginatedUsers = sortedAndFilteredUsers.slice(
		page * rowsPerPage,
		page * rowsPerPage + rowsPerPage
	);

	// Handle page change
	const handleChangePage = (event, newPage) => {
		setPage(newPage);
	};

	// Handle rows per page change
	const handleChangeRowsPerPage = (event) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	// Get role chip color
	const getRoleColor = (role) => {
		switch (role) {
			case 'staff':
				return 'primary';
			case 'patient':
				return 'success';
			default:
				return 'default';
		}
	};

	return (
		<>
			<Grid container spacing={2} sx={{ mb: 3 }}>
				<Grid item xs={12}>
					<TextField
						fullWidth
						variant="outlined"
						laceholder="Search by name or email..."
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
			</Grid>

			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>
								<TableSortLabel
									active={orderBy === 'name'}
									direction={orderBy === 'name' ? order : 'asc'}
									onClick={() => handleRequestSort('name')}
								>
									Name
								</TableSortLabel>
							</TableCell>
							<TableCell>Email</TableCell>
							<TableCell>Phone</TableCell>
							<TableCell>Role</TableCell>
							<TableCell>Actions</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{paginatedUsers.map((user) => (
							<TableRow key={user._id}>
								<TableCell>{user.name}</TableCell>
								<TableCell>{user.email}</TableCell>
								<TableCell>{user.phone}</TableCell>
								<TableCell>
									<Chip
										label={
											user.role.charAt(0).toUpperCase() + user.role.slice(1)
										}
										color={getRoleColor(user.role)}
										size="small"
									/>
								</TableCell>
								<TableCell>
									<Button
										variant="contained"
										size="small"
										onClick={() => {
											setSelectedUser(user);
											setOpen(true);
										}}
									>
										Change Role
									</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
				<TablePagination
					rowsPerPageOptions={[5, 10, 25]}
					component="div"
					count={sortedAndFilteredUsers.length}
					rowsPerPage={rowsPerPage}
					page={page}
					onPageChange={handleChangePage}
					onRowsPerPageChange={handleChangeRowsPerPage}
					sx={{
						borderTop: '1px solid rgba(224, 224, 224, 1)',
						mt: 2,
					}}
				/>
			</TableContainer>

			{/* Role Change Modal */}
			<Dialog open={open} onClose={() => setOpen(false)}>
				<DialogTitle>Change User Role</DialogTitle>
				<DialogContent sx={{ minWidth: 300, mt: 2 }}>
					<Typography variant="body2" sx={{ mb: 2 }}>
						Select new role for user: {selectedUser?.name}
					</Typography>
					<Select
						value={selectedUser?.role || ''}
						onChange={(e) => handleRoleSelection(e.target.value)}
						fullWidth
					>
						<MenuItem value="patient">Patient</MenuItem>
						<MenuItem value="staff">Staff</MenuItem>
					</Select>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setOpen(false)}>Cancel</Button>
				</DialogActions>
			</Dialog>

			{/* Confirmation Modal */}
			<Dialog
				open={confirmationOpen}
				onClose={() => setConfirmationOpen(false)}
			>
				<DialogTitle>Confirm Role Change</DialogTitle>
				<DialogContent>
					<Typography variant="body1" sx={{ mb: 2 }}>
						Are you sure you want to change the role of {selectedUser?.name}{' '}
						from{' '}
						<Chip
							label={
								selectedUser?.role.charAt(0).toUpperCase() +
								selectedUser?.role.slice(1)
							}
							color={getRoleColor(selectedUser?.role)}
							size="small"
							sx={{ mx: 1 }}
						/>
						to{' '}
						<Chip
							label={newRole.charAt(0).toUpperCase() + newRole.slice(1)}
							color={getRoleColor(newRole)}
							size="small"
							sx={{ mx: 1 }}
						/>
						?
					</Typography>
					<Typography variant="body2" color="warning.main">
						This action will change the user's permissions and access level.
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setConfirmationOpen(false)}>Cancel</Button>
					<Button
						onClick={handleRoleUpdate}
						variant="contained"
						color="primary"
					>
						Confirm Change
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}

export default UserManagement;
