import React from 'react';
import { Button, Box } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

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

	// Define navigation items
	const navItems = [
		{ label: 'Home', path: '/' },
		{ label: 'About Us', path: '/#about' },
		{ label: 'Services', path: '/#services' },
		{ label: 'Contact', path: '/#contact' },
	];

	return (
		<Box
			sx={{
				display: 'flex',
				gap: { xs: 1, md: 2 },
				alignItems: 'center',
			}}
		>
			{navItems.map((item) => (
				<Button
					key={item.label}
					color="primary"
					onClick={() => handleNavigation(item.path)}
					sx={{
						fontWeight: 500,
						px: 1,
						color: 'text.primary',
						'&:hover': {
							backgroundColor: 'rgba(0,0,0,0.05)',
						},
					}}
				>
					{item.label}
				</Button>
			))}

			{user ? (
				// Logged in navigation
				<>
					<Box
						sx={{
							border: '1px solid',
							borderColor: 'primary.main',
							borderRadius: '8px',
							padding: '4px',
						}}
					>
						<Button
							color="primary"
							onClick={() => handleNavigation('/dashboard')}
							sx={{
								fontWeight: 500,
								px: 1,
								color: 'text.primary',
								'&:hover': {
									backgroundColor: 'rgba(0,0,0,0.05)',
								},
							}}
						>
							<DashboardIcon sx={{ mr: 1 }} />
							Dashboard
						</Button>
						<Button
							color="primary"
							onClick={() => handleNavigation('/booking')}
							sx={{
								fontWeight: 500,
								px: 1,
								color: 'text.primary',
								'&:hover': {
									backgroundColor: 'rgba(0,0,0,0.05)',
								},
							}}
						>
							<CalendarTodayIcon sx={{ mr: 1 }} />
							Book Appointment
						</Button>
					</Box>
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
						color="secondary"
						variant="contained"
						onClick={() => handleNavigation('/login')}
						sx={{
							fontWeight: 500,
							px: 1,
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
