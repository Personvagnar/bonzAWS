const prices = {
  single: 500,
  double: 1000,
  suite: 1500
};

export function calcPrice(rooms) {
  return rooms.reduce((sum, room) => {
    const price = prices[room.type] || 0;
    return sum + price * room.count;
  }, 0);
};