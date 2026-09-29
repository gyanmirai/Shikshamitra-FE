import { useEffect } from 'react';

type ElectiveGroup = { id: string; name: string };

type AutoSelectElectiveGroupOptions = {
  classId: string;
  divisionId: string;
  groups: ElectiveGroup[];
  selectedGroupId: string;
  isLoading: boolean;
  onSelect: (groupId: string) => void;
};

export default function useAutoSelectElectiveGroup({
  classId,
  divisionId,
  groups,
  selectedGroupId,
  isLoading,
  onSelect,
}: AutoSelectElectiveGroupOptions) {
  useEffect(() => {
    if (!classId || !divisionId || isLoading) return;

    if (groups.some((group) => group.id === selectedGroupId)) return;

    const nextGroupId = groups[0]?.id ?? '';
    if (nextGroupId !== selectedGroupId) onSelect(nextGroupId);
  }, [classId, divisionId, groups, selectedGroupId, isLoading, onSelect]);
}
