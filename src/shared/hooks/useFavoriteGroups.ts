import { useLocalStorage } from "@reactuses/core";
import { useCallback } from "react";

export const useFavoriteGroups = () => {
	const [favoriteGroups, setFavoriteGroups] = useLocalStorage<Set<number>>("favorite_groups", new Set<number>());

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
		favoriteGroups: favoriteGroups ?? new Set<number>(),
		removeFavoriteGroup,
	};
};
