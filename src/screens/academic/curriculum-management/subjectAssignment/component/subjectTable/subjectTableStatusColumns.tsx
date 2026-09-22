import type { Theme } from '@mui/material/styles';
import type { IColumn } from 'src/components/customizabaleTable/types';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, IconButton, Typography } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import { PublishUnpublishStatusOptions } from 'src/enums/publishUnpublish-status';

import { SetupHealthCell } from './SubjectTableCells';
import { SubjectAssignmentStatus } from '../../enum/subjectType';
import { SubjectTableActionsMenu } from './SubjectTableActionsMenu';

import type { ISubjectFormValues } from '../type';

type Options = {
  theme: Theme;
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
  const { theme, canAdd, canView, canDelete } = options;
  return [
    {
      id: 'setupHealthScore',
      label: 'Health',
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
      label: 'Updated',
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
      minWidth: 60,
      width: 70,
      isSort: false,
      isFilter: false,
      sticky: true,
      enumOptions: PublishUnpublishStatusOptions,
      render: (value, row) => {
        const subject = row as ISubjectFormValues;
        const isPublished = subject.status === SubjectAssignmentStatus.Published;
        const statusColor = isPublished
          ? theme.vars.palette.success.main
          : theme.vars.palette.text.secondary;
        return (
          <CustomTooltip title={value} arrow placement="left">
            <Box component="span">
              <IconButton
                aria-label={`${value} subject assignment`}
                disabled={isPublished}
                onClick={() => options.onToggleStatus(subject)}
                sx={{
                  p: 0.6,
                  bgcolor: 'action.hover',
                  '&:hover': {
                    transform: isPublished ? 'none' : 'scale(1.1)',
                    bgcolor: 'action.selected',
                  },
                  '&.Mui-disabled': { bgcolor: 'action.hover' },
                }}
              >
                <Iconify
                  icon={GlobalIcons.tick}
                  sx={{ width: 20, height: 20, color: statusColor }}
                />
              </IconButton>
            </Box>
          </CustomTooltip>
        );
      },
    },
    {
      id: 'action',
      label: 'Actions',
      width: 70,
      minWidth: 70,
      align: 'left',
      sticky: true,
      isSort: false,
      isFilter: false,
      render: (_value, row) => {
        const subject = row as ISubjectFormValues;
        return (
          <ThreeDotsActions
            placement="right-top"
            actions={({ popover }) => (
              <SubjectTableActionsMenu
                row={subject}
                onClose={popover.onClose}
                canAdd={canAdd}
                canDelete={canDelete}
                onDelete={options.onDelete}
                onArchive={options.onArchive}
                onRestore={options.onRestore}
              />
            )}
            showViewIcon={canView}
            showEditIcon={canAdd}
            showThreeDots={canDelete}
            handleViewClick={() => options.onView(subject)}
            handleEditClick={() => options.onEdit(subject)}
          />
        );
      },
    },
  ];
}
