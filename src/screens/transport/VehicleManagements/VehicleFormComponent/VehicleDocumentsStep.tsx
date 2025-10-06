import type { FormikProps } from 'formik';

import { Iconify } from 'src/components/iconify';
import { Tooltip, IconButton } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetDocumentRowsQuery } from 'src/redux/transport/vehicle-management/vehicleDocumentDataApi';

import type { IVehiclePayload } from '../Components/type';

interface VehicleDocumentsStepProps {
  formik: FormikProps<IVehiclePayload>;
}

const VehicleDocumentsStep = ({ formik }: VehicleDocumentsStepProps) => {
  const { data: documentRows } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetDocumentRowsQuery,
  });

  // Prepare table data from formik values
  const documents = documentRows?.map((doc: { key: string | number }) => {
    const file = formik.values.documents?.[doc.key] || null;
    return {
      ...doc,
      status: file ? 'Uploaded' : 'Pending',
      file,
    };
  });

  return (
    <CustomizableTable
      tableId="vehicle-documents"
      noDataText={<>No document data available.</>}
      columns={[
        { id: 'name', label: 'Name', align: 'left' },
        // { id: 'acceptedFormat', label: 'Accepted Format', align: 'left' },
        {
          id: 'status',
          label: 'Status',
          minWidth: '80px',
          align: 'left',
          isFilter: false,
          render(value, row) {
            return (
              <Tooltip title={row.status}>
                <Iconify
                  icon={row.status === 'Uploaded' ? 'mdi:approve' : 'mage:file-cross-fill'}
                  height={20}
                  width={20}
                  sx={{
                    color: (theme) =>
                      row.status === 'Uploaded' ? 'success.main' : theme.vars.palette.grey[500],
                    cursor: 'pointer',
                  }}
                />
              </Tooltip>
            );
          },
        },
        {
          id: 'upload',
          label: 'Upload',
          isFilter: false,
          minWidth: '80px',
          align: 'left',
          isSort: false,
          render(value, row) {
            return (
              <IconButton
                component="label"
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'transparent',
                  transition: 'background-color 0.2s ease',
                  '&:hover': { backgroundColor: '#e0e0e0' },
                  p: 0,
                  minWidth: 0,
                }}
              >
                <input
                  hidden
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      formik.setFieldValue(`documents.${row.key}`, file);
                    }
                  }}
                />
                <Iconify icon="ci:file-upload" />
              </IconButton>
            );
          },
        },
        {
          id: 'view',
          label: 'View',
          isFilter: false,
          isSort: false,
          minWidth: '6vw',
          align: 'left',
          render(value, row) {
            return (
              <IconButton
                style={{
                  textAlign: 'left',
                  marginLeft: '0px',
                  justifyContent: 'flex-start',
                  display: 'flex',
                }}
                disabled={row.status !== 'Uploaded'}
                onClick={() => {
                  if (row.file) {
                    window.open(URL.createObjectURL(row.file), '_blank');
                  }
                }}
              >
                <Iconify icon="carbon:view-filled" />
              </IconButton>
            );
          },
        },
        {
          id: 'download',
          label: 'Download',
          isFilter: false,
          isSort: false,
          minWidth: '6vw',
          align: 'left',
          render(value, row) {
            return (
              <IconButton
                style={{
                  textAlign: 'left',
                  marginLeft: '0px',
                  justifyContent: 'flex-start',
                  display: 'flex',
                }}
                disabled={row.status !== 'Uploaded'}
                onClick={() => {
                  if (row.file) {
                    const url = URL.createObjectURL(row.file);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = row.name;
                    link.click();
                  }
                }}
              >
                <Iconify icon="mdi:download" />
              </IconButton>
            );
          },
        },
      ]}
      data={documents || []}
    />
  );
};

export default VehicleDocumentsStep;
