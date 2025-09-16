import { PutItemCommand } from '@aws-sdk/client-dynamodb';
import { client } from '../../services/db.mjs';
import { v4 as uuidv4 } from 'uuid';
import { calcPrice } from '../../services/middleware/calcPrice.js';
import { sendResponse } from '../../services/utils/respons.js';
import { validateBooking } from '../../services/middleware/validateBooking.js';

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
    const { valid, message } = validateBooking(booking);
		if (!valid) {
		return sendResponse(400, {
			success: false,
			message,
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
