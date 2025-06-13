'use client';

import React from 'react';

import { Box } from '@mui/material';

import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { SubjectColorIndicator } from 'src/components/subject-color/SubejctColor';

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
    tableId="hostel-subject-data-table"
    noDataText={
      <>
        No Subject Data Found{' '}
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
          Subject
        </Box>
      </>
    }
    columns={[
      { id: 'subjectName', label: 'Subject Name', align: 'left' },
      {
        id: 'subjectColor',
        label: 'Subject Color',
        isFilter: false,
        isSort: false,
        render(value, row) {
          return <SubjectColorIndicator color={value} />;
        },
      },
      { id: 'createdBy', label: 'Created By', align: 'left' },
      {
        id: 'action',
        label: 'Actions',
        minWidth: 70,
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
