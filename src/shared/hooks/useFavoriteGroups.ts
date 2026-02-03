import { useCallback } from "react";
import { useLocalStorage } from "usehooks-ts";

export const useFavoriteGroups = () => {
	const [favoriteGroups, setFavoriteGroups] = useLocalStorage<Set<number>>("favorite_groups", new Set(), {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		deserializer: value => new Set(JSON.parse(value)),
		serializer: value => JSON.stringify([...value]),
	});

	const addFavoriteGroup = useCallback(
		(groupId: number) => {
			setFavoriteGroups(prev => new Set(prev).add(groupId));
		},
		[setFavoriteGroups]
	);

	const removeFavoriteGroup = useCallback(
		(groupId: number) => {
			setFavoriteGroups(prev => {
				const newSet = new Set(prev);
				newSet.delete(groupId);
				return newSet;
			});
		},
		[setFavoriteGroups]
	);

	return {
		addFavoriteGroup,
		favoriteGroups,
		removeFavoriteGroup,
	};
};
