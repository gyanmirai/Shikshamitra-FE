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
      },
      {
        id: 'defaultSubmissionType',
        label: 'Default Submission',
        align: 'left',
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
        id: 'defaultEvaluationMethod',
        label: 'Evaluation',
        align: 'left',
        render: (_value, row) => {
          if (!row.evaluationRequired) {
            return (
              <Label variant="soft" color="default">
                No Evaluation
              </Label>
            );
          }
          const method = row.defaultEvaluationMethod;
          if (method === undefined || method === null || (method as any) === '') return '-';
          return EVALUATION_METHOD_MAP[method] || 'Unknown';
        },
      },
      {
        id: 'status',
        label: 'Status',
        align: 'center',
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
        id: 'usageCount',
        label: 'Usage',
        align: 'right',
        render: (_value, row) => row.usageCount ?? 0,
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
