'use client';

import React from 'react';

import { Box } from '@mui/material';

import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type { ISubject, ISubjectTableProps } from './type';

const HostelIncidentTable: React.FC<ISubjectTableProps> = ({
  data,
  onAddSubject,
  editData,
  open,
  setOpenDialog,
  setEditData,
  onDelete,
  onEdit,
}) => (
  <CustomizableTable
    tableId="hostel-incident-data-table"
    searchFieldProps={{
      placeholder: 'Search by Subject Name...',
      label: 'Search by Subject Name...',
      sx: {
        maxWidth: '400px',
        width: '100%',
      },
    }}
    noDataText={
      <>
        No Incident Data Found{' '}
        <Box
          onClick={() => {
            onAddSubject.onTrue();
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
          Log Visitor
        </Box>
      </>
    }
    columns={[
      { id: 'subjectName', label: 'Subject Name', align: 'left' },
      {
        id: 'subjectColor',
        label: 'Subject Color',
        align: 'left',
        isFilter: false,
        isSort: false,
        render(value, row) {
          return (
            <Box
              sx={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                backgroundColor: row.subjectColor,
              }}
            />
          );
        },
      },
      {
        id: 'action',
        label: 'Action',
        minWidth: 50,
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
                onDelete(row as ISubject);
              }}
              handleEditClick={() => {
                onEdit(row as ISubject);
              }}
            />
          );
        },
      },
    ]}
    data={data}
  />
);

export default HostelIncidentTable;
