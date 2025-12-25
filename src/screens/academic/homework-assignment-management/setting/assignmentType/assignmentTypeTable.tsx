'use client';

import type { Medium } from 'src/types/school';
import type { RootState } from 'src/redux/store';

import React from 'react';
import { useSelector } from 'react-redux';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetAssignmentTypesQuery } from 'src/redux/academicAPI/HomeworkAssignmentApi/Settings/AssignmentTypesApi';

import type { IAssignmentType, IAssignmentTypeTableProps } from './type';

const AssignmentTypeTable: React.FC<IAssignmentTypeTableProps> = ({ onDelete, onEdit }) => {
  const { currentMedium } = useSelector((state: RootState) => state.globalState);

  const {
    data: assignmentTypeData,
    isLoading,
    isFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAssignmentTypesQuery,
    params: { academicMediumId: (currentMedium as Medium)?.id },
    options: {
      skip: !(currentMedium as Medium)?.id,
    },
    popupConfig: {
      error: false, // Suppress error toasts to prevent state updates during render
    },
  });

  return (
    <CustomizableTable
      tableId="assignment-type-data-table"
      isLoading={isLoading || isFetching}
      noDataText="No Assignment Type Data Found"
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
              handleDeleteClick={() => {
                onDelete(row as IAssignmentType);
              }}
              handleEditClick={() => {
                onEdit(row as IAssignmentType);
              }}
            />
          ),
        },
      ]}
      data={assignmentTypeData || []}
    />
  );
};

export default AssignmentTypeTable;
