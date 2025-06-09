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
      placeholder: 'Search by Elective Group, Subjects...',
      label: 'Search by Elective Group, Subjects...',
      sx: {
        maxWidth: '450px',
        width: '100%',
      },
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
          Add Elective Group
        </Box>
      </>
    }
    columns={[
      { id: 'title', label: 'Elective Group', align: 'left' },
      {
        id: 'subjects',
        label: 'Subjects List',
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
        id: 'subjectColor',
        label: 'Elective Group Color',
        align: 'center',
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
      { id: 'createdBy', label: 'Created By', align: 'left' },
      {
        id: 'action',
        label: 'Actions',
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
