'use client';

import React from 'react';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IAssignmentType, IAssignmentTypeTableProps } from './type';

const AssignmentTypeTable: React.FC<IAssignmentTypeTableProps> = ({ data, onDelete, onEdit }) => (
  <CustomizableTable
    tableId="assignment-type-data-table"
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
    data={data}
  />
);

export default AssignmentTypeTable;
