'use client';

import React from 'react';

import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IHomeworkType, IHomeworkTypeTableProps } from './type';

const HomeworkTypeTable: React.FC<IHomeworkTypeTableProps> = ({ data, onDelete, onEdit }) => (
  <CustomizableTable
    tableId="homework-type-data-table"
    noDataText="No Homework Type Data Found"
    columns={[
      {
        id: 'homeworkTypeName',
        label: 'Homework Type Name',
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
              onDelete(row as IHomeworkType);
            }}
            handleEditClick={() => {
              onEdit(row as IHomeworkType);
            }}
          />
        ),
      },
    ]}
    data={[
      { homeworkTypeName: 'Classwork' },
      { homeworkTypeName: 'Homework' },
      { homeworkTypeName: 'Assignment' },
      { homeworkTypeName: 'Project' },
      { homeworkTypeName: 'Lab Report' },
      { homeworkTypeName: 'Group Task' },
      { homeworkTypeName: 'Weekly Review' },
    ]}
  />
);

export default HomeworkTypeTable;
