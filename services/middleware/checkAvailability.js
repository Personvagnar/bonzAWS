import { client } from "../db.mjs";
import { ScanCommand } from "@aws-sdk/client-dynamodb";

const TOTAL_ROOMS = 20;
const ROOM_CAPACITY = {
    single: 1,
    double: 2,
    svite: 3,
}

export const checkAvailability = async (booking) => {
    const totalCapacity =
        (booking.rooms.single || 0) * ROOM_CAPACITY.single +
        (booking.rooms.double || 0) * ROOM_CAPACITY.double +
        (booking.rooms.svite || 0) * ROOM_CAPACITY.svite;

    if (booking.guests > totalCapacity) {
        throw new Error(
            `Too many guests for the selected rooms. Guests: ${booking.guests}, Room capacity: ${totalCapacity}`
        )
    }

    const bookedRooms =
        (booking.rooms.single || 0) +
        (booking.rooms.double || 0) +
        (booking.rooms.svite || 0);

    const command = new ScanCommand({ TableName: "BonzAIDataTable" });
    const data = await client.send(command);

    let alreadyBooked = 0;
    data.Items.forEach((item) => {
        if (item.rooms?.M) {
            alreadyBooked += parseInt(item.rooms.M.single?.N || "0");
            alreadyBooked += parseInt(item.rooms.M.double?.N || "0");
            alreadyBooked += parseInt(item.rooms.M.svite?.N || "0");
        }
    });

    if (alreadyBooked + bookedRooms > TOTAL_ROOMS) {
        throw new Error(
            `Not enough rooms available. Already booked: ${alreadyBooked}, Rooms requested: ${bookedRooms}, Total rooms: ${TOTAL_ROOMS}`
        )
    }
}