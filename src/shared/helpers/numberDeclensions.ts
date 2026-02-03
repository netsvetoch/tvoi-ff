/* eslint-disable @typescript-eslint/max-params */
export const numberDeclensions = (number: number, one: string, two: string, five: string) => {
	if (number === 0) return `${number} ${five}`;
	if (number % 10 === 1 && number % 100 !== 11) return `${number} ${one}`;
	if (number % 10 >= 2 && number % 10 <= 4 && (number % 100 < 10 || number % 100 >= 20)) return `${number} ${two}`;
	return `${number} ${five}`;
};
