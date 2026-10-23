'use client';

import React from 'react';
import { Label } from 'src/components/label';
import CustomizableTable from 'src/components/customizabaleTable';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';

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
  onArchive,
  onRestore,
  onEdit,
  canAdd = true,
  canDelete = true,
}) => (
  <CustomizableTable
    tableTitle="Homework Types"
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
        isFilter: false,
        render: (_value, row) => {
          const homeworkType = row as IHomeworkType;
          const isArchived = homeworkType.status === 2;
          const actions = isArchived
            ? [
                {
                  id: 'restore',
                  label: `Restore ${homeworkType.homeworkTypeName}`,
                  icon: 'solar:restart-bold',
                  color: 'success.main',
                  onClick: () => onRestore(homeworkType),
                },
              ]
            : [
                ...(canAdd
                  ? [
                      {
                        id: 'edit',
                        label: `Edit ${homeworkType.homeworkTypeName}`,
                        icon: 'solar:pen-bold',
                        onClick: () => onEdit(homeworkType),
                      },
                    ]
                  : []),
                ...(canDelete
                  ? [
                      {
                        id: 'delete',
                        label: `Delete ${homeworkType.homeworkTypeName}`,
                        icon: 'solar:trash-bin-trash-bold',
                        color: (homeworkType.usageCount || 0) > 0 ? undefined : 'error.main',
                        disabled: (homeworkType.usageCount || 0) > 0,
                        tooltip:
                          (homeworkType.usageCount || 0) > 0
                            ? 'This homework type is in use and cannot be deleted.'
                            : undefined,
                        onClick: () => onDelete(homeworkType),
                      },
                    ]
                  : []),
                {
                  id: 'archive',
                  label: `Archive ${homeworkType.homeworkTypeName}`,
                  icon: 'solar:archive-bold',
                  color: 'warning.main',
                  disabled: !canDelete,
                  onClick: () => onArchive(homeworkType),
                },
              ];

          return (
            <AdaptiveThreeDotsActions
              directActionLimit={2}
              collapseOnOverflow={false}
              moreLabel={`More actions for ${homeworkType.homeworkTypeName}`}
              actions={actions}
              placement="right-top"
            />
          );
        },
      },
    ]}
    data={data || []}
  />
);

export default HomeworkTypeTable;
