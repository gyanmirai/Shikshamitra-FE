import React from 'react';
import { Box, Typography } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetLicenceTypesQuery } from 'src/redux/transport/vehicle-management/vehicleSettingsApi';

import type { ILicenceType, ILicenceTypeTableProps } from './type';

const LicenceTypeTable: React.FC<ILicenceTypeTableProps> = ({
  onAddLicenceType,
  setOpenDialog,
  setEditData,
  onDelete,
  onEdit,
}) => {
  const { data: licenceTypeData, isLoading: licenceTypesLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetLicenceTypesQuery,
  });

  return (
    <CustomizableTable
      tableId="licence-type-data-table"
      isLoading={licenceTypesLoading}
      noDataText={
        <>
          Licence Type Data Not Found{' '}
          <Box
            onClick={() => {
              onAddLicenceType.onTrue();
              setOpenDialog(true);
              setEditData(null);
            }}
            color="primary.main"
            fontWeight={600}
            role="button"
            tabIndex={0}
            aria-label="Add Licence Type"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onAddLicenceType.onTrue();
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
            Add Licence Type
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
                  onDelete(row as ILicenceType);
                }}
                handleEditClick={() => {
                  onEdit(row as ILicenceType);
                }}
              />
            );
          },
        },
      ]}
      data={licenceTypeData || []}
    />
  );
};

export default LicenceTypeTable;
