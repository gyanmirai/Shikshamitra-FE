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

export const groupList = [
  {
    id: 'g1',
    name: 'Science Group - 10th Grade',
    description: 'Group for all 10th-grade science stream students and teachers.',
    boards: ['GSEB'],
    mediums: ['English'],
    organizations: ['Sunrise Public School'],
    classes: ['10'],
    divisions: ['A', 'B'],
    users: ['u1', 'u2', 'u3'],
    roles: ['Teacher', 'Student'],
    total: 3,
    employees: ['e1'],
  },
  {
    id: 'g2',
    name: 'Mathematics Group - 9th Grade',
    description: 'Focus group for advanced mathematics learning and assignments.',
    boards: ['CBSE'],
    mediums: ['English'],
    organizations: ['Bright Future Academy'],
    classes: ['9'],
    divisions: ['A'],
    users: ['u4', 'u5', 'u6', 'u7'],
    roles: ['Student', 'Assistant Teacher'],
    total: 4,
    employees: ['e2', 'e3'],
  },
  {
    id: 'g3',
    name: 'Computer Science - 11th Grade',
    description: 'Group for computer science stream students and mentors.',
    boards: ['ICSE'],
    mediums: ['English'],
    organizations: ['TechVision High School'],
    classes: ['11'],
    divisions: ['A', 'B'],
    users: ['u8', 'u9'],
    roles: ['Student', 'Mentor'],
    total: 2,
    employees: ['e4'],
  },
];

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
          <Typography fontSize="13px" variant="caption">
            {value}
          </Typography>
        ),
      },
      {
        id: 'description',
        label: 'Description',
        align: 'left',

        render: (value) => (
          <Typography fontSize="13px" variant="caption">
            {value || '-'}
          </Typography>
        ),
      },
      {
        id: 'total',
        label: 'Total Audience',
        align: 'center',
        render: (value) => (
          <Typography fontSize="13px" variant="caption">
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
    data={groupList || []}
  />
);

export default GroupTable;
