'use client';

import type { LabelColor } from 'src/components/label';

import React from 'react';
import { varAlpha } from 'src/theme/styles';
import { Label } from 'src/components/label';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Chip, Stack, Button, Skeleton, Typography, IconButton, LinearProgress } from '@mui/material';

import { QuickSubjectSwitcher } from './QuickSubjectSwitcher';

import type {
  ISubjectDetail,
  INavigatorSubjectItem,
  INavigatorElectiveGroup,
} from '../type';

const STATUS_CONFIG: Record<string | number, { label: string; color: LabelColor }> = {
  0: { label: 'Draft', color: 'info' },
  1: { label: 'Published', color: 'success' },
  2: { label: 'In Review', color: 'warning' },
  3: { label: 'Needs Setup', color: 'error' },
  4: { label: 'Archived', color: 'default' },
  5: { label: 'Inactive', color: 'default' },
  Draft: { label: 'Draft', color: 'info' },
  Published: { label: 'Published', color: 'success' },
  InReview: { label: 'In Review', color: 'warning' },
  NeedsSetup: { label: 'Needs Setup', color: 'error' },
  Archived: { label: 'Archived', color: 'default' },
  Inactive: { label: 'Inactive', color: 'default' },
};

const getStatusLabelAndColor = (status: any) => {
  if (status === undefined || status === null) {
    return { label: 'Draft', color: 'info' as LabelColor };
  }
  const config = STATUS_CONFIG[status];
  if (config) return config;
  return { label: String(status), color: 'default' as LabelColor };
};

interface SubjectWorkspaceHeaderProps {
  subject: ISubjectDetail | null;
  activeNavigatorItem: INavigatorSubjectItem | null;
  coreSubjects: INavigatorSubjectItem[];
  electiveGroups: INavigatorElectiveGroup[];
  selectedAssignmentId: string | null;
  selectedSubjectCode: string | null;
  selectedSubjectId: string | null;
  onSelectSubject: (item: INavigatorSubjectItem) => void;
  navigationInfo: {
    positionText: string;
    hasPrevious: boolean;
    hasNext: boolean;
    goToPrevious: () => void;
    goToNext: () => void;
  };
  isLoading?: boolean;
  onOpenMobileNav?: () => void;
}

const SubjectWorkspaceHeader: React.FC<SubjectWorkspaceHeaderProps> = ({
  subject,
  activeNavigatorItem,
  coreSubjects,
  electiveGroups,
  selectedAssignmentId,
  selectedSubjectCode,
  selectedSubjectId,
  onSelectSubject,
  navigationInfo,
  isLoading,
  onOpenMobileNav,
}) => {
  const theme = useTheme();

  const isElective =
    activeNavigatorItem?.subjectType === 1 || !!activeNavigatorItem?.electiveGroupId;
  const statusInfo = getStatusLabelAndColor(activeNavigatorItem?.status ?? 0);

  return (
    <Box
      sx={{
        position: 'relative',
        p: { xs: 1.5, sm: 2 },
        borderBottom: `1px solid ${theme.palette.divider}`,
        // Use the theme surface directly so dark mode does not blend the header
        // with the default background into a washed-out gray overlay.
        bgcolor: 'background.neutral',
      }}
    >
      {/* Loading Bar when switching subjects */}
      {isLoading && (
        <LinearProgress
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 2.5,
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
          }}
        />
      )}

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'flex-start', md: 'center' }}
        justifyContent="space-between"
        spacing={1.5}
      >
        {/* Left Area: Mobile Nav Button + Quick Switcher + Metadata */}
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.75 }}>
            {onOpenMobileNav && (
              <IconButton
                size="small"
                onClick={onOpenMobileNav}
                sx={{
                  display: { xs: 'inline-flex', md: 'none' },
                  mr: 0.5,
                  bgcolor: varAlpha(theme.palette.grey['500Channel'], 0.08),
                }}
              >
                <Iconify icon="eva:menu-fill" width={20} />
              </IconButton>
            )}

            <QuickSubjectSwitcher
              currentSubjectName={subject?.subjectName || activeNavigatorItem?.subjectName || 'Select Subject'}
              coreSubjects={coreSubjects}
              electiveGroups={electiveGroups}
              selectedAssignmentId={selectedAssignmentId}
              selectedSubjectCode={selectedSubjectCode}
              selectedSubjectId={selectedSubjectId}
              onSelectSubject={onSelectSubject}
            />
          </Stack>

          {/* Metadata Chips Bar */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            flexWrap="wrap"
            useFlexGap
            sx={{ pl: { xs: 0, sm: 0.75 } }}
          >
            {/* Subject Code */}
            {subject?.subjectCode || activeNavigatorItem?.subjectCode ? (
              <Chip
                size="small"
                label={subject?.subjectCode || activeNavigatorItem?.subjectCode}
                variant="outlined"
                sx={{
                  height: 22,
                  fontFamily: 'monospace',
                  fontWeight: 600,
                  fontSize: '0.725rem',
                  borderColor: theme.palette.divider,
                }}
              />
            ) : isLoading ? (
              <Skeleton variant="rounded" width={56} height={22} sx={{ borderRadius: 1 }} />
            ) : null}

            {/* Core / Elective Tag */}
            <Chip
              size="small"
              label={isElective ? 'Elective' : 'Core'}
              variant="soft"
              color={isElective ? 'secondary' : 'primary'}
              sx={{ height: 22, fontSize: '0.725rem', fontWeight: 600 }}
            />

            {/* Status Label */}
            <Label variant="soft" color={statusInfo.color} sx={{ height: 22, fontSize: '0.725rem' }}>
              {statusInfo.label}
            </Label>

            {/* Elective Group Name if applicable */}
            {isElective && activeNavigatorItem?.electiveGroupName && (
              <Chip
                size="small"
                icon={<Iconify icon="solar:folder-with-files-bold" width={14} />}
                label={activeNavigatorItem.electiveGroupName}
                variant="soft"
                color="secondary"
                sx={{
                  height: 22,
                  fontSize: '0.725rem',
                  fontWeight: 500,
                }}
              />
            )}

            {/* Primary Teacher Pill */}
            {subject?.primaryTeacher?.name || activeNavigatorItem?.primaryTeacher?.name ? (
              <Chip
                size="small"
                icon={<Iconify icon="mdi:account-tie" width={14} />}
                label={`Teacher: ${subject?.primaryTeacher?.name || activeNavigatorItem?.primaryTeacher?.name}`}
                variant="outlined"
                sx={{
                  height: 22,
                  fontSize: '0.725rem',
                  borderColor: varAlpha(theme.palette.primary.mainChannel, 0.3),
                  color: 'text.secondary',
                }}
              />
            ) : isLoading ? (
              <Skeleton variant="rounded" width={120} height={22} sx={{ borderRadius: 1 }} />
            ) : null}
          </Stack>
        </Box>

        {/* Right Area: Position Indicator + Prev/Next Controls */}
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ alignSelf: { xs: 'flex-end', md: 'center' } }}>
          {navigationInfo.positionText && (
            <CustomTooltip title={`Position in ${isElective ? 'Elective Group' : 'Core Subjects'}`} arrow>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  bgcolor: varAlpha(theme.palette.grey['500Channel'], 0.08),
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                {navigationInfo.positionText}
              </Typography>
            </CustomTooltip>
          )}

          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              startIcon={<Iconify icon="eva:arrow-ios-back-fill" width={16} />}
              disabled={!navigationInfo.hasPrevious}
              onClick={navigationInfo.goToPrevious}
              sx={{
                minWidth: 86,
                height: 32,
                fontSize: '0.78125rem',
                borderColor: theme.palette.divider,
                '&:hover': {
                  borderColor: theme.palette.text.primary,
                  bgcolor: varAlpha(theme.palette.grey['500Channel'], 0.08),
                },
              }}
            >
              Previous
            </Button>

            <Button
              size="small"
              variant="outlined"
              color="inherit"
              endIcon={<Iconify icon="eva:arrow-ios-forward-fill" width={16} />}
              disabled={!navigationInfo.hasNext}
              onClick={navigationInfo.goToNext}
              sx={{
                minWidth: 76,
                height: 32,
                fontSize: '0.78125rem',
                borderColor: theme.palette.divider,
                '&:hover': {
                  borderColor: theme.palette.text.primary,
                  bgcolor: varAlpha(theme.palette.grey['500Channel'], 0.08),
                },
              }}
            >
              Next
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
};

export default React.memo(SubjectWorkspaceHeader);
