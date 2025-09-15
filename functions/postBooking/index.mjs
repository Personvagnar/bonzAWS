import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { client } from "../../services/db.mjs";
import { v4 as uuidv4 } from "uuid";

export const handler = async (event) => {
  const id_unsorted = uuidv4();
  const id = id_unsorted.slice(0, 5);
  /*const booking = JSON.parse(event.body);*/

  const command = new PutItemCommand({
    TableName: "BonzAIDataTable",
    Item: {
      pk: { S: "booking" },
      sk: { S: id },
    }
  });

  await client.send(command);

  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      message: "Booking booked, read a book!",
    }),
  };
};

