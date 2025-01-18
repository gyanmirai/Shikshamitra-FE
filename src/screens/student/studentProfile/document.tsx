import React from 'react';

import { IconButton } from '@mui/material';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomizableTable from 'src/components/customizabaleTable';

import type { StudentTabsComponentType } from '.';

// const GB = 1000000000 * 24;

const Document = (props: StudentTabsComponentType) => (
  <CustomizableTable
    tableId="student-document"
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
      {
        name: 'Certificate_BonafiedTabular.pdf',
        status: 'Pending',
        upload: 'Upload',
        view: 'View',
      },
      {
        name: 'Certificate_Bonafied_Double.pdf',
        status: 'Uploaded',
        upload: 'Upload',
        view: 'View',
      },
      {
        name: 'Certificate_Bonafied_LetterHead.pdf',
        status: 'Pending',
        upload: 'Upload',
        view: 'View',
      },
      {
        name: 'Certificate_Bonafied_WithAddress.pdf',
        status: 'Pending',
        upload: 'Upload',
        view: 'View',
      },
      {
        name: 'Certificate_Bonafied_WithPreviousDetai',
        status: 'Pending',
        upload: 'Upload',
        view: 'View',
      },
      {
        name: 'Certificate_CBSETransfer.pdf',
        status: 'Pending',
        upload: 'Upload',
        view: 'View',
      },
      {
        name: 'Certificate_Transfer_CBSE.pdf',
        status: 'Pending',
        upload: 'Upload',
        view: 'View',
      },
      {
        name: 'First Trial Certificates.pdf',
        status: 'Pending',
        upload: 'Upload',
        view: 'View',
      },
    ]}
  />
);
export default Document;
