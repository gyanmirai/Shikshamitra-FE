'use client';

import React from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Stack, IconButton } from '@mui/material';
import CustomTooltip from 'src/components/custom-tooltip';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import {
  AssignmentSubmissionType,
  AssignmentEvaluationMethod,
  ASSIGNMENT_SUBMISSION_TYPE_LABELS,
  ASSIGNMENT_EVALUATION_METHOD_LABELS,
} from 'src/enums/assignment';

import type { IAssignmentType, IAssignmentTypeTableProps } from './type';

const enumOptionsFromMap = (options: Record<number, string>) =>
  Object.entries(options).map(([value, label]) => ({ label, value: Number(value) }));

const AssignmentTypeTable: React.FC<IAssignmentTypeTableProps> = ({
  isLoading,
  data,
  onDelete,
  onArchive,
  onRestore,
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
        enumOptions: enumOptionsFromMap(ASSIGNMENT_SUBMISSION_TYPE_LABELS),
        render: (_value, row) => {
          const type = row.defaultSubmissionType;
          if (type === undefined || type === null) return '-';
          return (
            <Label variant="soft" color="info">
              {ASSIGNMENT_SUBMISSION_TYPE_LABELS[type as AssignmentSubmissionType] || 'Unknown'}
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
        id: 'usageCount',
        label: 'Usage',
        align: 'right',
        minWidth: 100,
        filterType: 'number',
        render: (_value, row) => row.usageCount ?? 0,
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
        enumOptions: enumOptionsFromMap(ASSIGNMENT_EVALUATION_METHOD_LABELS),
        render: (_value, row) => {
          if (!row.evaluationRequired) {
            return (
              <Label variant="soft" color="default">
                No Evaluation
              </Label>
            );
          }
          const method = row.defaultEvaluationMethod;
          if (method === undefined || method === null) return 'Required';
          return (
            ASSIGNMENT_EVALUATION_METHOD_LABELS[method as AssignmentEvaluationMethod] || 'Unknown'
          );
        },
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
          { label: 'Archived', value: 2 },
        ],
        render: (_value, row) => {
          const isArchived = row.status === 2;
          const isActive = row.status === 0;
          return (
            <Label variant="soft" color={isArchived ? 'default' : isActive ? 'success' : 'error'}>
              {isArchived ? 'Archived' : isActive ? 'Active' : 'Inactive'}
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
        stickyPosition: 'right',
        isFilter: false,
        render: (_value, row) => {
          const assignmentType = row as IAssignmentType;
          const isArchived = assignmentType.status === 2;
          return (
            <Stack direction="row" spacing={1} justifyContent="center">
              {isArchived ? (
                <TypeActionButton
                  title="Restore assignment type"
                  icon="solar:restart-bold"
                  color="success"
                  onClick={() => onRestore(assignmentType)}
                />
              ) : (
                <>
                  <ThreeDotsActions
                    showThreeDots={false}
                    placement="right-top"
                    showDeleteIcon={canDelete}
                    showEditIcon={canAdd}
                    disableDeleteIcon={(assignmentType.usageCount || 0) > 0}
                    handleDeleteClick={() => {
                      onDelete(assignmentType);
                    }}
                    handleEditClick={() => {
                      onEdit(assignmentType);
                    }}
                  />
                  <TypeActionButton
                    title="Archive assignment type"
                    icon="solar:archive-bold"
                    color="warning"
                    disabled={!canDelete}
                    onClick={() => onArchive(assignmentType)}
                  />
                </>
              )}
            </Stack>
          );
        },
      },
    ]}
    data={data || []}
  />
);

export default AssignmentTypeTable;

const TypeActionButton = ({
  title,
  icon,
  color,
  disabled = false,
  onClick,
}: {
  title: string;
  icon: string;
  color: 'success' | 'warning';
  disabled?: boolean;
  onClick: () => void;
}) => (
  <CustomTooltip title={title} arrow placement="top">
    <span>
      <IconButton
        size="small"
        color={color}
        disabled={disabled}
        aria-label={title}
        onClick={(event) => {
          event.stopPropagation();
          onClick();
        }}
        sx={{ width: 18, height: 18, p: 0 }}
      >
        <Iconify icon={icon} width={16} height={16} />
      </IconButton>
    </span>
  </CustomTooltip>
);
