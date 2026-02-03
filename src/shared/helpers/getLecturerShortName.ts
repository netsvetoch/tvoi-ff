interface Args {
	first_name?: string;
	last_name?: string;
	middle_name?: string;
}

export const getLecturerShortName = ({ first_name, last_name, middle_name }: Args) => {
	return `${last_name} ${first_name?.at(0)}. ${middle_name?.at(0)}.`;
};
