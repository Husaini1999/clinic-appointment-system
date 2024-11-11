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
} from '@mui/material';

function UserManagement() {
	const [users, setUsers] = useState([]);
	const [selectedUser, setSelectedUser] = useState(null);
	const [open, setOpen] = useState(false);

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

	const handleRoleUpdate = async (userId, newRole) => {
		try {
			const response = await fetch(`/api/users/${userId}/role`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
				body: JSON.stringify({ role: newRole }),
			});

			if (response.ok) {
				fetchUsers();
				setOpen(false);
			}
		} catch (error) {
			console.error('Error updating user role:', error);
		}
	};

	return (
		<>
			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>Name</TableCell>
							<TableCell>Email</TableCell>
							<TableCell>Phone</TableCell>
							<TableCell>Role</TableCell>
							<TableCell>Actions</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{users.map((user) => (
							<TableRow key={user._id}>
								<TableCell>{user.name}</TableCell>
								<TableCell>{user.email}</TableCell>
								<TableCell>{user.phone}</TableCell>
								<TableCell>{user.role}</TableCell>
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
			</TableContainer>

			<Dialog open={open} onClose={() => setOpen(false)}>
				<DialogTitle>Change User Role</DialogTitle>
				<DialogContent>
					<Select
						value={selectedUser?.role || ''}
						onChange={(e) =>
							handleRoleUpdate(selectedUser?._id, e.target.value)
						}
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
		</>
	);
}

export default UserManagement;
