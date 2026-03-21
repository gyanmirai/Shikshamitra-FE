import type { IColumn } from 'src/components/customizable-table/types';

import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizable-table';

import type { IServiceType, IServiceTypeTableProps } from './type';

const ServiceTypeTable: React.FC<IServiceTypeTableProps> = ({
  onAddServiceType,
  setOpenDialog,
  setEditData,
  onDelete,
  onEdit,
  data,
  isLoading,
}) => {
  // Transform API response to match table format
  const transformedData = React.useMemo(() => {
    const dataToUse = data && data.length > 0 ? data : [];
    return dataToUse.map((item: any) => ({
      ...item,
      typeName: item.name || item.typeName,
    }));
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
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <CustomizableTable
      tableId="service-type-data-table"
      isLoading={isLoading}
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
      columns={columns}
      data={transformedData}
    />
  );
};

export default ServiceTypeTable;
