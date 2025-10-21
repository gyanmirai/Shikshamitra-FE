import React from 'react';
import { Box, Typography } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetVehicleTypesQuery } from 'src/redux/transport/vehicle-management/vehicleSettingsApi';

import type { IVehicleType, IVehicleTypeTableProps } from './type';

const VehicleTypeTable: React.FC<IVehicleTypeTableProps> = ({
  onAddVehicleType,
  setOpenDialog,
  setEditData,
  onDelete,
  onEdit,
}) => {
  const { data: vehicleTypeData, isLoading: vehicleTypesLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetVehicleTypesQuery,
  });

  return (
    <CustomizableTable
      tableId="vehicle-type-data-table"
      isLoading={vehicleTypesLoading}
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
      columns={[
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
      ]}
      data={vehicleTypeData || []}
    />
  );
};

export default VehicleTypeTable;
