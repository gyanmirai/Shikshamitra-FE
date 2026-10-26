import dayjs from 'dayjs';
import { it, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import { useAttendanceImportRowDraft } from './use-attendance-import-row-draft';
import {
  IMPORT_ROW_STATUS,
  type EditableAttendanceImportRow,
} from './attendance-import-row-save-utils';

const row = (id: string) =>
  ({
    id,
    employeeId: id,
    attendanceStatus: IMPORT_ROW_STATUS.Present,
    timeIn: '09:00',
    timeOut: '17:00',
  }) as EditableAttendanceImportRow;

it('does not discard an existing editor when a second row or field tries to take its context', () => {
  const { result } = renderHook(useAttendanceImportRowDraft);
  act(() => result.current.receiveRows([row('one'), row('two')], 40));
  act(() =>
    result.current.setEditingCell({
      rowId: 'one',
      field: 'timeIn',
      value: dayjs('1970-01-01T10:25'),
    })
  );
  act(() => result.current.setEditingCell({ rowId: 'two', field: 'timeOut', value: null }));
  expect(result.current.editingCell?.rowId).toBe('one');
  expect(result.current.editingCell?.value?.format('HH:mm')).toBe('10:25');
  expect(result.current.queryLocked).toBe(true);
  act(() => result.current.setEditingCell(null));
  expect(result.current.queryLocked).toBe(false);
});

it('only acknowledges submitted rows and keeps an excluded pending change until explicit discard', () => {
  const { result } = renderHook(useAttendanceImportRowDraft);
  act(() => result.current.receiveRows([row('one'), row('two')], 40));
  act(() => {
    result.current.updateRow('one', { timeIn: '10:25' });
    result.current.updateRow('two', { attendanceStatus: IMPORT_ROW_STATUS.Pending });
  });
  const saved = result.current.rows[0];
  act(() => {
    expect(result.current.beginSave()).toBe(true);
    expect(result.current.beginSave()).toBe(false);
  });
  act(() => {
    result.current.discard();
    result.current.receiveRows([row('replacement')], 1);
    result.current.updateRow('one', { timeIn: '11:30' });
    result.current.markSaved([saved]);
    result.current.receiveSavedRows([], 0);
    result.current.endSave();
  });
  expect(result.current.rows[0].timeIn).toBe('10:25');
  expect(result.current.rows[1].attendanceStatus).toBe(IMPORT_ROW_STATUS.Pending);
  expect(result.current.queryLocked).toBe(true);
  expect(result.current.totalCount).toBe(40);
  act(() => result.current.discard());
  expect(result.current.rows[0].timeIn).toBe('10:25');
  expect(result.current.rows[1].attendanceStatus).toBe(IMPORT_ROW_STATUS.Present);
  expect(result.current.queryLocked).toBe(false);
});
