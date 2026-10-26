import type { ReactNode } from 'react';

import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { academicPaths } from 'src/constants/academic-menu';
import { Box, Stack, Button, Typography } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';

export function ElectiveGroupUsageSummary({
  subjectCount,
  totalStudents,
  dependentModuleCount,
  counts,
  isInUse,
  onNavigate,
  children,
}: {
  subjectCount: number;
  totalStudents: number;
  dependentModuleCount: number;
  counts: {
    classAllocations: number;
    studentSelections: number;
    timetablePeriods: number;
    examSchedules: number;
  };
  isInUse: boolean;
  onNavigate: (path: string) => void;
  children: ReactNode;
}) {
  const { classAllocations, studentSelections, timetablePeriods, examSchedules } = counts;
  const metrics = [
    { label: 'Subjects mapped', value: subjectCount },
    { label: 'Class allocations', value: classAllocations },
    { label: 'Student selections', value: studentSelections },
    { label: 'Timetable periods', value: timetablePeriods },
    { label: 'Exam schedules', value: examSchedules },
    { label: 'Total students', value: totalStudents },
  ];
  const actions = [
    {
      label: 'Class allocations',
      count: classAllocations,
      path: academicPaths.curriculum.subjectsAssignment,
      icon: GlobalIcons.assigned,
    },
    {
      label: 'Timetable',
      count: timetablePeriods,
      path: academicPaths.timetable.management,
      icon: GlobalIcons.calendar,
    },
    {
      label: 'Examinations',
      count: examSchedules,
      path: academicPaths.examination.schedule,
      icon: GlobalIcons.rubricFile,
    },
  ];
  return (
    <>
      <FormSectionCard
        icon={GlobalIcons.usage}
        title="Dependencies & Usage"
        descriptionTooltip="Recorded use of this elective group across subjects, class allocations, student selections, timetables and examinations."
        action={
          <Typography variant="body2" color="text.secondary">
            {dependentModuleCount > 0
              ? `Used across ${dependentModuleCount} module${dependentModuleCount > 1 ? 's' : ''}`
              : 'No active dependencies'}
          </Typography>
        }
      >
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          {metrics.map(({ label, value }) => (
            <Box key={label} sx={{ minWidth: 0 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                {label}
              </Typography>
              <Typography variant="body2">{value}</Typography>
            </Box>
          ))}
        </Box>
      </FormSectionCard>

      {children}

      <FormSectionCard
        icon={isInUse ? GlobalIcons.lockIcon : GlobalIcons.approvedIcon}
        title={isInUse ? 'Impact & System Restrictions' : 'Safe to Modify or Delete'}
        descriptionTooltip="Current dependency restrictions and the effect on changing or deleting this elective group."
        action={
          <Label color={isInUse ? 'warning' : 'success'} variant="soft">
            {isInUse ? 'Restricted Deletion' : 'Fully Modifiable'}
          </Label>
        }
      >
        <Typography variant="body2">
          {isInUse
            ? 'This elective group is actively referenced by student choices or timetable allocations. Modifying subjects or deletion is restricted while active dependencies exist.'
            : 'This elective group has no active student or timetable dependencies. You can safely edit structure or delete this group.'}
        </Typography>
        {isInUse && (
          <Typography variant="body2" color="text.secondary">
            Archive when this elective group is no longer offered in current academic terms.
          </Typography>
        )}
      </FormSectionCard>

      {isInUse && (
        <FormSectionCard
          icon={GlobalIcons.assignedRoute}
          title="Quick Dependency Actions"
          descriptionTooltip="Open the academic workspaces that currently use this elective group."
        >
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            {actions
              .filter((action) => action.count > 0)
              .map((action) => (
                <Button
                  key={action.path}
                  size="small"
                  variant="outlined"
                  color="inherit"
                  onClick={() => onNavigate(action.path)}
                  startIcon={<Iconify icon={action.icon} />}
                >
                  {action.label} ({action.count})
                </Button>
              ))}
          </Stack>
        </FormSectionCard>
      )}
    </>
  );
}
