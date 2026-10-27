'use client';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Stack, Button, Typography } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetBuildingsQuery } from 'src/redux/InstituteSetup/BuildingApi/BuildingApi';

import { plainBuildingDescription } from './initialValues';
import { getBuildingColumns } from './building-table-columns';

import type { IBuilding, IBuildingTableProps } from '../types';

const BuildingTable = ({ onAddBuilding, onDelete, onEdit }: IBuildingTableProps) => {
  const {
    data: buildings,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBuildingsQuery,
    popupConfig: { error: false },
    options: { refetchOnMountOrArgChange: false },
  });
  return (
    <CustomizableTable
      tableId="building-data-table"
      tableTitle="Buildings"
      wrapperProps={{ sx: { height: 1, minWidth: 0 } }}
      tableContainerProps={{ sx: { height: 1 } }}
      searchFieldProps={{
        placeholder: 'Search buildings...',
        inputProps: { 'aria-label': 'Search buildings' },
      }}
      isLoading={isLoading}
      isRefreshing={isFetching && !isLoading}
      error={error}
      onRetry={refetch}
      noDataText={
        <Stack spacing={1} alignItems="center">
          <Typography variant="body2">No buildings have been added yet.</Typography>
          <Button
            type="button"
            size="small"
            variant="contained"
            color="inherit"
            startIcon={<Iconify icon={GlobalIcons.addIcon} />}
            onClick={onAddBuilding}
          >
            Add building
          </Button>
        </Stack>
      }
      columns={getBuildingColumns({ onEdit, onDelete })}
      searchableFields={['buildingName', 'totalFloors', 'descriptionSearchText']}
      data={(buildings || []).map((building: IBuilding) => ({
        ...building,
        descriptionSearchText: plainBuildingDescription(building.description || ''),
      }))}
    />
  );
};

export default BuildingTable;
