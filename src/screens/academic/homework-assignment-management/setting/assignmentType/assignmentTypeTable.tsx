'use client';

import React from 'react';
import { Label } from 'src/components/label';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IAssignmentType, IAssignmentTypeTableProps } from './type';

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

const AssignmentTypeTable: React.FC<IAssignmentTypeTableProps> = ({
  isLoading,
  data,
  onDelete,
  onEdit,
  canAdd = true,
  canDelete = true,
}) => (
  <CustomizableTable
    tableId="assignment-type-data-table"
    isLoading={isLoading}
    noDataText="No Assignment Type Data Found"
    columns={[
      {
        id: 'assignmentTypeName',
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
        id: 'defaultMarks',
        label: 'Default Marks',
        align: 'right',
        minWidth: 130,
        filterType: 'number',
        render: (_value, row) => row.defaultMarks ?? '-',
      },
      {
        id: 'defaultDueDays',
        label: 'Default Due Days',
        align: 'right',
        minWidth: 150,
        filterType: 'number',
        render: (_value, row) => row.defaultDueDays ?? '-',
      },
      {
        id: 'evaluationRequired',
        label: 'Evaluation Required',
        align: 'center',
        minWidth: 160,
        filterType: 'enum',
        enumOptions: [
          { label: 'Yes', value: true },
          { label: 'No', value: false },
        ],
        render: (_value, row) => (
          <Label variant="soft" color={row.evaluationRequired ? 'success' : 'default'}>
            {row.evaluationRequired ? 'Yes' : 'No'}
          </Label>
        ),
      },
      {
        id: 'defaultEvaluationMethod',
        label: 'Default Evaluation Method',
        align: 'left',
        minWidth: 210,
        filterType: 'enum',
        enumOptions: enumOptionsFromMap(EVALUATION_METHOD_MAP),
        render: (_value, row) => {
          if (!row.evaluationRequired) {
            return (
              <Label variant="soft" color="default">
                No Evaluation
              </Label>
            );
          }
          const method = row.defaultEvaluationMethod;
          if (method === undefined || method === null || method === '') return 'Required';
          return EVALUATION_METHOD_MAP[method] || 'Unknown';
        },
      },
      {
        id: 'status',
        label: 'Status',
        align: 'center',
        minWidth: 110,
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
        id: 'usageCount',
        label: 'Usage',
        align: 'right',
        minWidth: 100,
        filterType: 'number',
        render: (_value, row) => row.usageCount ?? 0,
      },
      {
        id: 'action',
        label: 'Actions',
        minWidth: 50,
        width: 50,
        isSort: false,
        sticky: true,
        stickyPosition: 'right',
        isFilter: false,
        render: (_value, row) => (
          <ThreeDotsActions
            showThreeDots={false}
            placement="right-top"
            showDeleteIcon={canDelete}
            showEditIcon={canAdd}
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
    data={data || []}
  />
);

export default AssignmentTypeTable;
