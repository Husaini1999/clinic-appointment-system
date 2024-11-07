import React, { useState } from 'react';
import { Box, Button, Modal, Typography } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';

const Chatbot = () => {
	const [open, setOpen] = useState(false);

	const handleOpen = () => setOpen(true);
	const handleClose = () => setOpen(false);

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
						position: 'absolute',
						top: '50%',
						left: '50%',
						transform: 'translate(-50%, -50%)',
						bgcolor: 'background.paper',
						boxShadow: 24,
						p: 4,
						borderRadius: 2,
						width: '400px',
					}}
				>
					<Typography variant="h6" component="h2">
						AI Chatbot
					</Typography>
					<Typography sx={{ mt: 2 }}>How can I assist you today?</Typography>
					{/* Add your chatbot logic here */}
				</Box>
			</Modal>
		</>
	);
};

export default Chatbot;
