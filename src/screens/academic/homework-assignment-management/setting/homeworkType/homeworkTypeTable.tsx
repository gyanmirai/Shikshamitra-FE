'use client';

import React from 'react';
import { Label } from 'src/components/label';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IHomeworkType, IHomeworkTypeTableProps } from './type';

const SUBMISSION_TYPE_MAP: Record<number, string> = {
  0: 'Online Text',
  1: 'File Upload',
  2: 'In-Person',
  3: 'No Submission Required',
};

const EVALUATION_METHOD_MAP: Record<number, string> = {
  0: 'Marks',
  1: 'Grade',
  2: 'Rubric',
  3: 'Checklist',
  4: 'Feedback Only',
  5: 'No Evaluation',
};

const enumOptionsFromMap = (options: Record<number, string>) =>
  Object.entries(options).map(([value, label]) => ({ label, value: Number(value) }));

const HomeworkTypeTable: React.FC<IHomeworkTypeTableProps> = ({
  isLoading,
  data,
  onDelete,
  onEdit,
  canAdd = true,
  canDelete = true,
}) => (
  <CustomizableTable
    tableId="homework-type-data-table"
    isLoading={isLoading}
    noDataText="No Homework Type Data Found"
    columns={[
      {
        id: 'homeworkTypeName',
        label: 'Name',
        align: 'left',
        minWidth: 180,
        sticky: true,
        stickyPosition: 'left',
      },
      {
        id: 'description',
        label: 'Description',
        align: 'left',
        minWidth: 220,
        render: (_value, row) => row.description || '-',
      },
      {
        id: 'defaultSubmissionType',
        label: 'Default Submission',
        align: 'left',
        minWidth: 170,
        filterType: 'enum',
        enumOptions: enumOptionsFromMap(SUBMISSION_TYPE_MAP),
        render: (_value, row) => {
          const type = row.defaultSubmissionType;
          if (type === undefined || type === null || type === '') return '-';
          return (
            <Label variant="soft" color="info">
              {SUBMISSION_TYPE_MAP[type] || 'Unknown'}
            </Label>
          );
        },
      },
      {
        id: 'defaultDueDays',
        label: 'Default Due Days',
        minWidth: 150,
        filterType: 'number',
        render: (_value, row) => row.defaultDueDays ?? '-',
      },
      {
        id: 'usageCount',
        label: 'Usage',
        minWidth: 100,
        filterType: 'number',
        render: (_value, row) => row.usageCount ?? 0,
      },
      {
        id: 'status',
        label: 'Status',
        minWidth: 110,
        sticky: true,
        filterType: 'enum',
        enumOptions: [
          { label: 'Active', value: 0 },
          { label: 'Inactive', value: 1 },
        ],
        render: (_value, row) => {
          const isActive = row.status === 0;
          return (
            <Label variant="soft" color={isActive ? 'success' : 'error'}>
              {isActive ? 'Active' : 'Inactive'}
            </Label>
          );
        },
      },
      {
        id: 'action',
        label: 'Actions',
        minWidth: 50,
        width: 50,
        isSort: false,
        sticky: true,
        isFilter: false,
        render: (_value, row) => (
          <ThreeDotsActions
            showThreeDots={false}
            placement="right-top"
            showDeleteIcon={canDelete}
            showEditIcon={canAdd}
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
    data={data || []}
  />
);

export default HomeworkTypeTable;
