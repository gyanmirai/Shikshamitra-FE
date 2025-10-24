import React from 'react';
import { Box, Typography } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetServiceTypesQuery } from 'src/redux/transport/vehicle-management/vehicleSettingsApi';

import type { IServiceType, IServiceTypeTableProps } from './type';

const ServiceTypeTable: React.FC<IServiceTypeTableProps> = ({
  onAddServiceType,
  setOpenDialog,
  setEditData,
  onDelete,
  onEdit,
}) => {
  const { data: serviceTypeData, isLoading: serviceTypesLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetServiceTypesQuery,
  });

  return (
    <CustomizableTable
      tableId="service-type-data-table"
      isLoading={serviceTypesLoading}
      noDataText={
        <>
          Servicing Type Data Not Found{' '}
          <Box
            onClick={() => {
              onAddServiceType.onTrue();
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
            Add Servicing Type
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
                  onDelete(row as IServiceType);
                }}
                handleEditClick={() => {
                  onEdit(row as IServiceType);
                }}
              />
            );
          },
        },
      ]}
      data={serviceTypeData || []}
    />
  );
};

export default ServiceTypeTable;
