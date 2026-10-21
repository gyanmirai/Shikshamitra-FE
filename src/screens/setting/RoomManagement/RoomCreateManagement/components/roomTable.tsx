'use client';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import CustomizableTable from 'src/components/customizabaleTable';

import RoomTableFilters from './RoomTableFilters';
import RoomTableFeedback from './RoomTableFeedback';
import { useRoomTable } from '../hooks/useRoomTable';
import { ALL_ROOMS_FILTER } from '../types/room-table';
import { getRoomTableColumns } from './roomTableColumns';

import type { RoomTableActions } from '../types/room-table';

export default function RoomTable(actions: RoomTableActions) {
  const {
    roomsQuery,
    buildingsQuery,
    rooms,
    buildings,
    buildingId,
    floorId,
    changeBuilding,
    setFloorId,
    clearFilters,
  } = useRoomTable();
  const hasFilters = buildingId !== ALL_ROOMS_FILTER;
  const refreshing = roomsQuery.isFetching && Boolean(roomsQuery.currentData);

  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', gap: 1, minHeight: 0, minWidth: 0, flex: 1 }}
    >
      <RoomTableFilters
        buildings={buildings}
        buildingId={buildingId}
        floorId={floorId}
        disabled={buildingsQuery.isLoading || buildingsQuery.isError}
        onBuildingChange={changeBuilding}
        onFloorChange={setFloorId}
        onClear={clearFilters}
      />
      {buildingsQuery.isError && (
        <Alert
          severity="warning"
          action={
            <Button color="inherit" size="small" onClick={() => buildingsQuery.refetch()}>
              Retry
            </Button>
          }
        >
          Buildings could not be loaded. Retry to use building and floor filters.
        </Alert>
      )}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        aria-busy={roomsQuery.isFetching}
      >
        <Box sx={{ height: 2, flexShrink: 0 }}>
          {refreshing && <LinearProgress aria-label="Refreshing rooms" sx={{ height: 1 }} />}
        </Box>
        <CustomizableTable
          tableId="room-data-table"
          tableTitle="Rooms"
          isLoading={roomsQuery.isFetching && !roomsQuery.currentData}
          columns={getRoomTableColumns(actions)}
          data={rooms}
          wrapperProps={{
            sx: {
              height: 1,
              '& .MuiPaper-root:has(> .MuiTablePagination-root)': {
                flexWrap: { xs: 'wrap', sm: 'nowrap' },
                p: { xs: 1, sm: 2 },
              },
              '& .MuiTablePagination-root': {
                flex: { xs: '1 1 100%', sm: '1 1 auto' },
                width: { xs: 1, sm: 'auto' },
              },
              '& .MuiTablePagination-toolbar': { px: { xs: 0, sm: 2 } },
            },
          }}
          tableContainerProps={{ sx: { height: 1 } }}
          searchFieldProps={{
            placeholder: 'Search rooms...',
            inputProps: { 'aria-label': 'Search rooms' },
          }}
          noDataText={<RoomTableFeedback filtered={hasFilters} onAction={clearFilters} />}
          errorContent={
            roomsQuery.isError && (
              <RoomTableFeedback
                error
                busy={roomsQuery.isFetching}
                onAction={() => roomsQuery.refetch()}
              />
            )
          }
        />
      </Box>
    </Box>
  );
}
