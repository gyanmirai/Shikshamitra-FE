import type { IColumn } from 'src/components/customizable-table/types';

import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizable-table';

import type { IVehicleType, IVehicleTypeTableProps } from './type';

const VehicleTypeTable: React.FC<IVehicleTypeTableProps> = ({
  onAddVehicleType,
  setOpenDialog,
  setEditData,
  onDelete,
  onEdit,
  data,
  isLoading,
}) => {
  // Transform API response to match table format
  const transformedData = React.useMemo(() => {
    if (!data) return [];
    return data.map((item: any) => {
      const range = item.approxSittingRange?.split('-').map((v: string) => parseInt(v.trim(), 10));
      return {
        ...item,
        typeName: item.name || item.typeName,
        vehicleRange: range && range.length === 2 ? range : [0, 0],
      };
    });
  }, [data]);

  const columns: IColumn[] = useMemo(
    () => [
      {
        id: 'typeName',
        label: 'Name',
        align: 'left',
        minWidth: 180,
        render: (value) => (
          <Typography variant="caption" fontSize="13px">
            {value}
          </Typography>
        ),
      },
      {
        id: 'vehicleRange',
        label: 'Approx Sitting Range',
        align: 'left',
        minWidth: 200,
        render: (value) => (
          <Typography variant="caption" fontSize="13px">
            {value ? `${value[0]} - ${value[1]}` : 'N/A'}
          </Typography>
        ),
      },
      {
        id: 'description',
        label: 'Description',
        align: 'left',
      },
      {
        id: 'action',
        label: 'Actions',
        minWidth: 50,
        align: 'left',
        isSort: false,
        sticky: true,
        isFilter: false,
        render(value, row) {
          return (
            <ThreeDotsActions
              showThreeDots={false}
              placement="right-top"
              showDeleteIcon
              showEditIcon
              handleDeleteClick={() => {
                onDelete(row as IVehicleType);
              }}
              handleEditClick={() => {
                onEdit(row as IVehicleType);
              }}
            />
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <CustomizableTable
      tableId="vehicle-type-data-table"
      isLoading={isLoading}
      noDataText={
        <>
          Vehicle Type Data Not Found{' '}
          <Box
            onClick={() => {
              onAddVehicleType.onTrue();
              setOpenDialog(true);
              setEditData(null);
            }}
            color="primary.main"
            fontWeight={600}
            role="button"
            tabIndex={0}
            aria-label="Add Vehicle Type"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onAddVehicleType.onTrue();
                setOpenDialog(true);
                setEditData(null);
              }
            }}
            sx={{
              '&:hover': {
                cursor: 'pointer',
                textDecoration: 'underline',
              },
            }}
          >
            Add Vehicle Type
          </Box>
        </>
      }
      columns={columns}
      data={transformedData}
    />
  );
};

export default VehicleTypeTable;
