'use client';

import { useRouter } from 'src/routes/hooks';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import CancelButton from 'src/components/cancel-button';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Box, Stack, Button, Skeleton, Typography, DialogActions } from '@mui/material';

import { getSubjectMasterStatusLabel } from '../../subjectMasterStatus';
import { ElectiveGroupUsageDetails } from './ElectiveGroupUsageDetails';
import { ElectiveGroupUsageSummary } from './ElectiveGroupUsageSummary';
import { ElectiveGroupStudentDistribution } from './ElectiveGroupStudentDistribution';

import type { ElectiveGroupUsageDrawerProps } from './electiveGroupUsageTypes';

export default function ElectiveGroupUsageDrawer({
  open,
  onClose,
  selectedGroup,
  usageData,
  isLoading = false,
  onArchive,
  canArchive = false,
}: ElectiveGroupUsageDrawerProps) {
  const theme = useTheme();
  const router = useRouter();
  const statusLabel = getSubjectMasterStatusLabel(selectedGroup?.status);
  const groupColor = selectedGroup?.color || theme.palette.primary.main;
  const sourceSubjects = selectedGroup?.subjects?.length
    ? selectedGroup.subjects
    : usageData?.subjects || [];
  const subjects = sourceSubjects.map((subject) => ({
    name: typeof subject === 'string' ? subject : subject.name,
    color:
      typeof subject === 'object'
        ? subject.color || subject.subjectColor || groupColor
        : groupColor,
  }));
  const classAllocations = usageData?.usage?.classAllocationsCount ?? 0;
  const studentSelections = usageData?.usage?.studentSelectionsCount ?? 0;
  const timetablePeriods = usageData?.usage?.timetablePeriodsCount ?? 0;
  const examSchedules = usageData?.usage?.examSchedulesCount ?? 0;
  const distribution = usageData?.usage?.subjectWiseStudentCount ?? [];
  const totalStudents =
    distribution.length > 0
      ? distribution.reduce((total, subject) => total + (subject.count || 0), 0)
      : studentSelections;
  const dependentModuleCount = [
    classAllocations,
    timetablePeriods,
    examSchedules,
    studentSelections,
  ].filter((count) => count > 0).length;
  const isInUse = !usageData?.canDelete && (dependentModuleCount > 0 || classAllocations > 0);

  return (
    <CustomDialog
      open={open}
      handleClose={onClose}
      hasForm={false}
      maxWidth="md"
      titleInfo="Saved elective group details, subject membership and current use across academic modules."
      title={
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          useFlexGap
          flexWrap="wrap"
          sx={{ minWidth: 0 }}
        >
          <Typography variant="h6" component="span" sx={{ overflowWrap: 'anywhere' }}>
            {selectedGroup?.name || 'Elective Group Details'}
          </Typography>
          <Label
            color={
              statusLabel === 'Active'
                ? 'success'
                : statusLabel === 'Archived'
                  ? 'warning'
                  : 'default'
            }
            variant="soft"
          >
            {statusLabel}
          </Label>
        </Stack>
      }
      paperProps={{ sx: { maxWidth: 640, width: '100%', maxHeight: '90vh', borderRadius: 2 } }}
    >
      <DialogScrollContent sx={{ bgcolor: 'background.neutral', p: { xs: 2, sm: 3 } }}>
        <Stack spacing={2}>
          {isLoading ? (
            <Stack spacing={2} aria-busy="true" aria-label="Loading elective group details">
              {[140, 100, 120].map((height) => (
                <Skeleton key={height} variant="rounded" height={height} sx={{ borderRadius: 2 }} />
              ))}
            </Stack>
          ) : (
            <>
              <ElectiveGroupUsageDetails group={selectedGroup} subjects={subjects} />
              <ElectiveGroupUsageSummary
                subjectCount={subjects.length}
                totalStudents={totalStudents}
                dependentModuleCount={dependentModuleCount}
                counts={{ classAllocations, studentSelections, timetablePeriods, examSchedules }}
                isInUse={isInUse}
                onNavigate={(path) => {
                  onClose();
                  router.push(path);
                }}
              >
                <ElectiveGroupStudentDistribution
                  distribution={distribution}
                  totalStudents={totalStudents}
                />
              </ElectiveGroupUsageSummary>
            </>
          )}
        </Stack>
      </DialogScrollContent>

      <DialogActions
        sx={{
          p: 2,
          px: { xs: 2, sm: 3 },
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          {canArchive && onArchive && statusLabel !== 'Archived' && selectedGroup && (
            <Button
              size="small"
              variant="outlined"
              color="warning"
              startIcon={<Iconify icon={GlobalIcons.archive} />}
              onClick={() => {
                onClose();
                onArchive(selectedGroup);
              }}
            >
              Archive group
            </Button>
          )}
        </Box>
        <CancelButton buttonText="Close" onClick={onClose} />
      </DialogActions>
    </CustomDialog>
  );
}
