import { client } from "../../services/db.mjs";
import { ScanCommand } from "@aws-sdk/client-dynamodb";

export const handler = async (event) => {
  try {
    const command = new ScanCommand({
      TableName: "BonzAIDataTable"
    });

    const data = await client.send(command)

    const bookings = data.Items
      .filter(item => item.sk && item.guests && item.rooms && item.dateIN && item.dateOUT && item.name)
      .map(item => ({
        bookingId: item.sk.S,
        guests: parseInt(item.guests.N),
        rooms: JSON.parse(item.rooms.S),
        dateIN: item.dateIN.S,
        dateOUT: item.dateOUT.S,
        name: item.name.S,
        mail: item.mail?.S || ""
      }));

    if (bookings.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "No booked bookings found" })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(bookings)
    }
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to retrieve booked bookings book" }),
    }
  }
};