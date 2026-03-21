'use client';

import type { Medium } from 'src/types/school';
import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizable-table/types';

import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizable-table';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { SubjectColorIndicator } from 'src/components/subject-color/SubejctColor';
import { useGetSubjectsQuery } from 'src/redux/academic-api/curriculum-management-api/setting/Core-SubjectApi';

import type { ISubject, ISubjectTableProps } from './type';

const SettingSubjectTable: React.FC<ISubjectTableProps> = ({
  onAddSubject,
  editData,
  open,
  setOpenDialog,
  setEditData,
  onDelete,
  onEdit,
}) => {
  const { currentMedium } = useSelector((state: RootState) => state.globalState);
  const {
    data: subjectData,
    isLoading,
    isFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSubjectsQuery,
    params: { academicMediumId: (currentMedium as Medium)?.id },
    options: {
      skip: !(currentMedium as Medium)?.id,
    },
  });

  const columns: IColumn[] = useMemo(
    () => [
      {
        id: 'name',
        label: 'Subject Name',
        align: 'left',
        render: (value, row) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <SubjectColorIndicator color={row.color} />
            <Typography variant="caption" fontSize="13px">
              {value}
            </Typography>
          </Box>
        ),
      },
      {
        id: 'action',
        label: 'Actions',
        minWidth: 60,
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
    ],
    [onDelete, onEdit]
  );

  return (
    <CustomizableTable
      tableId="subject-data-table"
      isLoading={isLoading || isFetching}
      noDataText={
        <>
          Subject Data Not Found{' '}
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
      columns={columns}
      data={subjectData || []}
    />
  );
};

export default SettingSubjectTable;
