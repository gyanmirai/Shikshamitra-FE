'use client';

import { useRouter } from 'src/routes/hooks';
import { Label } from 'src/components/label';
import CancelButton from 'src/components/cancel-button';
import { academicPaths } from 'src/constants/academic-menu';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Box, Stack, Skeleton, Typography, DialogActions } from '@mui/material';

import { getSubjectMasterStatusLabel } from '../subjectMasterStatus';
import { useSubjectUsageViewModel } from './hooks/useSubjectUsageViewModel';
import { SubjectLifecycleAction } from './components/SubjectLifecycleAction';
import { SubjectImpactStatusCard } from './components/SubjectImpactStatusCard';
import { SubjectDependencyActions } from './components/SubjectDependencyActions';
import { SubjectUsageLabelsSection } from './components/SubjectUsageLabelsSection';
import { SubjectUsageMetricsSection } from './components/SubjectUsageMetricsSection';

import type { SubjectUsageDrawerProps } from './subjectUsage.types';

export default function SubjectUsageDrawer({
  open,
  onClose,
  selectedSubject,
  usageData,
  isLoading = false,
  onArchive,
  onRestore,
  canArchive = false,
  isRestoring = false,
}: SubjectUsageDrawerProps) {
  const router = useRouter();
  const viewModel = useSubjectUsageViewModel(usageData);
  const statusLabel = getSubjectMasterStatusLabel(selectedSubject?.status);

  const navigateToDependency = (path: string) => {
    onClose();
    router.push(path);
  };

  return (
    <CustomDialog
      open={open}
      handleClose={onClose}
      hasForm={false}
      guardUnsavedChanges={false}
      titleInfo="Review where this subject is used and the restrictions on editing, archiving, or deleting it."
      maxWidth="md"
      title={
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <Typography component="span" variant="subtitle1">
            {selectedSubject?.name || 'Subject Usage & Details'}
          </Typography>
          <Label color="default" variant="soft">
            {statusLabel}
          </Label>
        </Stack>
      }
      paperProps={{ sx: { maxWidth: 720, width: '100%', maxHeight: '90vh', borderRadius: 2 } }}
    >
      <DialogScrollContent
        sx={{
          bgcolor: 'background.neutral',
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          p: 2,
        }}
      >
        {isLoading ? (
          <Stack spacing={1.5}>
            <Skeleton variant="rounded" height={250} />
            <Skeleton variant="rounded" height={120} />
            <Skeleton variant="rounded" height={140} />
          </Stack>
        ) : (
          <>
            <SubjectUsageMetricsSection
              metrics={viewModel.metrics}
              dependentModuleCount={viewModel.dependentModuleCount}
            />
            <SubjectUsageLabelsSection
              icon="solar:buildings-3-linear"
              title="Allocated Classes"
              description="Classes currently using this subject."
              labels={viewModel.allocationLabels}
            />
            <SubjectUsageLabelsSection
              icon="solar:layers-linear"
              title="Mapped Elective Groups"
              description="Elective groups currently linked to this subject."
              labels={viewModel.electiveGroupLabels}
            />
            <SubjectImpactStatusCard isInUse={viewModel.isInUse} />
            {viewModel.isInUse && (
              <SubjectDependencyActions
                counts={viewModel.counts}
                onNavigate={navigateToDependency}
                paths={{
                  allocations: academicPaths.curriculum.subjectsAssignment,
                  chapters: academicPaths.curriculum.chaptersManagement,
                  timetable: academicPaths.timetable.management,
                  examinations: academicPaths.examination.schedule,
                  lessonPlans: academicPaths.curriculum.lessonPlan,
                }}
              />
            )}
          </>
        )}
      </DialogScrollContent>

      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)', justifyContent: 'space-between' }}>
        <Box>
          <SubjectLifecycleAction
            canManage={canArchive}
            isRestoring={isRestoring}
            selectedSubject={selectedSubject}
            onArchive={onArchive}
            onRestore={onRestore}
            onClose={onClose}
          />
        </Box>
        <CancelButton buttonText="Close" onClick={onClose} />
      </DialogActions>
    </CustomDialog>
  );
}
