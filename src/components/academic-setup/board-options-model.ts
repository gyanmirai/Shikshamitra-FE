import type { Board } from 'src/types/school';

import { BoardEnum, BoardList } from 'src/enums/board';

export const getConfiguredBoardTypes = (
  boards: readonly Board[],
  academicYearId?: string,
  editingBoardId?: string
): string[] =>
  boards
    .filter(
      (board) =>
        (!academicYearId || board.academicYearId === academicYearId) &&
        board.id !== editingBoardId &&
        board.type !== BoardEnum.Custom
    )
    .map((board) => String(board.type));

export const getCustomBoardNameError = (
  name: string,
  boards: readonly Board[],
  academicYearId?: string,
  editingBoardId?: string
): string | undefined => {
  const normalized = name.trim().toLocaleLowerCase();
  if (!normalized) return 'Custom board name is required.';
  if (name.trim().length > 128) return 'Custom board name must not exceed 128 characters.';
  if (
    BoardList.some(
      (option) =>
        option.value !== BoardEnum.Custom &&
        (option.label.toLocaleLowerCase() === normalized ||
          BoardEnum[option.value].toLocaleLowerCase() === normalized)
    )
  ) {
    return 'Select the existing standard board option instead of adding it as a custom board.';
  }
  if (
    boards.some(
      (board) =>
        board.id !== editingBoardId &&
        (!academicYearId || board.academicYearId === academicYearId) &&
        board.name.trim().toLocaleLowerCase() === normalized
    )
  ) {
    return 'This board is already added to the academic year.';
  }
  return undefined;
};
