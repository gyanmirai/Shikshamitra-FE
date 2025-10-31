import React from 'react';
import { Box, Typography } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

interface GroupTableProps {
  onEdit: (row: any) => void;
  onDelete: (row: any) => void;
  onView: (row: any) => void;
  setOpen: (value: boolean) => void;
}

const GroupTable: React.FC<GroupTableProps> = ({ onEdit, onDelete, onView, setOpen }) => (
  <CustomizableTable
    tableId="group-table"
    noDataText={
      <>
        No group data found
        <Box
          onClick={() => {
            setOpen(true);
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
          Add Group
        </Box>
      </>
    }
    columns={[
      {
        id: 'groupName',
        label: 'Group Name',
        align: 'left',
        sticky: true,
        render: (value) => (
          <Typography fontSize="13px" fontWeight={500}>
            {value}
          </Typography>
        ),
      },
      {
        id: 'description',
        label: 'Description',
        align: 'left',

        render: (value) => (
          <Typography fontSize="13px" color="text.secondary">
            {value || '-'}
          </Typography>
        ),
      },
      {
        id: 'totalAudience',
        label: 'Total Audience',
        align: 'center',

        render: (value) => (
          <Typography fontSize="13px" fontWeight={600}>
            {value ?? 0}
          </Typography>
        ),
      },
      {
        id: 'action',
        label: 'Actions',
        align: 'left',
        minWidth: 60,
        isSort: false,
        isFilter: false,
        sticky: true,
        render: (_, row) => (
          <ThreeDotsActions
            placement="right-top"
            // actions={(prop) => actions({ ...prop, row })}
            showEditIcon
            showDeleteIcon
            showViewIcon
            showThreeDots={false}
            handleEditClick={() => onEdit(row)}
            handleDeleteClick={() => onDelete(row)}
            handleViewClick={() => onView(row)}
          />
        ),
      },
    ]}
    data={[]}
  />
);

export default GroupTable;
