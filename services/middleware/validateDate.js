export function isValidDateFormat(dateString) {
	const regex = /^\d{4}-\d{2}-\d{2}$/;
	return regex.test(dateString);
}

export function isValidDate(dateString) {
	const date = new Date(dateString);
	const [year, month, day] = dateString.split('-').map(Number);
	return (
		date.getFullYear() === year &&
		date.getMonth() + 1 === month &&
		date.getDate() === day
	);
}

export function validateBookingDates(dateIN, dateOUT) {
  const today = new Date();
  const timeStampIN = Date.parse(dateIN);
  const dateObjectIN = new Date(timeStampIN);
  const timeStampOUT = Date.parse(dateOUT);
  const dateObjectOUT = new Date(timeStampOUT);

  if (!isValidDateFormat(dateIN) || !isValidDate(dateIN)) {
    return {
      valid: false,
      message:
        "Invalid dateIN format. Please use YYYY-MM-DD or dateIN does not exist.",
    };
  }

  if (!isValidDateFormat(dateOUT) || !isValidDate(dateOUT)) {
    return {
      valid: false,
      message:
        "Invalid dateOUT format. Please use YYYY-MM-DD or dateOUT does not exist.",
    };
  }

  if (dateObjectIN.getTime() < today.getTime()) {
    return { valid: false, message: "DateIN have already passed" };
  }

  if (dateObjectOUT.getTime() < today.getTime()) {
    return { valid: false, message: "DateOUT have already passed" };
  }

  if (timeStampOUT <= timeStampIN) {
    return { valid: false, message: "dateOUT must be after dateIN" };
  }

  return { valid: true };
}