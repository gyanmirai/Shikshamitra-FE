import type { Dayjs } from 'dayjs';

import { useRef, useState, useCallback } from 'react';

import {
  type EditableAttendanceImportRow,
  promotePendingImportRowToPresentWhenTimesComplete,
} from './attendance-import-row-save-utils';

export type ImportEditingCell = {
  rowId: string;
  field: 'timeIn' | 'timeOut';
  value: Dayjs | null;
} | null;

type Draft = {
  rows: EditableAttendanceImportRow[];
  baseline: EditableAttendanceImportRow[];
  totalCount: number;
  editingCell: ImportEditingCell;
  saving: boolean;
};

const signature = (rows: EditableAttendanceImportRow[]) =>
  JSON.stringify(
    rows.map(({ id, attendanceStatus, timeIn, timeOut }) => [
      id,
      attendanceStatus,
      timeIn || '',
      timeOut || '',
    ])
  );
const dirty = (draft: Draft) => signature(draft.rows) !== signature(draft.baseline);
const locked = (draft: Draft) => dirty(draft) || Boolean(draft.editingCell) || draft.saving;
const applyTime = (rows: EditableAttendanceImportRow[], cell: ImportEditingCell) =>
  rows.map((row) =>
    !cell || row.id !== cell.rowId
      ? row
      : promotePendingImportRowToPresentWhenTimesComplete({
          ...row,
          [cell.field]: cell.value?.isValid() ? cell.value.format('HH:mm') : null,
        })
  );

/** Keep the accepted page and its row identities until edits are saved or explicitly discarded.
 * Stable receiveRows deliberately ignores background results while locked; unlocking alone must
 * never replay a cached pre-save response over a successfully saved local value. */
export function useAttendanceImportRowDraft() {
  const [state, setState] = useState<Draft>({
    rows: [],
    baseline: [],
    totalCount: 0,
    editingCell: null,
    saving: false,
  });
  const latest = useRef(state);
  const change = useCallback((update: (current: Draft) => Draft) => {
    const next = update(latest.current);
    latest.current = next;
    setState(next);
    return next;
  }, []);
  const receiveRows = useCallback(
    (rows: EditableAttendanceImportRow[], totalCount: number) => {
      change((current) =>
        locked(current)
          ? current
          : {
              ...current,
              rows,
              baseline: rows,
              totalCount,
            }
      );
    },
    [change]
  );
  const updateRow = useCallback(
    (id: string, patch: Partial<EditableAttendanceImportRow>) => {
      change((current) =>
        current.saving
          ? current
          : {
              ...current,
              rows: current.rows.map((row) => (row.id === id ? { ...row, ...patch } : row)),
            }
      );
    },
    [change]
  );
  const setEditingCell = useCallback(
    (update: React.SetStateAction<ImportEditingCell>) => {
      change((current) => {
        if (current.saving) return current;
        const cell = typeof update === 'function' ? update(current.editingCell) : update;
        if (
          current.editingCell &&
          cell &&
          (current.editingCell.rowId !== cell.rowId || current.editingCell.field !== cell.field)
        )
          return current;
        return { ...current, editingCell: cell };
      });
    },
    [change]
  );
  const commitTimeEdit = useCallback(
    (cell: ImportEditingCell) => {
      change((current) =>
        current.saving
          ? current
          : {
              ...current,
              rows: applyTime(current.rows, cell),
              editingCell: null,
            }
      );
    },
    [change]
  );
  const prepareRows = useCallback(
    () =>
      change((current) =>
        current.saving
          ? current
          : {
              ...current,
              rows: applyTime(current.rows, current.editingCell),
              editingCell: null,
            }
      ).rows,
    [change]
  );
  const beginSave = useCallback(() => {
    if (latest.current.saving) return false;
    change((current) => ({ ...current, saving: true }));
    return true;
  }, [change]);
  const markSaved = useCallback(
    (saved: EditableAttendanceImportRow[]) => {
      const byId = new Map(saved.map((row) => [row.id, row]));
      change((current) => ({
        ...current,
        baseline: current.baseline.map((row) => byId.get(row.id) ?? row),
      }));
    },
    [change]
  );
  // Only an explicit post-save refetch can replace the frozen page during saving,
  // and only after every local change was acknowledged (pending/unmapped rows may remain).
  const receiveSavedRows = useCallback(
    (rows: EditableAttendanceImportRow[], totalCount: number) => {
      change((current) =>
        !current.saving || dirty(current) || current.editingCell
          ? current
          : {
              ...current,
              rows,
              baseline: rows,
              totalCount,
            }
      );
    },
    [change]
  );
  const endSave = useCallback(() => change((current) => ({ ...current, saving: false })), [change]);
  const discard = useCallback(() => {
    change((current) =>
      current.saving
        ? current
        : {
            ...current,
            rows: current.baseline,
            editingCell: null,
          }
    );
  }, [change]);
  return {
    rows: state.rows,
    totalCount: state.totalCount,
    editingCell: state.editingCell,
    isDirty: dirty(state),
    isSaving: state.saving,
    queryLocked: locked(state),
    receiveRows,
    updateRow,
    setEditingCell,
    commitTimeEdit,
    prepareRows,
    beginSave,
    markSaved,
    receiveSavedRows,
    endSave,
    discard,
  };
}
