import { confirmation } from "../../services/middleware/confirm.js";
import { client } from "../../services/db.mjs";
import { ScanCommand } from "@aws-sdk/client-dynamodb";

export const handler = async (event) => {
  try {
    const command = new ScanCommand({
      tableName: "BonzAIDataTable"
    });

    const data = await client.send(command)

    const bookings = data.Items.map(item => ({
      id: item.id.S,
      guests: parseInt(item.guests.N),
      rooms: JSON.parse(item.rooms.S),
      dateIN: item.dateIN.S,
      dateOUT: item.dateOUT.S,
      name: item.name.S,
      mail: item.mail.S
    }))
    
    return {
      statusCode: 200,
      body: JSON.stringify(bookings)
    }
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to retrieve booked bookings book"}),
    }
  }
};