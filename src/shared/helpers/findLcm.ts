// Функция для нахождения НОД двух чисел
const gcd = (a: number, b: number): number => {
	let x = a;
	let y = b;
	while (y !== 0) {
		const temp = y;
		y = x % y;
		x = temp;
	}
	return x;
};

// Функция для нахождения НОК двух чисел
const lcmPair = (a: number, b: number): number => {
	return Math.abs(a * b) / gcd(a, b);
};

// Функция для нахождения НОК массива чисел
export const findLcm = (numbers: number[]): number => {
	const nonZeroNumbers = numbers.filter(n => n !== 0);

	if (nonZeroNumbers.length === 0) {
		return 1;
	}

	if (nonZeroNumbers.some(n => !Number.isInteger(n))) {
		throw new Error("Все числа должны быть целыми");
	}

	let [result] = nonZeroNumbers;

	for (let i = 1; i < nonZeroNumbers.length; i++) {
		result = lcmPair(result, nonZeroNumbers[i]);
	}

	return result;
};
