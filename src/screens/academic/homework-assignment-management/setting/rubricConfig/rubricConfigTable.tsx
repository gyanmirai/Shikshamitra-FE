'use client';

import React from 'react';
import dayjs from 'dayjs';
import { Label } from 'src/components/label';
import { Stack, Typography } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';
import {
  RubricStatus,
  RubricWorkType,
  RubricScoringModel,
  type AssessmentRubricDto,
} from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';

import { getRubricMaximumLabel } from './rubricScoreLabels';
import { getRubricConfigTableActions } from './rubricConfigTableActions';
import {
  RUBRIC_STATUS_LABELS,
  RUBRIC_STATUS_OPTIONS,
  RUBRIC_WORK_TYPE_LABELS,
  RUBRIC_WORK_TYPE_OPTIONS,
  RUBRIC_SCORING_MODEL_LABELS,
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
    noDataText="No Rubric Templates Found"
    columns={[
      {
        id: 'title',
        label: 'Rubric',
        align: 'left',
        minWidth: 150,
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
        enumOptions: [...RUBRIC_SCORING_MODEL_OPTIONS, { value: RubricScoringModel.RatingScale, label: 'Rating Scale' }],
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
        minWidth: 110,
        filterType: 'number',
        render: (_value, row) => toRubricRow(row).criteria?.length ?? 0,
      },
      {
        id: 'totalMarks',
        label: 'Max Score',
        minWidth: 180,
        filterType: 'number',
        render: (_value, row) => getRubricMaximumLabel(toRubricRow(row)),
      },
      {
        id: 'usageCount',
        label: 'Usage',
        minWidth: 100,
        filterType: 'number',
        render: (value) => `${Number(value) || 0} times`,
      },
      {
        id: 'lastModificationTime',
        label: 'Updated',
        align: 'left',
        filterType: 'date',
        minWidth: 130,
        render: (_value, row) => {
          const date = toRubricRow(row).lastModificationTime || toRubricRow(row).creationTime;
          return date ? dayjs(date).format('DD-MM-YYYY') : '-';
        },
      },
      {
        id: 'status',
        label: 'Status',
        sticky: true,
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
        id: 'action',
        label: 'Actions',
        minWidth: 82,
        width: 82,
        sticky: true,
        isSort: false,
        isFilter: false,
        excludeFromExport: true,
        render: (_value, row) => {
          const rubric = toRubricRow(row);
          const actions = getRubricConfigTableActions(rubric, {
            canAdd,
            canDelete,
            onPreview,
            onEdit,
            onDuplicate,
            onPublish,
            onVersion,
            onUsage,
            onArchive,
          });

          return (
            <AdaptiveThreeDotsActions
              actions={actions}
              placement="right-top"
              moreLabel="More rubric actions"
            />
          );
        },
      },
    ]}
    data={data}
  />
);

export default RubricConfigTable;
