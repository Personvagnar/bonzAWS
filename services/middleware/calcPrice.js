const prices = {
  single: 500,
  double: 1000,
  svite: 1500
};

export function calcPrice(rooms) {
  return Object.entries(rooms).reduce((sum, [type, count]) => {
    const price = prices[type] || 0;
    return sum + price * (count || 0);
  }, 0);
};