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
