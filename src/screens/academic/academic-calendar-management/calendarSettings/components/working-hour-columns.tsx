import type { ReactNode } from 'react';
import type { IColumn } from 'src/components/customizabaleTable/types';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Stack, Button, Tooltip, IconButton } from '@mui/material';
import { SCHOOL_SHIFT_TYPE_LABELS } from 'src/enums/academic-calendar';

import type { WorkingHour, WorkingHourRow } from './working-hour-types';

type Actions = {
  deleting: boolean;
  onEdit: (hour: WorkingHour) => void;
  onAssign: (row: WorkingHourRow) => void;
  onDelete: (hour: WorkingHour) => void;
};

const fromRow =
  (render: (row: WorkingHourRow) => ReactNode): NonNullable<IColumn['render']> =>
  (_, row) =>
    render(row as WorkingHourRow);

export function workingHourColumns({ deleting, onEdit, onAssign, onDelete }: Actions): IColumn[] {
  return [
    { id: 'className', label: 'Class', filterType: 'string' },
    {
      id: 'shift.shiftType',
      label: 'Shift type',
      isFilter: false,
      isSort: false,
      render: fromRow((row) =>
        row.shift ? (
          SCHOOL_SHIFT_TYPE_LABELS[row.shift.shiftType]
        ) : (
          <Label color="warning">Not assigned</Label>
        )
      ),
    },
    {
      id: 'shift.startTime',
      label: 'Start time',
      isFilter: false,
      render: fromRow((row) => row.shift?.startTime?.slice(0, 5) || '-'),
    },
    {
      id: 'shift.endTime',
      label: 'End time',
      isFilter: false,
      render: fromRow((row) => row.shift?.endTime?.slice(0, 5) || '-'),
    },
    {
      id: 'recess',
      label: 'Recess',
      isFilter: false,
      isSort: false,
      render: fromRow((row) =>
        row.shift?.recessStartTime
          ? `${row.shift.recessStartTime.slice(0, 5)} - ${row.shift.recessEndTime?.slice(0, 5) || '-'}`
          : '-'
      ),
    },
    {
      id: 'shift.isDefault',
      label: 'Default',
      isFilter: false,
      isSort: false,
      render: fromRow((row) => (row.shift?.isDefault ? <Label>Default</Label> : '-')),
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'right',
      isFilter: false,
      isSort: false,
      excludeFromExport: true,
      sticky: true,
      render: fromRow((row) => (
        <Stack direction="row" justifyContent="flex-end" spacing={1}>
          {row.shift ? (
            <>
              <Tooltip title="Edit shift">
                <IconButton
                  size="small"
                  aria-label={`Edit ${row.className} shift`}
                  onClick={() => row.shift && onEdit(row.shift)}
                >
                  <Iconify icon="mdi:pencil-outline" width={16} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete shift">
                <IconButton
                  size="small"
                  color="error"
                  disabled={deleting}
                  aria-label={`Delete ${row.className} shift`}
                  onClick={() => row.shift && onDelete(row.shift)}
                >
                  <Iconify icon="mdi:trash-can-outline" width={16} />
                </IconButton>
              </Tooltip>
            </>
          ) : (
            <Button
              size="small"
              variant="outlined"
              aria-label={`Assign shift for ${row.className}`}
              onClick={() => onAssign(row as WorkingHourRow)}
            >
              Assign shift
            </Button>
          )}
        </Stack>
      )),
    },
  ];
}
