'use client';

import type { Medium } from 'src/types/school';
import type { RootState } from 'src/redux/store';

import React from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { SubjectColorIndicator } from 'src/components/subject-color/SubejctColor';
import { useGetElectiveGroupsQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Setting/Elective-GroupApi';

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
}) => {
  const { currentMedium } = useSelector((state: RootState) => state.globalState);
  const {
    data: electiveGroupData,
    isLoading,
    isFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetElectiveGroupsQuery,
    params: { academicMediumId: (currentMedium as Medium)?.id },
    options: {
      skip: !(currentMedium as Medium)?.id,
    },
  });
  return (
    <CustomizableTable
      isLoading={isLoading || isFetching}
      tableId="elective-subject-data-table"
      // searchFieldProps={{
      //   placeholder: 'Search by Elective Group, Subjects...',
      //   label: 'Search by Elective Group, Subjects...',
      //   sx: {
      //     maxWidth: '450px',
      //     width: '100%',
      //   },
      // }}
      noDataText={
        <>
          Elective Subject Data Not Found{' '}
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
        {
          id: 'title',
          label: 'Elective Group',
          align: 'left',
          render: (value, row) => (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <SubjectColorIndicator color={row.subjectColor} />
              <Typography variant="caption" fontSize="13px">
                {value}
              </Typography>
            </Box>
          ),
        },
        {
          id: 'subjects',
          label: 'Subjects List',
          align: 'left',
          render: (value) => (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {value.map((subject: { name: string; subjectColor: string }) => (
                <Box key={subject.name} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <SubjectColorIndicator color={subject.subjectColor} />
                  <Typography variant="caption" fontSize="13px">
                    {subject.name}
                  </Typography>
                </Box>
              ))}
            </Box>
          ),
        },
        {
          id: 'action',
          label: 'Actions',
          minWidth: 60,
          isSort: false,
          align: 'left',
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
      data={electiveGroupData || []}
    />
  );
};

export default ElectiveSubjectTable;
