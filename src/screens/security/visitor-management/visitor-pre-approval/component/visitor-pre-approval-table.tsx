import dayjs from 'dayjs';
import React from 'react';

import { Box } from '@mui/material';

import data from 'src/json/security/visitor-management/visitor-pre-approval-data.json';

import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type {
  IVisitorPreApprovalFormValues,
  IVisitorPreApprovalTableTableProps,
} from '../visitor-pre-approval-interface';

const VisitorApprovalTable: React.FC<IVisitorPreApprovalTableTableProps> = ({ onClick }) => (
  <CustomizableTable
    tableId="my-resources-table"
    searchFieldProps={{
      placeholder: 'Search by Name,...',
      label: 'Search by Name...',
      sx: {
        maxWidth: '400px',
        width: '100%',
      },
    }}
    noDataText={
      <>
        No Visitor Approval Found.
        <Box
          onClick={() => {
            onClick(null, 'new');
          }}
          color="primary.main"
          fontWeight={600}
          sx={{
            '&:hover': {
              cursor: 'pointer',
              color: 'primary.main',
              textDecoration: 'underline',
            },
          }}
        >
          New Approval Request
        </Box>
      </>
    }
    columns={[
      {
        label: 'Visitor Name',
        id: 'visitorName',
      },
      {
        label: 'Visiting Contact',
        id: 'visitorPhone',
      },
      {
        label: 'Visiting Email',
        id: 'visitorEmail',
      },

      {
        label: 'Visiting Date',
        id: 'visitingDate',

        filterType: 'date',
        render: (value) => (value ? dayjs(value).format('DD MMM YYYY') : null),
      },
      {
        label: 'Visiting Time',
        id: 'visitingTime',
        isFilter: false,
        isSort: false,

        render: (value) => (value ? dayjs(value).format('DD MMM YYYY') : null),
      },
      {
        id: 'action',
        label: 'Actions',
        align: 'left',
        minWidth: 100,
        sticky: true,
        isFilter: false,
        isSort: false,
        render(value, row) {
          return (
            <ThreeDotsActions
              placement="right-top"
              showThreeDots={false}
              showDeleteIcon
              showEditIcon
              showViewIcon
              handleDeleteClick={() => {
                onClick(row as IVisitorPreApprovalFormValues, 'delete');
              }}
              handleEditClick={() => {
                onClick(row as IVisitorPreApprovalFormValues, 'edit');
              }}
              handleViewClick={() => {
                onClick(row as IVisitorPreApprovalFormValues, 'view');
              }}
              //   actions={({ popover }) => (
              //     // <MenuList>
              //     //   <MenuItem
              //     //     onClick={() => {
              //     //       onClick(row as IMyResources, 'concern');
              //     //       popover.onClose();
              //     //     }}
              //     //     sx={{ color: 'error.main' }}
              //     //   >
              //     //     <Iconify
              //     //       icon="pepicons-pencil:raise-hand"
              //     //       sx={{ height: '16px', width: '16px' }}
              //     //     />
              //     //     Raise Concern
              //     //   </MenuItem>
              //     // </MenuList>
              //   )}
            />
          );
        },
      },
    ]}
    data={data}
  />
);

export default VisitorApprovalTable;
