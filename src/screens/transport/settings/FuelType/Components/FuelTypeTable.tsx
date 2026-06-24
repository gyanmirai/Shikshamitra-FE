import React from 'react';
import { Box, Typography } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IFuelType, IFuelTypeTableProps } from './type';

const FuelTypeTable: React.FC<IFuelTypeTableProps> = ({
  onAddFuelType,
  setOpenDialog,
  setEditData,
  onDelete,
  onEdit,
  data,
  isLoading,
}) => {
  const transformedData = React.useMemo(
    () =>
      (data || []).map((item: any) => ({
        ...item,
        typeName: item.name || item.typeName,
      })),
    [data]
  );

  return (
    <CustomizableTable
      tableId="fuel-type-data-table"
      isLoading={isLoading}
      noDataText={
        <>
          Fuel Type Data Not Found{' '}
          <Box
            onClick={() => {
              onAddFuelType.onTrue();
              setOpenDialog(true);
              setEditData(null);
            }}
            color="primary.main"
            fontWeight={600}
            sx={{
              '&:hover': {
                cursor: 'pointer',
                textDecoration: 'underline',
              },
            }}
          >
            Add Fuel Type
          </Box>
        </>
      }
      columns={[
        {
          id: 'typeName',
          label: ' Name',
          align: 'left',
          minWidth: 180,
          render: (value) => (
            <Typography variant="caption" fontSize="13px">
              {value}
            </Typography>
          ),
        },
        {
          id: 'description',
          label: 'Description',
          align: 'left',
          render: (value) => (
            <Typography variant="caption" fontSize="13px">
              {value || '-'}
            </Typography>
          ),
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
                  onDelete(row as IFuelType);
                }}
                handleEditClick={() => {
                  onEdit(row as IFuelType);
                }}
              />
            );
          },
        },
      ]}
      data={transformedData}
    />
  );
};

export default FuelTypeTable;
