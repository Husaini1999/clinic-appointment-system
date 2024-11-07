import React, { useState } from 'react';
import {
	Box,
	Button,
	Modal,
	Typography,
	TextField,
	IconButton,
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

const Chatbot = () => {
	const [open, setOpen] = useState(false);
	const [userInput, setUserInput] = useState('');
	const [responses, setResponses] = useState([]);

	const handleOpen = () => setOpen(true);
	const handleClose = () => setOpen(false);

	const handleUserInputChange = (e) => {
		setUserInput(e.target.value);
	};

	const handleSend = () => {
		if (userInput.trim()) {
			// Add user input to responses
			setResponses((prev) => [...prev, { text: userInput, sender: 'user' }]);
			// Simulate AI response
			const aiResponse = getAIResponse(userInput);
			setResponses((prev) => [...prev, { text: aiResponse, sender: 'ai' }]);
			setUserInput(''); // Clear input field
		}
	};

	const getAIResponse = (input) => {
		// Basic AI response logic
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

	return (
		<>
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
						overflowY: 'auto',
						p: 2,
					}}
				>
					<Box
						sx={{
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
						}}
					>
						<Box sx={{ display: 'flex', alignItems: 'center' }}>
							<SupportAgentIcon sx={{ mr: 1 }} />
							<Typography variant="h6" component="h2">
								Chat with Our Virtual Assistant
							</Typography>
						</Box>
						<IconButton onClick={handleClose}>
							<CloseIcon />
						</IconButton>
					</Box>
					<Box sx={{ mt: 2, mb: 2 }}>
						{responses.map((response, index) => (
							<Typography
								key={index}
								sx={{
									textAlign: response.sender === 'user' ? 'right' : 'left',
									mb: 1,
									bgcolor:
										response.sender === 'user' ? 'primary.light' : 'grey.200',
									color: response.sender === 'user' ? 'white' : 'black',
									borderRadius: '8px',
									padding: '8px',
									maxWidth: '80%',
									marginLeft: response.sender === 'user' ? 'auto' : '0',
								}}
							>
								{response.text}
							</Typography>
						))}
					</Box>
					<TextField
						fullWidth
						label="Type your message..."
						value={userInput}
						onChange={handleUserInputChange}
						onKeyPress={(e) => {
							if (e.key === 'Enter') {
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
				</Box>
			</Modal>
		</>
	);
};

export default Chatbot;
