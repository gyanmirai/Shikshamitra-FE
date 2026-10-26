import dayjs from 'dayjs';
import { useState, useEffect } from 'react';
import { Stack, Button } from '@mui/material';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import CustomizableTable from 'src/components/customizabaleTable';
import { useHrTableQuery } from 'src/screens/hr/hooks/use-hr-table-query';
import { useAttendanceImportRowDraft } from 'src/screens/hr/biometricAttendance/use-attendance-import-row-draft';
import {
  IMPORT_ROW_STATUS,
  mapImportRowStatusToUi,
  buildAttendanceImportRowsSaveEntries,
} from 'src/screens/hr/biometricAttendance/attendance-import-row-save-utils';

import { useSyntheticRead } from './operational-api';

export function ImportDraftTable() {
  const [page, setPage] = useState(0);
  const [discardOpen, setDiscardOpen] = useState(false);
  const query = { fixtureKind: 'import', fixtureKey: String(window.innerWidth) };
  const draft = useAttendanceImportRowDraft();
  const { receiveRows } = draft;
  const original = useSyntheticRead('typed-list', { query, offset: page * 10, size: 10 });
  const view = useHrTableQuery(
    {
      table: 'hr-attendance-import-rows',
      query,
      page,
      size: 10,
      resetPage: () => setPage(0),
      genericSearch: true,
      locked: draft.queryLocked,
    },
    original
  );
  useEffect(() => {
    if (view.currentData?.items)
      receiveRows(
        view.currentData.items.map((row: any) => ({
          ...row,
          attendanceStatus: mapImportRowStatusToUi(row.statusCode, row.status),
        })),
        view.currentData.totalCount
      );
  }, [view.currentData, receiveRows]);
  const save = async () => {
    const rows = draft.prepareRows();
    if (!draft.beginSave()) return;
    try {
      const response = await fetch('/synthetic-hr/save-import-rows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fixtureKey: query.fixtureKey,
          entries: buildAttendanceImportRowsSaveEntries(rows),
        }),
      });
      if (!response.ok) throw new Error('Synthetic save failed');
      draft.markSaved(rows);
      const refreshed = await fetch('/synthetic-hr/table-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          offset: page * 10,
          size: 10,
          criteria: {
            search: view.tableProps.searchTerm || '',
            filters: view.tableProps.filters,
            sorts: view.tableProps.sorts,
          },
        }),
      });
      if (!refreshed.ok) throw new Error('Synthetic saved-row refresh failed');
      const population = await refreshed.json();
      draft.receiveSavedRows(
        population.items.map((item: any) => ({
          ...item,
          attendanceStatus: mapImportRowStatusToUi(item.statusCode, item.status),
        })),
        population.totalCount
      );
    } finally {
      draft.endSave();
    }
  };
  return (
    <>
      <Stack direction="row" gap={1} flexWrap="wrap">
        <Button onClick={() => original.refetch()}>Background row refresh</Button>
        <Button
          onClick={() => setDiscardOpen(true)}
          disabled={!draft.queryLocked || draft.isSaving}
        >
          Discard import draft
        </Button>
        <Button onClick={save} disabled={!draft.isDirty || draft.isSaving}>
          Submit import draft
        </Button>
      </Stack>
      <CustomizableTable
        tableId="synthetic-import-draft"
        tableTitle="Synthetic import review"
        columns={[
          { id: 'employeeName', label: 'Staff' },
          {
            id: 'timeIn',
            label: 'In time',
            render: (_, row) =>
              draft.editingCell?.rowId === row.id ? (
                <Stack direction="row">
                  <input
                    type="time"
                    aria-label="Import in time"
                    value={draft.editingCell?.value?.format('HH:mm') || ''}
                    onChange={(event) =>
                      draft.setEditingCell(
                        (cell) =>
                          cell && { ...cell, value: dayjs(`1970-01-01T${event.target.value}`) }
                      )
                    }
                  />
                  <Button onClick={() => draft.commitTimeEdit(draft.editingCell)}>
                    Commit import time
                  </Button>
                  <Button onClick={() => draft.setEditingCell(null)}>Cancel import time</Button>
                </Stack>
              ) : (
                <Stack direction="row">
                  <span>{row.timeIn}</span>
                  <Button
                    disabled={draft.isSaving || Boolean(draft.editingCell)}
                    aria-label={`Edit import time for ${row.id}`}
                    onClick={() =>
                      draft.setEditingCell({
                        rowId: row.id,
                        field: 'timeIn',
                        value: dayjs(`1970-01-01T${row.timeIn}`),
                      })
                    }
                  >
                    Edit
                  </Button>
                </Stack>
              ),
          },
          {
            id: 'attendanceStatus',
            label: 'Attendance',
            render: (_, row) => (
              <Stack direction="row">
                <span aria-label="Current attendance">
                  {typeof row.attendanceStatus === 'number'
                    ? ['Present', 'Absent', 'HalfDay'][row.attendanceStatus]
                    : row.attendanceStatus}
                </span>
                <Button
                  disabled={draft.isSaving}
                  aria-label={`Mark import absent for ${row.id}`}
                  onClick={() =>
                    draft.updateRow(row.id, { attendanceStatus: IMPORT_ROW_STATUS.Absent })
                  }
                >
                  Absent
                </Button>
              </Stack>
            ),
          },
        ]}
        data={draft.rows}
        totalCount={draft.totalCount}
        serverSidePagination
        page={page}
        rowsPerPage={10}
        onServerPagination={(next) => {
          if (!draft.queryLocked) setPage(next - 1);
        }}
        paginationDisabled={draft.queryLocked}
        searchFieldProps={{ disabled: draft.queryLocked }}
        isLoading={!draft.queryLocked && view.isFetching}
        showExport={false}
        wrapperProps={{ sx: { flex: 1, minHeight: 0 } }}
        {...view.tableProps}
      />
      <ConfirmDialog
        open={discardOpen}
        onClose={() => setDiscardOpen(false)}
        title="Discard import draft?"
        cancelText="Keep editing"
        action={
          <Button
            onClick={() => {
              draft.discard();
              setDiscardOpen(false);
            }}
          >
            Confirm discard import
          </Button>
        }
      />
    </>
  );
}
