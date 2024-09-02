import React from 'react';

import { Box, IconButton } from '@mui/material';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomizableTable from 'src/components/customizabaleTable';

const QualificationAndCertification = () => (
  <Box>
    <CustomizableTable
      columns={[
        { id: 'name', label: 'Name' },
        {
          id: 'status',
          label: 'Status',
          render(value, row) {
            return (
              <Label color={row.status === 'Uploaded' ? 'success' : 'warning'}>{row.status}</Label>
            );
          },
        },
        {
          id: 'upload',
          label: 'Upload',
          render(value, row) {
            return (
              <IconButton>
                <Iconify icon="ri:file-upload-fill" />
              </IconButton>
            );
          },
        },
        {
          id: 'view',
          label: 'View',
          render(value, row) {
            return (
              <IconButton>
                <Iconify icon="carbon:view-filled" />
              </IconButton>
            );
          },
        },
      ]}
      data={[
        { name: 'Certificate 1', status: 'Pending', upload: 'Upload', view: 'View' },
        { name: 'Certificate 2', status: 'Uploaded', upload: 'Upload', view: 'View' },
        { name: 'Certificate 3', status: 'Pending', upload: 'Upload', view: 'View' },
      ]}
    />
  </Box>
);
export default QualificationAndCertification;
