import { client } from '../../services/db.mjs';
import { DeleteItemCommand } from '@aws-sdk/client-dynamodb';
import { sendResponse } from '../../services/utils/respons.js';

export const handler = async (event) => {
	try {
		const id = event.pathParameters.id;

		const command = new DeleteItemCommand({
			TableName: 'BonzAIDataTable',
			Key: {
				pk: { S: 'booking' },
				sk: { S: id },
			},
			ConditionExpression: 'attribute_exists(pk) AND attribute_exists(sk)',
		});

		await client.send(command);

		return sendResponse(200, {
			success: true,
			message: `Booking ${id} deleted!`,
		});
	} catch (error) {
		console.error(error);

		if (error.name === 'ConditionalCheckFailedException') {
			return sendResponse(404, {
				success: false,
				message: 'Booking not found',
			});
		}
		return {
			statusCode: 500,
			body: JSON.stringify({ error: 'Failed to delete booking' }),
		};
	}
};
