import { PutItemCommand } from '@aws-sdk/client-dynamodb';
import { client } from '../../services/db.mjs';
import { v4 as uuidv4 } from 'uuid';
import { calcPrice } from '../../services/middleware/calcPrice.js';
import { sendResponse } from '../../services/utils/respons.js';
import {
	isValidDateFormat,
	isValidDate,
} from '../../services/utils/validateDate.js';

// const maxRooms = 20;

export const handler = async (event) => {
	//genererar ett id
	const id_unsorted = uuidv4();
	const id = id_unsorted.slice(0, 5);

	//hämtar vad användaren skrivit i body
	const booking = JSON.parse(event.body);

	//räknar ut totalpris
	const total = calcPrice(booking.rooms);

	//Validering

	// validerar guest

	if (typeof booking.guests !== 'number') {
		return sendResponse(400, {
			success: false,
			message: 'Guests must be a number',
		});
	} else if (!Number.isInteger(booking.guests)) {
		return sendResponse(400, {
			success: false,
			message: 'Guest must be a integer',
		});
	} else if (booking.guests < 0) {
		return sendResponse(400, {
			success: false,
			message: 'Guest must be a positive number',
		});
	}
	// validerar rooms

	const rooms = booking.rooms;
	for (let key in rooms) {
		const value = rooms[key];

		if (typeof value !== 'number') {
			// om value inte är ett nummer
			return sendResponse(400, {
				success: false,
				message: `${key} must be a number`,
			});
		}
		if (!Number.isInteger(value)) {
			// om value inte är ett heltal
			return sendResponse(400, {
				success: false,
				message: `${key} must be an integer`,
			});
		}
		if (value < 0) {
			// om value är <= 0
			return sendResponse(400, {
				success: false,
				message: `${key} must be positive`,
			});
		}
	}

	// validerar datum
	const timeStampIN = Date.parse(booking.dateIN);
	const dateObjectIN = new Date(timeStampIN);
	const timeStampOUT = Date.parse(booking.dateOUT);
	const dateObjectOUT = new Date(timeStampOUT);
	const today = new Date();

	// är dateIN formatet rätt och finns datumet
	if (!isValidDateFormat(booking.dateIN) || !isValidDate(booking.dateIN)) {
		return sendResponse(400, {
			success: false,
			message:
				'Invalid dateIN format. Please use YYYY-MM-DD or dateIN does not exist.',
		});
	}
	// är dateOUT formatet rätt och finns datumet
	if (!isValidDateFormat(booking.dateOUT) || !isValidDate(booking.dateOUT)) {
		return sendResponse(400, {
			success: false,
			message:
				'Invalid dateOUT format. Please use YYYY-MM-DD or dateOUT does not exist.',
		});
	}

	// Har dateIN eller dateOUT datum redan passerat
	if (dateObjectIN.getTime() < today.getTime()) {
		return sendResponse(400, {
			success: false,
			message: 'DateIN have already passed',
		});
	}
	if (dateObjectOUT.getTime() < today.getTime()) {
		return sendResponse(400, {
			success: false,
			message: 'DateOUT have already passed',
		});
	}
	// kollar så att dateOUT är efter dateIN
	if (timeStampOUT <= timeStampIN) {
		return sendResponse(400, {
			success: false,
			message: 'dateOUT must be after dateIN',
		});
	}

	// kollar så att name och mail finns
	if (
		!booking.name ||
		booking.name.trim() === '' ||
		!booking.mail ||
		booking.mail.trim() === ''
	) {
		return sendResponse(400, {
			success: false,
			message: 'Name and Email must be provided',
		});
	}

	// Gör en ny booking
	const command = new PutItemCommand({
		TableName: 'BonzAIDataTable',
		Item: {
			pk: { S: 'booking' },
			sk: { S: String(id) },
			guests: { N: booking.guests.toString() }, //number > string
			rooms: {
				M: {
					single: { N: (booking.rooms.single || 0).toString() },
					double: { N: (booking.rooms.double || 0).toString() },
					svite: { N: (booking.rooms.svite || 0).toString() },
				},
			},
			dateIN: { S: booking.dateIN },
			dateOUT: { S: booking.dateOUT },
			name: { S: booking.name },
			mail: { S: booking.mail },
			total: { N: total.toString() },
		},
	});

	await client.send(command);

	return sendResponse(200, {
		success: true,
		message: 'Booking Created',
		bookingId: id,
		name: booking.name,
		guests: booking.guests,
		rooms: booking.rooms,
		total: total,
		dateIN: booking.dateIN,
		dateOUT: booking.dateOUT,
	});
};
