import type { IColumn } from 'src/components/customizable-table/types';

import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizable-table';

import type { IVehicleDocument, IVehicleDocumentTableProps } from './type';

const VehicleDocumentTable: React.FC<IVehicleDocumentTableProps> = ({
  onAddVehicleDocument,
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
    return data.map((item: any) => ({
      ...item,
      documentName: item.name || item.documentName,
      documentSize: item.maxSizeMb || item.documentSize,
      acceptedFormat: item.acceptedFormats || item.acceptedFormat,
      required: item.isRequired ?? item.required,
    }));
  }, [data]);

  const columns: IColumn[] = useMemo(
    () => [
      {
        id: 'documentName',
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
        id: 'documentSize',
        label: 'Document Size',
        align: 'left',
        render: (value) => (
          <Typography variant="caption" fontSize="13px">
            {value ? `${value} MB` : '-'}
          </Typography>
        ),
      },
      {
        id: 'acceptedFormat',
        label: 'Accepted Format',
        align: 'left',
        render: (value) => (
          <Typography variant="caption" fontSize="13px">
            {value || '-'}
          </Typography>
        ),
      },
      {
        id: 'required',
        label: 'Required/Optional',
        align: 'left',
        minWidth: 180,
        render: (value, row) => (
          <Typography variant="caption" fontSize="13px">
            {value === true ? 'Required' : 'Optional'}
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
                onDelete(row as IVehicleDocument);
              }}
              handleEditClick={() => {
                onEdit(row as IVehicleDocument);
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
      tableId="vehicle-document-data-table"
      isLoading={isLoading}
      noDataText={
        <>
          Required Vehicle Document Data Not Found{' '}
          <Box
            onClick={() => {
              onAddVehicleDocument.onTrue();
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
            Add Required Vehicle Document
          </Box>
        </>
      }
      columns={columns}
      data={transformedData}
    />
  );
};

export default VehicleDocumentTable;
