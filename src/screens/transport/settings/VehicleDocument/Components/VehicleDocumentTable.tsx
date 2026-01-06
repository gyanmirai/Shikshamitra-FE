import React from 'react';
import { Box, Typography } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetVehicleDocumentsQuery } from 'src/redux/transport/vehicle-management/vehicleSettingsApi';

import type { IVehicleDocument, IVehicleDocumentTableProps } from './type';

const VehicleDocumentTable: React.FC<IVehicleDocumentTableProps> = ({
  onAddVehicleDocument,
  setOpenDialog,
  setEditData,
  onDelete,
  onEdit,
}) => {
  const { data: vehicleDocumentData, isLoading: vehicleDocumentsLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetVehicleDocumentsQuery,
  });

  // Transform API response to match table format
  const transformedData = React.useMemo(() => {
    if (!vehicleDocumentData) return [];
    return vehicleDocumentData.map((item: any) => ({
      ...item,
      documentName: item.name || item.documentName,
      documentSize: item.maxSizeMb || item.documentSize,
      acceptedFormat: item.acceptedFormats || item.acceptedFormat,
      required: item.isRequired ?? item.required,
    }));
  }, [vehicleDocumentData]);

  return (
    <CustomizableTable
      tableId="vehicle-document-data-table"
      isLoading={vehicleDocumentsLoading}
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
      columns={[
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
      ]}
      data={transformedData}
    />
  );
};

export default VehicleDocumentTable;
