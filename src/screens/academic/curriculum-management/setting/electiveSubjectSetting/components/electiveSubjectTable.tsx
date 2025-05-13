'use client';

import React from 'react';

import { Box, Chip } from '@mui/material';

import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IElectiveSubject, IElectiveSubjectTableProps } from '../type';

const ElectiveSubjectTable: React.FC<IElectiveSubjectTableProps> = ({
  data,
  onAddElective,
  editData,
  open,
  setOpenDialog,
  setEditData,
  onDelete,
  onEdit,
}) => (
  <CustomizableTable
    tableId="elective-subject-data-table"
    searchFieldProps={{
      placeholder: 'Search by Title...',
      label: 'Search by Title...',
    }}
    noDataText={
      <>
        No Elective Subject Found{' '}
        <Box
          onClick={() => {
            onAddElective.onTrue();
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
          Add Elective Subject
        </Box>
      </>
    }
    columns={[
      { id: 'title', label: 'Title', align: 'left' },
      {
        id: 'subjects',
        label: 'Subjects',
        align: 'left',
        render: (value) => (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {value.map((subject: { name: string }) => (
              <Chip key={subject.name} label={subject.name} size="small" variant="outlined" />
            ))}
          </Box>
        ),
      },
      {
        id: 'action',
        label: 'Actions',
        minWidth: 80,
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
                onDelete(row as IElectiveSubject);
              }}
              handleEditClick={() => {
                onEdit(row as IElectiveSubject);
              }}
            />
          );
        },
      },
    ]}
    data={data}
  />
);

export default ElectiveSubjectTable;
