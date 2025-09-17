import { PutItemCommand, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { client } from '../../services/db.mjs';
import { calcPrice } from '../../services/middleware/calcPrice.js';
import { checkAvailability } from '../../services/middleware/checkAvailability.js';
import { sendResponse } from '../../services/utils/respons.js';
import { validateBooking } from '../../services/middleware/validateBooking.js';

export const handler = async (event) => {
	console.log(event);
	try {
		const id = event.pathParameters.id;
		const booking = JSON.parse(event.body);
		const total = calcPrice(booking.rooms);
		const updatedAt = new Date().toISOString();

		const { valid, message } = validateBooking(booking);
		if (!valid) {
			return sendResponse(400, {
				success: false,
				message,
			});
		}

		const existsResult = await client.send(
			new GetItemCommand({
				TableName: 'BonzAIDataTable',
				Key: {
					pk: { S: 'booking' },
					sk: { S: String(id) },
				},
			})
		);

		const exists = existsResult.Item;

		if (!exists) {
			return sendResponse(404, {
				success: false,
				message: 'Booking not found',
			});
		}

		try {
			await checkAvailability(booking);
		} catch (err) {
			return sendResponse(400, {
				message: err.message,
			});
		}

		const command = new PutItemCommand({
			TableName: 'BonzAIDataTable',
			Item: {
				pk: { S: 'booking' },
				sk: { S: String(id) },
				guests: { N: (booking.guests || 0).toString() },
				rooms: {
					M: {
						single: { N: (booking.rooms?.single ?? 0).toString() },
						double: { N: (booking.rooms?.double ?? 0).toString() },
						svite: { N: (booking.rooms?.svite ?? 0).toString() },
					},
				},
				dateIN: { S: booking.dateIN || '' },
				dateOUT: { S: booking.dateOUT || '' },
				name: { S: booking.name || '' },
				mail: { S: booking.mail || '' },
				total: { N: total.toString() },
				updatedAt: { S: updatedAt },
			},
		});

		await client.send(command);

		return sendResponse(200, {
			success: true,
			message: 'Booking Updated',
			bookingId: id,
			name: booking.name,
			mail: booking.mail,
			guests: booking.guests,
			rooms: booking.rooms,
			total,
			dateIN: booking.dateIN,
			dateOUT: booking.dateOUT,
			updatedAt,
		});
	} catch (err) {
		console.log(err);
		return sendResponse(500, {
			success: false,
			message: 'Something went wrong',
		});
	}
};
