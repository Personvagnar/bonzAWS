import {
	isValidDate,
	isValidDateFormat,
	validateBookingDates,
} from './validateDate.js';

export function validateBooking(booking) {
	if (!booking) {
		return { valid: false, message: 'Missing booking body' };
	}

	if (!booking.name || booking.name.trim() === '') {
		return { valid: false, message: 'Name is required' };
	}
	const nameRegex = /^[A-Za-z\s]+$/;
	if (!nameRegex.test(booking.name)) {
		return { valid: false, message: 'Name can only contain letters'};
	}

	if (!booking.mail || booking.mail.trim() === '') {
		return { valid: false, message: 'Email is required' };
	}

	if (!booking.mail.includes('@') || !booking.mail.includes('.')) {
		return { valid: false, message: 'Email must include @ and .' };
	}

	if (booking.date) {
		if (!isValidDateFormat(booking.date)) {
			return {
				valid: false,
				message: 'Date format is invalid, must be YYYY-MM-DD',
			};
		}
		if (!isValidDate(booking.date)) {
			return { valid: false, message: 'Date is invalid' };
		}
	}

	if (booking.dateIN && booking.dateOUT) {
		const { valid: datesValid, message: datesMessage } = validateBookingDates(
			booking.dateIN,
			booking.dateOUT
		);
		if (!datesValid) return { valid: false, message: datesMessage };
	}

	if (!booking.guests || isNaN(booking.guests) || booking.guests <= 0) {
		return { valid: false, message: 'Guests must be a positive number' };
	}

	if (!booking.rooms || typeof booking.rooms !== 'object') {
		return { valid: false, message: 'Rooms must be provided' };
	}

	const totalRooms =
		(booking.rooms.single || 0) +
		(booking.rooms.double || 0) +
		(booking.rooms.svite || 0);

	if (totalRooms <= 0) {
		return { valid: false, message: 'At least one room must be booked' };
	}

	return { valid: true };
}
