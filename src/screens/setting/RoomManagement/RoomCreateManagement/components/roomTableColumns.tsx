import type { IColumn } from 'src/components/customizabaleTable/types';

import { fNumber } from 'src/utils/format-number';
import ThreeDotsActions from 'src/components/three-dots-actions';

import type { IRoom } from '../types';
import type { RoomTableActions } from '../types/room-table';

export function getRoomTableColumns({
  onEdit,
  onDelete,
}: Omit<RoomTableActions, 'onDelete'> & { onDelete: (room: IRoom) => void }): IColumn[] {
  const textCell = { typography: 'body2', whiteSpace: 'normal', overflowWrap: 'anywhere' } as const;
  return [
    {
      id: 'roomName',
      label: 'Room Name/No.',
      filterType: 'string',
      minWidth: 150,
      cellSx: textCell,
    },
    {
      id: 'capacity',
      label: 'Capacity',
      filterType: 'number',
      filterStep: 1,
      align: 'right',
      minWidth: 100,
      cellSx: { typography: 'body2' },
      render: (value: number | null) => (value == null ? '-' : fNumber(value)),
    },
    {
      id: 'buildingName',
      label: 'Building',
      filterType: 'string',
      minWidth: 200,
      maxWidth: 280,
      cellSx: textCell,
    },
    { id: 'floorName', label: 'Floor', filterType: 'string', minWidth: 140, cellSx: textCell },
    {
      id: 'roomTypeName',
      label: 'Room Type',
      filterType: 'string',
      minWidth: 130,
      cellSx: textCell,
    },
    {
      id: 'totalBenches',
      label: 'Total Benches',
      filterType: 'number',
      filterStep: 1,
      align: 'right',
      minWidth: 140,
      cellSx: { typography: 'body2' },
      render: (value: number | null) => (value == null ? '-' : fNumber(value)),
    },
    {
      id: 'features',
      isSort: false,
      label: 'Features',
      filterType: 'string',
      minWidth: 220,
      maxWidth: 320,
      cellSx: textCell,
      render: (value: IRoom['features'] | null) =>
        Array.isArray(value) ? value.join(', ') || '-' : value || '-',
    },
    {
      id: 'action',
      label: 'Actions',
      minWidth: 100,
      align: 'right',
      isSort: false,
      isFilter: false,
      excludeFromExport: true,
      sticky: true,
      stickyPosition: 'right',
      render: (_value, row) => (
        <ThreeDotsActions
          showThreeDots={false}
          placement="right-top"
          showEditIcon
          showDeleteIcon
          editLabel={`Edit room ${row.roomName}`}
          deleteLabel={`Delete room ${row.roomName}`}
          sx={{ justifyContent: 'flex-end' }}
          handleEditClick={() => onEdit(row as IRoom)}
          handleDeleteClick={() => onDelete(row as IRoom)}
        />
      ),
    },
  ];
}
