import type { IColumn } from 'src/components/customizabaleTable/types';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Stack, Button, Typography } from '@mui/material';
import CustomTooltip from 'src/components/custom-tooltip';
import { PublishUnpublishStatusOptions } from 'src/enums/publishUnpublish-status';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';

import { SetupHealthCell } from './SubjectTableCells';
import { getSubjectTableActions } from './subjectTableActions';
import { SubjectAssignmentStatus } from '../../enum/subjectType';

import type { ISubjectFormValues } from '../type';

type Options = {
  canAdd: boolean;
  canView: boolean;
  canDelete: boolean;
  onView: (row: ISubjectFormValues) => void;
  onEdit: (row: ISubjectFormValues) => void;
  onDelete: (row: ISubjectFormValues) => void;
  onArchive?: (row: ISubjectFormValues) => void;
  onRestore?: (row: ISubjectFormValues) => void;
  onToggleStatus: (row: ISubjectFormValues) => void;
};

export function getSubjectTableStatusColumns(options: Options): IColumn[] {
  const { canAdd } = options;
  return [
    {
      id: 'setupHealthScore',
      label: 'Readiness',
      align: 'left',
      minWidth: 90,
      width: 100,
      isSort: false,
      isFilter: false,
      render: (value, row) => (
        <SetupHealthCell score={value as number} row={row as ISubjectFormValues} />
      ),
    },
    {
      id: 'lastUpdatedDisplay',
      label: 'Last updated',
      align: 'left',
      minWidth: 100,
      width: 100,
      isSort: false,
      isFilter: false,
      render: (value) => (
        <Typography variant="caption" color="text.secondary">
          {value}
        </Typography>
      ),
    },
    {
      id: 'statusValue',
      label: 'Status',
      align: 'left',
      // minWidth: 180,
      // width: 184,
      isSort: false,
      isFilter: false,
      sticky: true,
      enumOptions: PublishUnpublishStatusOptions,
      render: (value, row) => {
        const subject = row as ISubjectFormValues;
        const isPublished = subject.status === SubjectAssignmentStatus.Published;
        const canPublish = canAdd && subject.status === SubjectAssignmentStatus.Draft;
        const statusLabel = String(value || 'Draft');

        if (isPublished) {
          return <Label color="success">Published</Label>;
        }

        if (!canPublish) {
          return <Label color="default">{statusLabel}</Label>;
        }

        return (
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <Label color="default">Draft</Label>
            <CustomTooltip title="Publish this draft" arrow placement="left">
              <Button
                size="small"
                variant="outlined"
                startIcon={<Iconify icon="solar:upload-minimalistic-outline" width={16} />}
                aria-label="Current status: Draft. Publish subject allocation"
                onClick={() => options.onToggleStatus(subject)}
                sx={{ minWidth: 92, minHeight: 32, px: 1.25, whiteSpace: 'nowrap' }}
              >
                Publish
              </Button>
            </CustomTooltip>
          </Stack>
        );
      },
    },
    {
      id: 'action',
      label: 'Actions',
      width: 150,
      minWidth: 150,
      align: 'left',
      sticky: true,
      isSort: false,
      isFilter: false,
      render: (_value, row) => {
        const subject = row as ISubjectFormValues;
        const actions = getSubjectTableActions(subject, options);

        return (
          <AdaptiveThreeDotsActions
            actions={actions}
            placement="right-top"
            moreLabel="More subject actions"
          />
        );
      },
    },
  ];
}
