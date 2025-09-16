import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { client } from "../../services/db.mjs";
import { calcPrice } from "../../services/middleware/calcPrice";
import { sendResponse } from "../../services/utils/respons";

export const handler = async (event) => {
  try {
    const id = event.pathParameters.id;
    const booking = JSON.parse(event.body);

    const total = calcPrice(booking.rooms);

    const command = new PutItemCommand({
      TableName: "BonzAIDataTable",
      Item: {
        pk: { S: "booking" },
        sk: { S: String(id)},
        guests: { N: (booking.guests || 0).toString() },
        rooms: {
          M: {
            single: { N: (booking.rooms?.single || 0).toString() },
            double: { N: (booking.rooms?.double || 0).toString() },
            suite: { N: (booking.rooms?.suite || 0).toString() },
          },
        },
        dateIN: { S: booking.dateIN || "" },
        dateOUT: { S: booking.dateOUT || "" },
        name: { S: booking.name || "" },
        mail: { S: booking.mail || "" },
        total: { N: total.toString() },        
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
      total: total,
      dateIN: booking.dateIN,
      dateOUT: booking.dateOUT,
    });
  } catch (err) {
      return sendResponse(500, {
        success: false,
        message: "Something went wrong"
      })
  }
};
