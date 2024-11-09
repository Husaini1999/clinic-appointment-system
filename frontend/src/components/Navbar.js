import React from 'react';
import { Button, Box } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

function Navbar() {
	const navigate = useNavigate();
	const location = useLocation();
	const user = JSON.parse(localStorage.getItem('user'));

	const handleNavigation = (path) => {
		if (path.startsWith('/#')) {
			const element = document.getElementById(path.substring(2));
			if (element) {
				element.scrollIntoView({ behavior: 'smooth' });
			} else if (location.pathname !== '/') {
				navigate('/', { state: { scrollTo: path.substring(2) } });
			}
		} else {
			navigate(path);
		}
	};

	const handleLogout = () => {
		localStorage.removeItem('token');
		localStorage.removeItem('user');
		navigate('/');
	};

	return (
		<Box
			sx={{
				display: 'flex',
				gap: { xs: 1, md: 2 },
				alignItems: 'center',
			}}
		>
			{user ? (
				// Logged in navigation
				<>
					<Button
						color="primary"
						onClick={() => handleNavigation('/dashboard')}
						sx={{
							fontWeight: 500,
							px: 3,
							color: 'text.primary',
							'&:hover': {
								backgroundColor: 'rgba(0,0,0,0.05)',
							},
						}}
					>
						Dashboard
					</Button>
					<Button
						color="primary"
						onClick={() => handleNavigation('/booking')}
						sx={{
							fontWeight: 500,
							px: 3,
							color: 'text.primary',
							'&:hover': {
								backgroundColor: 'rgba(0,0,0,0.05)',
							},
						}}
					>
						Book Appointment
					</Button>
					<Button
						color="secondary"
						variant="contained"
						onClick={handleLogout}
						sx={{
							fontWeight: 500,
							px: 3,
							borderRadius: '50px',
							boxShadow: 'none',
							'&:hover': {
								boxShadow: '0 4px 12px rgba(220,38,38,0.2)',
								backgroundColor: 'secondary.dark',
							},
						}}
					>
						Logout
					</Button>
				</>
			) : (
				// Public navigation
				<>
					<Button
						color="primary"
						onClick={() => handleNavigation('/')}
						sx={{
							fontWeight: 500,
							px: 3,
							color: 'text.primary',
							'&:hover': {
								backgroundColor: 'rgba(0,0,0,0.05)',
							},
						}}
					>
						Home
					</Button>
					<Button
						color="primary"
						onClick={() => handleNavigation('/#about')}
						sx={{
							fontWeight: 500,
							px: 3,
							color: 'text.primary',
							'&:hover': {
								backgroundColor: 'rgba(0,0,0,0.05)',
							},
						}}
					>
						About us
					</Button>
					<Button
						color="primary"
						onClick={() => handleNavigation('/#services')}
						sx={{
							fontWeight: 500,
							px: 3,
							color: 'text.primary',
							'&:hover': {
								backgroundColor: 'rgba(0,0,0,0.05)',
							},
						}}
					>
						Services
					</Button>
					<Button
						color="primary"
						onClick={() => handleNavigation('/#contact')}
						sx={{
							fontWeight: 500,
							px: 3,
							color: 'text.primary',
							'&:hover': {
								backgroundColor: 'rgba(0,0,0,0.05)',
							},
						}}
					>
						Contact
					</Button>
					<Button
						color="secondary"
						variant="contained"
						onClick={() => handleNavigation('/login')}
						sx={{
							fontWeight: 500,
							px: 3,
							ml: { xs: 1, md: 2 },
							borderRadius: '50px',
							boxShadow: 'none',
							'&:hover': {
								boxShadow: '0 4px 12px rgba(220,38,38,0.2)',
								backgroundColor: 'secondary.dark',
							},
						}}
					>
						Login
					</Button>
				</>
			)}
		</Box>
	);
}

export default Navbar;
