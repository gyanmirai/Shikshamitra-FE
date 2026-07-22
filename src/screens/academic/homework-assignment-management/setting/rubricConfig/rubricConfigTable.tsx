'use client';

import React from 'react';
import { MenuList, MenuItem, ListItemIcon, ListItemText, Stack, Typography } from '@mui/material';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import {
  RubricStatus,
  RubricWorkType,
  type AssessmentRubricDto,
} from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';
import {
  RUBRIC_STATUS_LABELS,
  RUBRIC_SCORING_MODEL_LABELS,
  RUBRIC_WORK_TYPE_LABELS,
  RUBRIC_STATUS_OPTIONS,
  RUBRIC_WORK_TYPE_OPTIONS,
  RUBRIC_SCORING_MODEL_OPTIONS,
} from './constants';

import type { RubricConfigTableProps } from './types';

const statusColor = {
  0: 'warning',
  1: 'success',
  2: 'default',
  3: 'info',
} as const;

const toRubricRow = (row: unknown) => row as AssessmentRubricDto;

const RubricConfigTable: React.FC<RubricConfigTableProps> = ({
  data,
  isLoading,
  canAdd,
  canDelete,
  onEdit,
  onDuplicate,
  onPreview,
  onUsage,
  onVersion,
  onArchive,
  onPublish,
}) => (
  <CustomizableTable
    tableId="rubric-config-table"
    isLoading={isLoading}
    isPagination
    isSearch
    isFilter
    searchFieldProps={{ placeholder: 'Search by rubric name, description, or applicable type' }}
    noDataText="No Rubric Templates Found"
    columns={[
      {
        id: 'title',
        label: 'Rubric',
        align: 'left',
        minWidth: 220,
        sticky: true,
        stickyPosition: 'left',
        render: (_value, row) => (
          <Stack spacing={0.25}>
            <Typography variant="body2" fontWeight={600}>
              {toRubricRow(row).title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Version {toRubricRow(row).version}
            </Typography>
          </Stack>
        ),
      },
      {
        id: 'scoringModel',
        label: 'Model',
        align: 'left',
        minWidth: 160,
        filterType: 'enum',
        enumOptions: RUBRIC_SCORING_MODEL_OPTIONS,
        render: (_value, row) =>
          RUBRIC_SCORING_MODEL_LABELS[toRubricRow(row).scoringModel] || 'Points-Based',
      },
      {
        id: 'appliesToWorkType',
        label: 'Applies To',
        align: 'left',
        minWidth: 130,
        filterType: 'enum',
        enumOptions: RUBRIC_WORK_TYPE_OPTIONS,
        render: (_value, row) => {
          const workType = toRubricRow(row).appliesToWorkType;
          if (workType === null || workType === undefined) return 'Both';
          return RUBRIC_WORK_TYPE_LABELS[workType as RubricWorkType] || '-';
        },
      },
      {
        id: 'criteria',
        label: 'Criteria',
        align: 'right',
        minWidth: 110,
        render: (_value, row) => toRubricRow(row).criteria?.length ?? 0,
      },
      {
        id: 'totalMarks',
        label: 'Max Score',
        align: 'right',
        minWidth: 120,
        filterType: 'number',
      },
      {
        id: 'usageCount',
        label: 'Usage',
        align: 'right',
        minWidth: 100,
        filterType: 'number',
        render: (value) => `${Number(value) || 0} times`,
      },
      {
        id: 'status',
        label: 'Status',
        align: 'center',
        minWidth: 120,
        filterType: 'enum',
        enumOptions: RUBRIC_STATUS_OPTIONS,
        render: (_value, row) => (
          <Label variant="soft" color={statusColor[toRubricRow(row).status] || 'default'}>
            {RUBRIC_STATUS_LABELS[toRubricRow(row).status as RubricStatus] || 'Unknown'}
          </Label>
        ),
      },
      {
        id: 'lastModificationTime',
        label: 'Updated',
        align: 'left',
        minWidth: 130,
        render: (_value, row) => {
          const date = toRubricRow(row).lastModificationTime || toRubricRow(row).creationTime;
          return date ? new Date(date).toLocaleDateString() : '-';
        },
      },
      {
        id: 'action',
        label: 'Actions',
        minWidth: 82,
        width: 82,
        align: 'center',
        sticky: true,
        stickyPosition: 'right',
        isSort: false,
        isFilter: false,
        excludeFromExport: true,
        render: (_value, row) => (
          <ThreeDotsActions
            placement="right-top"
            actions={({ popover }) => {
              const rubric = toRubricRow(row);
              const closeAndRun = (action: () => void) => {
                popover.onClose();
                action();
              };

              return (
                <MenuList sx={{ p: 0.5 }}>
                  <MenuItem onClick={() => closeAndRun(() => onPreview(rubric))} sx={{ gap: 1.5 }}>
                    <Iconify icon="solar:eye-bold-duotone" width={18} height={18} />
                    Preview
                  </MenuItem>

                  {canAdd && rubric.status === RubricStatus.Draft ? (
                    <MenuItem onClick={() => closeAndRun(() => onEdit(rubric))} sx={{ gap: 1.5 }}>
                      <Iconify icon="solar:pen-bold-duotone" width={18} height={18} />
                      Edit
                    </MenuItem>
                  ) : null}

                  {canAdd ? (
                    <MenuItem onClick={() => closeAndRun(() => onDuplicate(rubric))} sx={{ gap: 1.5 }}>
                      <Iconify icon="solar:copy-bold-duotone" width={18} height={18} />
                      Duplicate
                    </MenuItem>
                  ) : null}

                  {canAdd && rubric.status === RubricStatus.Draft ? (
                    <MenuItem onClick={() => closeAndRun(() => onPublish(rubric))} sx={{ gap: 1.5 }}>
                      <Iconify icon="solar:upload-bold-duotone" width={18} height={18} />
                      Publish
                    </MenuItem>
                  ) : null}

                  {canAdd && rubric.status === RubricStatus.Published ? (
                    <MenuItem onClick={() => closeAndRun(() => onVersion(rubric))} sx={{ gap: 1.5 }}>
                      <Iconify icon="solar:layers-bold-duotone" width={18} height={18} />
                      Create New Version
                    </MenuItem>
                  ) : null}

                  <MenuItem onClick={() => closeAndRun(() => onUsage(rubric))} sx={{ gap: 1.5 }}>
                    <Iconify icon="solar:chart-2-bold-duotone" width={18} height={18} />
                    View Usage
                  </MenuItem>

                  {canDelete && rubric.status !== RubricStatus.Archived ? (
                    <MenuItem 
                      onClick={() => closeAndRun(() => onArchive(rubric))} 
                      sx={{ gap: 1.5, color: 'error.main' }}
                    >
                      <Iconify icon="solar:box-archive-bold-duotone" width={18} height={18} />
                      Archive
                    </MenuItem>
                  ) : null}
                </MenuList>
              );
            }}
          />
        ),
      },
    ]}
    data={data}
  />
);

export default RubricConfigTable;
