'use client';

import type { Medium } from 'src/types/school';
import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';

import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { SubjectColorIndicator } from 'src/components/subject-color/SubejctColor';
import { useGetCoreSubjectsByMediumQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Setting/Core-SubjectApi';

import type { ISubject, ISubjectTableProps } from './type';

const SettingSubjectTable: React.FC<ISubjectTableProps> = ({
  open,
  setOpenDialog,
  setEditData,
  onDelete,
  onEdit,
  onOpenDrawer,
  canAdd = true,
  canView = true,
  canDelete = true,
}) => {
  const { currentMedium } = useSelector((state: RootState) => state.globalState);
  const {
    data: subjectData,
    isLoading,
    isFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetCoreSubjectsByMediumQuery,
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
        width: 60,
        align: 'left',
        isSort: false,
        sticky: true,
        isFilter: false,
        render(value, row) {
          return (
            <ThreeDotsActions
              showThreeDots={false}
              placement="right-top"
              showDeleteIcon={canDelete}
              showEditIcon={canAdd}
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
    [canAdd, canDelete, onDelete, onEdit]
  );

  return (
    <CustomizableTable
      tableId="subject-data-table"
      isLoading={isLoading || isFetching}
      noDataText={
        <>
          Subject Data Not Found{' '}
          {canAdd && (
            <Box
              onClick={() => {
                onOpenDrawer();
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
          )}
        </>
      }
      columns={columns}
      data={subjectData || []}
    />
  );
};

export default SettingSubjectTable;
