import type { IColumn } from 'src/components/customizabaleTable/types';

import { Typography } from '@mui/material';
import { Label } from 'src/components/label';
import { PublishUnpublishStatusOptions } from 'src/enums/publishUnpublish-status';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';

import { SetupHealthCell } from './SubjectTableCells';
import { getSubjectTableActions } from './subjectTableActions';
import { SubjectAssignmentStatus } from '../../enum/subjectType';

import type { ISubjectFormValues } from '../type';

type Options = {
  canAdd: boolean;
  canDelete: boolean;
  onEdit: (row: ISubjectFormValues) => void;
  onDelete: (row: ISubjectFormValues) => void;
  onArchive?: (row: ISubjectFormValues) => void;
  onRestore?: (row: ISubjectFormValues) => void;
  onToggleStatus: (row: ISubjectFormValues) => void;
};

export function getSubjectTableStatusColumns(options: Options): IColumn[] {
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
      minWidth: 100,
      width: 110,
      isSort: false,
      isFilter: false,
      sticky: true,
      enumOptions: PublishUnpublishStatusOptions,
      render: (value, row) => {
        const subject = row as ISubjectFormValues;
        const isPublished = subject.status === SubjectAssignmentStatus.Published;
        const statusLabel = String(value || 'Draft');

        if (isPublished) {
          return <Label color="success">Published</Label>;
        }

        return <Label color="default">{statusLabel}</Label>;
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
        const actions = [
          ...(options.canAdd && subject.status === SubjectAssignmentStatus.Draft
            ? [
                {
                  id: 'publish',
                  label: `Publish ${subject.subjectName || 'subject'}`,
                  icon: 'solar:upload-minimalistic-outline',
                  onClick: () => options.onToggleStatus(subject),
                },
              ]
            : []),
          ...getSubjectTableActions(subject, options),
        ];

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
