import React, { useState } from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	Button,
	Typography,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Alert,
	Box,
	Stepper,
	Step,
	StepLabel,
	IconButton,
	useTheme,
	useMediaQuery,
	Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { addDays, set, format, isBefore, startOfDay } from 'date-fns';
import InfoIcon from '@mui/icons-material/Info';
import { isValidPhoneNumber } from 'libphonenumber-js'; // Ensure this import is present

function BookingModal({ open, onClose }) {
	const theme = useTheme();
	const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
	const [activeStep, setActiveStep] = useState(0);
	const [formData, setFormData] = useState({
		treatment: '',
		appointmentTime: null,
		notes: '',
		name: '',
		email: '',
		phone: '',
	});
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [emailError, setEmailError] = useState('');
	const [phoneError, setPhoneError] = useState('');

	const steps = [
		'Personal Details',
		'Select Service',
		'Choose Date and Time',
		'Additional Information',
	];

	const handleNext = () => {
		if (activeStep === steps.length - 1) {
			handleSubmit();
		} else {
			setActiveStep((prevStep) => prevStep + 1);
		}
	};

	const handleBack = () => {
		setActiveStep((prevStep) => prevStep - 1);
	};

	const isWeekday = (date) => {
		if (!date) return false;
		const day = date.getDay();
		return day !== 0 && day !== 6;
	};

	const isWithinBusinessHours = (date) => {
		if (!date) return false;
		const hours = date.getHours();
		const minutes = date.getMinutes();
		return hours >= 9 && (hours < 17 || (hours === 17 && minutes === 0));
	};

	const isValidAppointmentTime = (date) => {
		if (!date) return false;

		// Check if date is in the past
		if (isBefore(date, startOfDay(new Date()))) {
			return false;
		}

		// Check if it's a weekday
		if (!isWeekday(date)) {
			return false;
		}

		// Check if within business hours
		if (!isWithinBusinessHours(date)) {
			return false;
		}

		return true;
	};

	const getTimeSlots = () => {
		const slots = [];
		const startHour = 9;
		const endHour = 17;
		const interval = 30; // minutes

		for (let hour = startHour; hour <= endHour; hour++) {
			for (let minute = 0; minute < 60; minute += interval) {
				if (hour === endHour && minute > 0) break;
				slots.push(
					format(set(new Date(), { hours: hour, minutes: minute }), 'hh:mm a')
				);
			}
		}
		return slots;
	};

	const handleSubmit = async () => {
		if (
			!formData.appointmentTime ||
			!isValidAppointmentTime(formData.appointmentTime)
		) {
			setError('Please select a valid appointment time.');
			return; // Prevent submission if the appointment time is invalid
		}

		try {
			const response = await fetch('/api/appointments/public', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(formData),
			});

			const data = await response.json();

			if (response.ok) {
				setSuccess(
					'Appointment booked successfully! We will send a confirmation email shortly.'
				);
				setTimeout(() => {
					onClose();
					setFormData({
						treatment: '',
						appointmentTime: null,
						notes: '',
						name: '',
						email: '',
						phone: '',
					});
					setActiveStep(0);
				}, 3000);
			} else {
				setError(data.message);
			}
		} catch (err) {
			setError('An error occurred. Please try again.');
		}
	};

	const handleEmailChange = (e) => {
		const emailValue = e.target.value;
		setFormData({ ...formData, email: emailValue });

		// Validate email live
		if (!isValidEmail(emailValue)) {
			setEmailError(
				'Please enter a valid email address. Example: user@example.com'
			);
		} else {
			setEmailError('');
		}
	};

	const handlePhoneChange = (e) => {
		const phoneValue = e.target.value;
		setFormData({ ...formData, phone: phoneValue });

		// Validate phone live
		if (!isValidPhone(phoneValue)) {
			setPhoneError('Please enter a valid phone number. Example: +60123456789');
		} else {
			setPhoneError('');
		}
	};

	const isValidEmail = (email) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	};

	const isValidPhone = (phone) => {
		return isValidPhoneNumber(phone);
	};

	const getStepContent = (step) => {
		switch (step) {
			case 0:
				return (
					<Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
						<TextField
							fullWidth
							label="Full Name"
							value={formData.name}
							onChange={(e) =>
								setFormData({ ...formData, name: e.target.value })
							}
							required
						/>
						<TextField
							fullWidth
							label="Email"
							type="email"
							value={formData.email}
							onChange={handleEmailChange} // Use the new handler
							error={!!emailError} // Show error state
							helperText={emailError} // Show error message
							required
						/>
						<TextField
							fullWidth
							label="Phone Number"
							value={formData.phone}
							onChange={handlePhoneChange} // Use the new handler
							error={!!phoneError} // Show error state
							helperText={phoneError} // Show error message
							required
						/>
					</Box>
				);
			case 1:
				return (
					<FormControl fullWidth sx={{ mt: 2 }}>
						<InputLabel>Select Treatment</InputLabel>
						<Select
							value={formData.treatment}
							label="Select Treatment"
							onChange={(e) =>
								setFormData({ ...formData, treatment: e.target.value })
							}
							required
						>
							<MenuItem value="General Checkup">General Checkup</MenuItem>
							<MenuItem value="Dental Care">Dental Care</MenuItem>
							<MenuItem value="Physiotherapy">Physiotherapy</MenuItem>
							<MenuItem value="Pediatric Care">Pediatric Care</MenuItem>
							<MenuItem value="Vaccination">Vaccination</MenuItem>
							<MenuItem value="Geriatric Care">Geriatric Care</MenuItem>
						</Select>
					</FormControl>
				);
			case 2:
				return (
					<LocalizationProvider dateAdapter={AdapterDateFns}>
						<Box sx={{ mt: 2 }}>
							<Box
								sx={{
									mb: 2,
									bgcolor: '#000',
									p: 3,
									borderRadius: 1,
									boxShadow: 2,
								}}
							>
								<Typography
									variant="h6"
									color="#FF5733"
									sx={{
										display: 'flex',
										alignItems: 'center',
										gap: 1,
										fontWeight: 'bold',
									}}
								>
									<InfoIcon fontSize="small" sx={{ color: '#FF5733' }} />
									Appointment Guidelines:
								</Typography>
								<Typography variant="body1" color="#FF5733" sx={{ mt: 1 }}>
									<ul>
										<li>Available Monday-Friday, 9:00 AM - 5:00 PM</li>
										<li>Appointments are scheduled in 30-minute slots</li>
										<li>Please arrive 10 minutes before your appointment</li>
										<li>Bookings can be made up to 30 days in advance</li>
									</ul>
								</Typography>
							</Box>

							<DatePicker
								label="Select Appointment Date"
								value={formData.appointmentTime}
								onChange={(newValue) => {
									setFormData({ ...formData, appointmentTime: newValue });
								}}
								shouldDisableDate={(date) => !isWeekday(date)}
								minDate={new Date()}
								maxDate={addDays(new Date(), 30)}
								views={['year', 'month', 'day']}
								slotProps={{
									textField: {
										fullWidth: true,
										required: true,
										error:
											formData.appointmentTime &&
											!isValidAppointmentTime(formData.appointmentTime),
										helperText:
											formData.appointmentTime &&
											!isValidAppointmentTime(formData.appointmentTime)
												? 'Please select a valid appointment time'
												: '',
									},
								}}
							/>

							<Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
								<Typography
									variant="subtitle2"
									color="text.secondary"
									sx={{ width: '100%' }}
								>
									Available Time Slots:
								</Typography>
								{getTimeSlots().map((slot) => (
									<Tooltip
										key={slot}
										title={
											isWeekday(formData.appointmentTime)
												? 'Click to select this time'
												: 'Not available on weekends'
										}
									>
										<span>
											<Button
												size="small"
												variant={
													formData.appointmentTime &&
													format(formData.appointmentTime, 'hh:mm a') === slot
														? 'contained'
														: 'outlined'
												}
												color="primary"
												onClick={() => {
													if (formData.appointmentTime) {
														const newDate = set(formData.appointmentTime, {
															hours: parseInt(slot.split(':')[0]),
															minutes: parseInt(slot.split(':')[1]),
														});
														setFormData({
															...formData,
															appointmentTime: newDate,
														});
													}
												}}
												disabled={
													!formData.appointmentTime ||
													!isWeekday(formData.appointmentTime)
												}
												sx={{
													minWidth: '90px',
													fontSize: '0.875rem',
												}}
											>
												{slot}
											</Button>
										</span>
									</Tooltip>
								))}
							</Box>
						</Box>
					</LocalizationProvider>
				);
			case 3:
				return (
					<TextField
						fullWidth
						multiline
						rows={4}
						label="Additional Notes"
						value={formData.notes}
						onChange={(e) =>
							setFormData({ ...formData, notes: e.target.value })
						}
						placeholder="Please provide any additional information or specific concerns..."
						sx={{ mt: 2 }}
					/>
				);
			default:
				return 'Unknown step';
		}
	};

	const isStepValid = (step) => {
		switch (step) {
			case 0:
				return (
					formData.name &&
					formData.email &&
					formData.phone &&
					!emailError &&
					!phoneError
				);
			case 1:
				return formData.treatment;
			case 2:
				return (
					formData.appointmentTime &&
					isValidAppointmentTime(formData.appointmentTime)
				);
			case 3:
				return true; // Notes are optional
			default:
				return false;
		}
	};

	return (
		<Dialog
			open={open}
			onClose={onClose}
			fullScreen={fullScreen}
			maxWidth="sm"
			fullWidth
		>
			<DialogTitle
				sx={{
					m: 0,
					p: 2,
					bgcolor: 'primary.main',
					color: 'white',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
				}}
			>
				<Typography variant="h6" component="div">
					Book an Appointment
				</Typography>
				<IconButton
					onClick={onClose}
					sx={{
						color: 'white',
						'&:hover': {
							bgcolor: 'rgba(255,255,255,0.1)',
						},
					}}
				>
					<CloseIcon />
				</IconButton>
			</DialogTitle>

			<DialogContent sx={{ mt: 2, p: 3 }}>
				{(error || success) && (
					<Alert
						severity={error ? 'error' : 'success'}
						sx={{ mb: 3 }}
						onClose={() => {
							setError('');
							setSuccess('');
						}}
					>
						{error || success}
					</Alert>
				)}

				<Stepper
					activeStep={activeStep}
					sx={{
						mb: 4,
						'& .MuiStepLabel-root .Mui-completed': {
							color: 'secondary.main',
						},
						'& .MuiStepLabel-root .Mui-active': {
							color: 'secondary.main',
						},
					}}
				>
					{steps.map((label) => (
						<Step key={label}>
							<StepLabel>{label}</StepLabel>
						</Step>
					))}
				</Stepper>

				<Box sx={{ minHeight: '200px' }}>{getStepContent(activeStep)}</Box>
			</DialogContent>

			<DialogActions sx={{ p: 3, gap: 1 }}>
				<Button
					disabled={activeStep === 0}
					onClick={handleBack}
					variant="outlined"
					sx={{
						borderRadius: '50px',
						px: 3,
					}}
				>
					Back
				</Button>
				<Button
					variant="contained"
					onClick={handleNext}
					disabled={!isStepValid(activeStep)}
					sx={{
						borderRadius: '50px',
						px: 4,
						bgcolor: 'secondary.main',
						'&:hover': {
							bgcolor: 'secondary.dark',
						},
					}}
				>
					{activeStep === steps.length - 1 ? 'Book Appointment' : 'Next'}
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export default BookingModal;
