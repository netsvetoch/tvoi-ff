export const capitalize = (str: string) => {
	const firstLetter = str.at(0);

	if (firstLetter === undefined) {
		return str;
	}

	return firstLetter.toUpperCase() + str.slice(1);
};
