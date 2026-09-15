export interface CalendarDayNamedOption {
  id: string;
  name: string;
  unavailable?: boolean;
}

export const ensureSelectedCalendarDayOption = <T extends CalendarDayNamedOption>(
  options: T[],
  selectedId: string | null | undefined,
  selectedName: string | null | undefined,
  unavailableLabel: string
): T[] => {
  if (!selectedId || options.some((option) => option.id === selectedId)) {
    return options;
  }

  const name = selectedName?.trim();
  return [
    ...options,
    {
      id: selectedId,
      name: name || unavailableLabel,
      unavailable: !name,
    } as T,
  ];
};

export const getCalendarDayOptionLabel = (
  options: CalendarDayNamedOption[],
  selectedId: string,
  unavailableLabel: string
): string => options.find((option) => option.id === selectedId)?.name || unavailableLabel;
