import { Button, Flex, Select, Text, TextArea, TextInput } from "@gravity-ui/uikit";
import { type FormEvent, useState } from "react";

import type { Profile } from "@/shared/api/dating/types.gen";

import { GENDER_OPTIONS } from "../helpers";

export interface ProfileFormValues {
	age: number;
	contact: string;
	description: string;
	gender: string;
	interests: string;
	name: string;
}

interface ProfileFormProps {
	initialValues?: Profile;
	onCancel?: () => void;
	onSubmit: (values: ProfileFormValues) => void;
	pending?: boolean;
	submitLabel: string;
}

const MIN_AGE = 1;
const MAX_AGE = 150;

export const ProfileForm = ({ initialValues, onCancel, onSubmit, pending, submitLabel }: ProfileFormProps) => {
	const [name, setName] = useState(initialValues?.name ?? "");
	const [age, setAge] = useState(initialValues ? String(initialValues.age) : "");
	const [gender, setGender] = useState<string[]>(initialValues ? [initialValues.gender] : []);
	const [description, setDescription] = useState(initialValues?.description ?? "");
	const [interests, setInterests] = useState(initialValues?.interests ?? "");
	const [contact, setContact] = useState(initialValues?.contact ?? "");

	const [nameInvalid, setNameInvalid] = useState(false);
	const [ageInvalid, setAgeInvalid] = useState(false);
	const [genderInvalid, setGenderInvalid] = useState(false);
	const [contactInvalid, setContactInvalid] = useState(false);

	const submit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (pending) {
			return;
		}

		const trimmedName = name.trim();
		const trimmedContact = contact.trim();
		const parsedAge = Number(age);
		const ageValue = age.trim() && Number.isInteger(parsedAge) ? parsedAge : Number.NaN;

		const isNameValid = Boolean(trimmedName);
		const isAgeValid = Number.isInteger(ageValue) && ageValue >= MIN_AGE && ageValue <= MAX_AGE;
		const isGenderValid = gender.length > 0;
		const isContactValid = Boolean(trimmedContact);

		setNameInvalid(!isNameValid);
		setAgeInvalid(!isAgeValid);
		setGenderInvalid(!isGenderValid);
		setContactInvalid(!isContactValid);

		if (!isNameValid || !isAgeValid || !isGenderValid || !isContactValid) {
			return;
		}

		onSubmit({
			age: ageValue,
			contact: trimmedContact,
			description: description.trim(),
			gender: gender[0],
			interests: interests.trim(),
			name: trimmedName,
		});
	};

	return (
		<form onSubmit={submit}>
			<Flex direction="column" gap={3}>
				<TextInput
					errorMessage={nameInvalid ? "Введите имя" : undefined}
					label="Имя"
					onUpdate={value => {
						setName(value);
						if (value.trim()) setNameInvalid(false);
					}}
					validationState={nameInvalid ? "invalid" : undefined}
					value={name}
				/>
				<Flex gap={3}>
					<TextInput
						errorMessage={ageInvalid ? `Возраст от ${MIN_AGE} до ${MAX_AGE}` : undefined}
						label="Возраст"
						onUpdate={value => {
							setAge(value);
							setAgeInvalid(false);
						}}
						style={{ flex: 1 }}
						type="number"
						validationState={ageInvalid ? "invalid" : undefined}
						value={age}
					/>
					<Flex direction="column" gap={1} style={{ flex: 1 }}>
						<Text color="secondary" variant="caption-2">
							Пол
						</Text>
						<Select
							errorMessage={genderInvalid ? "Выберите пол" : undefined}
							onUpdate={value => {
								setGender(value);
								if (value.length > 0) setGenderInvalid(false);
							}}
							options={GENDER_OPTIONS}
							placeholder="Выберите пол"
							validationState={genderInvalid ? "invalid" : undefined}
							value={gender}
						/>
					</Flex>
				</Flex>
				<Flex direction="column" gap={1}>
					<Text color="secondary" variant="caption-2">
						Описание
					</Text>
					<TextArea minRows={2} onUpdate={setDescription} placeholder="Необязательно" value={description} />
				</Flex>
				<Flex direction="column" gap={1}>
					<Text color="secondary" variant="caption-2">
						Интересы
					</Text>
					<TextArea minRows={2} onUpdate={setInterests} placeholder="Необязательно" value={interests} />
				</Flex>
				<TextInput
					errorMessage={contactInvalid ? "Укажите контакт" : undefined}
					label="Контакт"
					onUpdate={value => {
						setContact(value);
						if (value.trim()) setContactInvalid(false);
					}}
					placeholder="Телефон или телеграм"
					validationState={contactInvalid ? "invalid" : undefined}
					value={contact}
				/>
				<Flex gap={2}>
					<Button loading={pending} type="submit" view="action">
						{submitLabel}
					</Button>
					{onCancel && (
						<Button disabled={pending} onClick={onCancel} type="button">
							Отмена
						</Button>
					)}
				</Flex>
			</Flex>
		</form>
	);
};
