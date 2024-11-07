import React from 'react';
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Booking from './components/Booking';
import Navbar from './components/Navbar';
import Homepage from './components/Homepage';

const theme = createTheme({
	palette: {
		primary: {
			main: '#1A1A1A',
			light: '#2C2C2C',
			dark: '#000000',
			contrastText: '#ffffff',
		},
		secondary: {
			main: '#DC2626',
			light: '#EF4444',
			dark: '#B91C1C',
			contrastText: '#ffffff',
		},
		background: {
			default: '#F9FAFB',
			paper: '#FFFFFF',
		},
		text: {
			primary: '#1A1A1A',
			secondary: '#4B5563',
		},
	},
	typography: {
		fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
		h1: {
			fontWeight: 700,
			fontSize: '3.5rem',
			lineHeight: 1.2,
		},
		h2: {
			fontWeight: 600,
			fontSize: '2.5rem',
			lineHeight: 1.3,
		},
		h3: {
			fontWeight: 600,
			fontSize: '2rem',
			lineHeight: 1.4,
		},
		body1: {
			fontSize: '1rem',
			lineHeight: 1.6,
		},
	},
	components: {
		MuiButton: {
			styleOverrides: {
				root: {
					borderRadius: 8,
					textTransform: 'none',
					padding: '8px 24px',
					fontSize: '1rem',
					transition: 'all 0.2s ease-in-out',
					'&:hover': {
						transform: 'translateY(-2px)',
						boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
					},
				},
				contained: {
					boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
				},
			},
		},
		MuiPaper: {
			styleOverrides: {
				root: {
					borderRadius: 12,
					boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
				},
			},
		},
	},
});

const PrivateRoute = ({ children }) => {
	const token = localStorage.getItem('token');
	return token ? children : <Navigate to="/login" />;
};

function App() {
	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<Router>
				<Navbar />
				<Routes>
					<Route path="/" element={<Homepage />} />
					<Route path="/login" element={<Login />} />
					<Route
						path="/dashboard"
						element={
							<PrivateRoute>
								<Dashboard />
							</PrivateRoute>
						}
					/>
					<Route
						path="/booking"
						element={
							<PrivateRoute>
								<Booking />
							</PrivateRoute>
						}
					/>
				</Routes>
			</Router>
		</ThemeProvider>
	);
}

export default App;
