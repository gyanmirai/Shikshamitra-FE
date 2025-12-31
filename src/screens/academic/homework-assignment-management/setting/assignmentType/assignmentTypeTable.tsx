'use client';

import type { Medium } from 'src/types/school';
import type { RootState } from 'src/redux/store';

import React from 'react';
import { Box } from '@mui/material';
import { useSelector } from 'react-redux';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetAssignmentTypesQuery } from 'src/redux/academicAPI/HomeworkAssignmentApi/Settings/AssignmentTypesApi';

import type { IAssignmentType, IAssignmentTypeTableProps } from './type';

const AssignmentTypeTable: React.FC<IAssignmentTypeTableProps> = ({
  data,
  onDelete,
  onEdit,
  onCreate,
}) => {
  const { currentMedium } = useSelector((state: RootState) => state.globalState);

  const {
    data: apiData,
    isLoading,
    isFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAssignmentTypesQuery,
    params: { academicMediumId: (currentMedium as Medium)?.id },
    options: {
      skip: !!data || !(currentMedium as Medium)?.id, // skip API if data is passed
    },
    popupConfig: {
      error: false,
    },
  });

  const tableData = data ?? apiData ?? [];

  return (
    <CustomizableTable
      tableId="assignment-type-data-table"
      isLoading={isLoading || isFetching}
      noDataText={
        <>
          No Assignment Type Data Found{' '}
          {onCreate && (
            <Box
              onClick={() => onCreate()}
              color="primary.main"
              fontWeight={600}
              component="span"
              sx={{
                ml: 0.5,
                cursor: 'pointer',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              Add Assignment Type
            </Box>
          )}
        </>
      }
      columns={[
        {
          id: 'assignmentTypeName',
          label: 'Name',
          align: 'left',
        },
        {
          id: 'action',
          label: 'Actions',
          minWidth: 50,
          isSort: false,
          sticky: true,
          isFilter: false,
          render: (_value, row) => (
            <ThreeDotsActions
              showThreeDots={false}
              placement="right-top"
              showDeleteIcon
              showEditIcon
              handleDeleteClick={() => onDelete(row as IAssignmentType)}
              handleEditClick={() => onEdit(row as IAssignmentType)}
            />
          ),
        },
      ]}
      data={tableData}
    />
  );
};

export default AssignmentTypeTable;
