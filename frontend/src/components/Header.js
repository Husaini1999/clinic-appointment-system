import React from 'react';
import {
	AppBar,
	Container,
	Toolbar,
	Typography,
	useScrollTrigger,
	Slide,
} from '@mui/material';
import Navbar from './Navbar';

const Header = () => {
	function HideOnScroll({ children }) {
		const trigger = useScrollTrigger();
		return (
			<Slide appear={false} direction="down" in={!trigger}>
				{children}
			</Slide>
		);
	}
	return (
		<HideOnScroll>
			<AppBar
				position="sticky"
				sx={{
					bgcolor: 'rgba(255, 255, 255, 0.95)',
					backdropFilter: 'blur(8px)',
					boxShadow: '0 2px 20px rgba(0,0,0,0.05)',
					borderBottom: '1px solid rgba(0,0,0,0.05)',
				}}
			>
				<Container maxWidth="xl">
					<Toolbar
						disableGutters
						sx={{
							height: 70,
							display: 'flex',
							justifyContent: 'space-between',
						}}
					>
						<Typography
							variant="h6"
							component="div"
							sx={{
								cursor: 'pointer',
								color: 'primary.main',
								fontWeight: 700,
								fontSize: '1.5rem',
								letterSpacing: '-0.5px',
							}}
						>
							Primer Cherang Clinic
						</Typography>
						<Navbar />
					</Toolbar>
				</Container>
			</AppBar>
		</HideOnScroll>
	);
};

export default Header;
