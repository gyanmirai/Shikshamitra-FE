'use client';

import React from 'react';
import { varAlpha } from 'src/theme/styles';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Stack, Button, Typography, IconButton, LinearProgress } from '@mui/material';

import { QuickSubjectSwitcher } from './QuickSubjectSwitcher';

import type {
  ISubjectDetail,
  INavigatorSubjectItem,
  INavigatorElectiveGroup,
} from '../type';

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
          <Stack direction="row" alignItems="center" spacing={1}>
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
