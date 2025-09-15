import { client } from "../../services/db.mjs";
import { confirmation } from "../../services/middleware/confirm.js";

export const handler = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Go Serverless v4! Your function executed successfully!",
    }),
  };
};
