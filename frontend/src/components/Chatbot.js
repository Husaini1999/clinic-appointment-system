import React, { useState, useEffect, useRef } from 'react';
import {
	Box,
	Button,
	createTheme,
	Modal,
	Typography,
	TextField,
	IconButton,
	ToggleButtonGroup,
	ToggleButton,
	ThemeProvider,
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import PersonIcon from '@mui/icons-material/Person';

const Chatbot = () => {
	const [open, setOpen] = useState(false);
	const [userInput, setUserInput] = useState('');
	const [responses, setResponses] = useState([]);
	const [welcomeMessageShown, setWelcomeMessageShown] = useState(false);
	const [mode, setMode] = useState('faq');
	const chatHistoryRef = useRef(null);

	const theme = createTheme({
		palette: {
			primary: {
				main: '#000000', // Dark gray for main backgrounds (softer than black)
				light: '#B3B3B3', // Medium-light gray for subtle backgrounds
				dark: '#1A1A1A', // Almost black for stronger emphasis
				contrastText: '#FFFFFF', // Friendly blue for contrasting text, user-friendly
			},
		},
	});

	const handleOpen = () => {
		setOpen(true);
		if (!welcomeMessageShown) {
			setResponses([
				{
					text: 'Welcome to our AI virtual assistant chatbot! We are here to help you. How may I assist you today?',
					sender: 'ai',
				},
			]);
			setWelcomeMessageShown(true);
		}
	};

	const handleClose = () => setOpen(false);

	const handleUserInputChange = (e) => {
		setUserInput(e.target.value);
	};

	const handleSend = () => {
		if (userInput.trim()) {
			setResponses((prev) => [...prev, { text: userInput, sender: 'user' }]);
			const aiResponse = getAIResponse(userInput);
			setResponses((prev) => [...prev, { text: aiResponse, sender: 'ai' }]);
			setUserInput('');
		}
	};

	const handleCategoryClick = (category) => {
		let response;
		switch (category) {
			case 'Appointment':
				response =
					'You can book an appointment by clicking the "Book Appointment" button on our homepage.';
				break;
			case 'Services':
				response =
					'We offer a variety of services including general health checkups, dental care, and physiotherapy.';
				break;
			case 'Location':
				response =
					'We are located at 123 Cherang Street, Kuala Lumpur, 50450, Malaysia.';
				break;
			case 'Contact':
				response =
					'You can reach us at info@primercherang.com or call us at +60 3-1234 5678.';
				break;
			default:
				response =
					'I am sorry, I did not understand that. Can you please rephrase?';
		}

		setResponses((prev) => [...prev, { text: category, sender: 'user' }]);
		setResponses((prev) => [...prev, { text: response, sender: 'ai' }]);
	};

	const getAIResponse = (input) => {
		const lowerInput = input.toLowerCase();
		if (lowerInput.includes('appointment')) {
			return 'You can book an appointment by clicking the "Book Appointment" button on our homepage.';
		} else if (lowerInput.includes('services')) {
			return 'We offer a variety of services including general health checkups, dental care, and physiotherapy.';
		} else if (lowerInput.includes('location')) {
			return 'We are located at 123 Cherang Street, Kuala Lumpur, 50450, Malaysia.';
		} else if (lowerInput.includes('contact')) {
			return 'You can reach us at info@primercherang.com or call us at +60 3-1234 5678.';
		} else {
			return 'I am sorry, I did not understand that. Can you please rephrase?';
		}
	};

	const handleModeChange = (event) => {
		setMode(event.target.value);
	};

	const categories = [
		{ label: 'Appointments', value: 'Appointment' },
		{ label: 'Services', value: 'Services' },
		{ label: 'Location', value: 'Location' },
		{ label: 'Contact', value: 'Contact' },
	];

	useEffect(() => {
		if (chatHistoryRef.current) {
			chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
		}
	}, [responses]);

	return (
		<ThemeProvider theme={theme}>
			<Button
				variant="contained"
				color="primary"
				sx={{
					position: 'fixed',
					bottom: 20,
					right: 20,
					borderRadius: '50%',
					width: '60px',
					height: '60px',
					boxShadow: 3,
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					transition: 'background-color 0.3s, transform 0.3s',
					zIndex: 1000,
					'&:hover': {
						backgroundColor: 'secondary.main',
						transform: 'scale(1.1)',
					},
				}}
				onClick={handleOpen}
			>
				<ChatIcon sx={{ fontSize: 30, color: 'white' }} />
			</Button>
			<Modal open={open} onClose={handleClose}>
				<Box
					sx={{
						position: 'fixed',
						bottom: 100,
						right: 20,
						bgcolor: 'background.paper',
						boxShadow: 3,
						borderRadius: 2,
						width: '400px',
						maxHeight: '80vh',
						display: 'flex',
						flexDirection: 'column', // Stack children vertically
					}}
				>
					{/* Sticky Header */}
					<Box
						sx={{
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
							position: 'sticky',
							top: 0,
							backgroundColor: 'background.paper',
							zIndex: 1,
							borderBottom: '1px solid black',
							p: 1, // Add some padding for better spacing
						}}
					>
						<Box sx={{ display: 'flex', alignItems: 'center' }}>
							<SupportAgentIcon sx={{ mr: 1 }} />
							<Typography variant="subtitle1" component="h2">
								Chat with Our Virtual Assistant
							</Typography>
						</Box>
						<Box sx={{ display: 'flex', alignItems: 'center' }}>
							<ToggleButtonGroup
								color="primary"
								value={mode}
								exclusive
								onChange={handleModeChange}
								sx={{ m: 1 }}
							>
								<ToggleButton value="faq">FAQ</ToggleButton>
								<ToggleButton value="ai">AI</ToggleButton>
							</ToggleButtonGroup>
						</Box>
						<IconButton onClick={handleClose}>
							<CloseIcon />
						</IconButton>
					</Box>

					{/* Scrollable Chat History Area */}
					<Box
						ref={chatHistoryRef}
						sx={{
							flex: 1,
							overflowY: 'auto',
							p: 2,
						}}
					>
						{responses.map((response, index) => (
							<Box
								key={index}
								sx={{
									display: 'flex',
									alignItems: 'center',
									justifyContent:
										response.sender === 'user' ? 'flex-end' : 'flex-start',
									mb: 1,
								}}
							>
								{response.sender === 'ai' && (
									<SupportAgentIcon sx={{ mr: 1 }} />
								)}
								<Typography
									sx={{
										bgcolor:
											response.sender === 'user' ? 'grey.900' : 'grey.200',
										color: response.sender === 'user' ? 'white' : 'black',
										borderRadius: '8px',
										padding: '8px',
										maxWidth: '80%',
										marginLeft: '0',
									}}
								>
									{response.text}
								</Typography>
								{response.sender === 'user' && <PersonIcon sx={{ ml: 1 }} />}
							</Box>
						))}
					</Box>

					{/* Sticky Footer for Category Buttons */}
					<Box
						sx={{
							display: 'flex',
							justifyContent: 'space-between',

							flexWrap: 'wrap',
							backgroundColor: 'background.paper',
							p: 1, // Add some padding for better spacing
							borderTop: '1px solid black',
						}}
					>
						{mode === 'faq' && (
							<>
								{categories.map((category, index) => (
									<Button
										key={index}
										variant="outlined"
										onClick={() => handleCategoryClick(category.value)}
										sx={{
											flex: '1 1 45%', // Allow buttons to grow and shrink, with a base width of 45%
											mr: index % 2 === 0 ? 1 : 0, // Add margin-right for even indexed buttons
											ml: index % 2 === 1 ? 1 : 0, // Add margin-left for odd indexed buttons
											mb: 1,
											bgcolor: 'primary.main',
											color: 'primary.contrastText',
											'&:hover': { bgcolor: 'primary.light' },
										}}
									>
										{category.label}
									</Button>
								))}
							</>
						)}
						{mode === 'ai' && (
							<>
								<TextField
									fullWidth
									label="Type your message..."
									value={userInput}
									onChange={handleUserInputChange}
									onKeyPress={(e) => {
										if (e.key === 'Enter' && mode === 'ai') {
											handleSend();
										}
									}}
								/>
								<Button
									variant="contained"
									color="primary"
									sx={{ mt: 2 }}
									onClick={handleSend}
								>
									Send
								</Button>
							</>
						)}
					</Box>
				</Box>
			</Modal>
		</ThemeProvider>
	);
};

export default Chatbot;
