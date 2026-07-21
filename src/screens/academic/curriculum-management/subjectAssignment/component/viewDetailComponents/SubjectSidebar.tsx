import type { LabelColor } from 'src/components/label';

import React from 'react';
import { varAlpha } from 'src/theme/styles';
import { Label } from 'src/components/label';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { SubjectType } from 'src/enums/subject-type';
import { Scrollbar } from 'src/components/scrollbar';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Card, Stack, Typography } from '@mui/material';
import { SubjectColorIndicator } from 'src/components/subject-color/SubejctColor';
import {
  PublishUnpublishStatusType,
  PublishUnpublishStatusTypeColors,
} from 'src/enums/publishUnpublish-status';

import type { ISubjectDetail } from '../type';

const STATUS_CONFIG: Record<string | number, { label: string; color: LabelColor }> = {
  0: { label: 'Draft', color: 'info' },
  1: { label: 'Published', color: 'success' },
  2: { label: 'In Review', color: 'warning' },
  3: { label: 'Needs Setup', color: 'error' },
  4: { label: 'Archived', color: 'default' },
  5: { label: 'Inactive', color: 'default' },
  'Draft': { label: 'Draft', color: 'info' },
  'Published': { label: 'Published', color: 'success' },
  'InReview': { label: 'In Review', color: 'warning' },
  'NeedsSetup': { label: 'Needs Setup', color: 'error' },
  'Archived': { label: 'Archived', color: 'default' },
  'Inactive': { label: 'Inactive', color: 'default' },
};

const getStatusLabelAndColor = (status: any) => {
  if (status === undefined || status === null) {
    return { label: 'Draft', color: 'info' as LabelColor };
  }
  const config = STATUS_CONFIG[status];
  if (config) return config;
  return { label: String(status), color: 'default' as LabelColor };
};

const STATUS_DESCRIPTIONS: Record<string, string> = {
  Draft: 'Draft: setup is still in progress and this allocation is hidden from teachers and timetable/exam scheduling.',
  Published: 'Published: this allocation is live and visible to teachers, timetable and examination modules.',
  'In Review': 'In Review: setup is complete and awaiting approval before it can be published.',
  'Needs Setup': 'Needs Setup: required details (teacher, syllabus, etc.) are missing before this can be published.',
  Archived: 'Archived: no longer active for the current academic year but kept for historical records.',
  Inactive: 'Inactive: temporarily disabled and not visible to teachers or students.',
};

interface SubjectSidebarProps {
  subjectAssignmentData: Record<string, any> | null;
  expandedSubject: string | null;
  onSubjectSelect: (subjectCode: string) => void;
  classId?: string;
  classes?: string;
}

const SubjectSidebar = ({
  subjectAssignmentData,
  expandedSubject,
  onSubjectSelect,
  classId,
  classes,
}: SubjectSidebarProps) => {
  const theme = useTheme();
  const subjects = (subjectAssignmentData?.data?.subjects ?? []) as ISubjectDetail[];

  return (
    <Card
      sx={{
        height: '100%',
        p: 2,
        boxShadow: 'var(--shadows-10)',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
      }}
    >
      <Box
        sx={{
          pb: 2,
          mb: 2,
          borderBottom: `1px dashed ${theme.palette.divider}`,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            {(subjectAssignmentData?.subjectType as number) === 1 && (
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                {subjectAssignmentData?.electiveGroupName as string}
              </Typography>
            )}
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              <Iconify icon="mdi:google-classroom" width={16} />
              {(classes as string) || 'N/A'} {' - '}
              {SubjectType[subjectAssignmentData?.data?.subjectType as number] || 'N/A'}
            </Typography>
          </Box>

          {(() => {
            const { label, color } = getStatusLabelAndColor(subjectAssignmentData?.data?.status);
            return (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Label variant="soft" color={color}>
                  {label}
                </Label>
                <CustomTooltip
                  arrow
                  placement="left"
                  sx={{ textAlign: 'justify' }}
                  title={
                    STATUS_DESCRIPTIONS[label] ||
                    'Current status of this subject allocation for the selected class.'
                  }
                >
                  <Iconify
                    icon="lucide:info"
                    width={16}
                    sx={{ cursor: 'pointer' }}
                    color="info.main"
                  />
                </CustomTooltip>
              </Stack>
            );
          })()}
        </Box>
      </Box>

      <Typography variant="overline" sx={{ color: 'text.disabled', mb: 1, px: 1 }}>
        Subjects
      </Typography>

      <Scrollbar sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {subjects.map((sub) => {
            const isSelected = expandedSubject === sub.subjectCode;
            return (
              <Box
                key={sub.subjectCode}
                onClick={() => onSubjectSelect(sub.subjectCode)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: 1,
                  cursor: 'pointer',
                  borderRadius: 1.5,
                  transition: 'all 0.2s',
                  bgcolor: isSelected
                    ? () => varAlpha(theme.palette.primary.mainChannel, 0.08)
                    : 'transparent',
                  color: isSelected ? 'primary.main' : 'text.secondary',
                  '&:hover': {
                    bgcolor: isSelected
                      ? () => varAlpha(theme.palette.primary.mainChannel, 0.12)
                      : 'action.hover',
                  },
                }}
              >
                <SubjectColorIndicator
                  color={
                    (sub as any).color ||
                    sub.subject?.color ||
                    (sub as any).subjectColor ||
                    '#9E9E9E'
                  }
                />
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: isSelected ? 600 : 500,
                    color: isSelected ? 'text.primary' : 'text.secondary',
                  }}
                >
                  {sub.subjectName || 'UNNAMED SUBJECT'}
                </Typography>

                {isSelected && (
                  <CustomTooltip title="Currently viewing" arrow placement="top">
                    <Iconify
                      icon="eva:checkmark-fill"
                      width={16}
                      sx={{ ml: 'auto', color: 'primary.main' }}
                    />
                  </CustomTooltip>
                )}
              </Box>
            );
          })}
        </Box>
      </Scrollbar>
    </Card>
  );
};

/**
 * Memoization Justification:
 * Sidebar re-renders only when subject assignment data or expanded subject changes.
 * React.memo prevents re-renders from tab changes in the sibling content area.
 */
export default React.memo(SubjectSidebar);
