'use client';

import { Iconify } from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import { studentPaths } from 'src/constants/student-menu';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Chip, Alert, Stack, Paper, Button, Typography, LinearProgress } from '@mui/material';
import { useGetAdmissionCrmSetupStatusQuery } from 'src/redux/student/admissions-crm/admissions-crm-api';

import { useEnrollmentWorkspace } from '../admissions-crm/enrollment-workspace-context';

const setupItems = [
  {
    key: 'admission-cycles',
    title: 'Admission Cycles',
    description:
      'Select, review, and ready each academic-year admission cycle before operations begin.',
    path: studentPaths.enrollment.settingsSections.admissionCycles,
    icon: 'mdi:calendar-sync-outline',
    group: 'Foundation',
  },
  {
    key: 'journey',
    title: 'Admission cycle and journey',
    description: 'Calendar, stages, service targets, and handoffs.',
    path: studentPaths.enrollment.settingsSections.journey,
    icon: 'mdi:map-marker-path',
    group: 'Essential',
  },
  {
    key: 'inquiry-capture',
    title: 'Inquiry forms and sources',
    description: 'How families submit inquiries and what information is collected.',
    path: studentPaths.enrollment.settingsSections.inquiryCapture,
    icon: 'mdi:form-select',
    group: 'Essential',
  },
  {
    key: 'entrance-exams',
    title: 'Exam and eligibility',
    description: 'Assessment schedules, scoring, and eligibility rules.',
    path: studentPaths.enrollment.settingsSections.entranceExams,
    icon: 'mdi:clipboard-text-clock-outline',
    group: 'Essential',
  },
  {
    key: 'registration-documents',
    title: 'Registration and documents',
    description: 'Registration templates and required document checks.',
    path: studentPaths.enrollment.settingsSections.registrationDocuments,
    icon: 'mdi:file-document-check-outline',
    group: 'Essential',
  },
  {
    key: 'offers-seats',
    title: 'Class Placement Plan',
    description: 'Class placement capacity, approvals, offers, and waitlists.',
    path: studentPaths.enrollment.settingsSections.offersSeats,
    icon: 'mdi:seat-outline',
    group: 'Essential',
  },
  {
    key: 'advanced',
    title: 'Advanced controls',
    description: 'Assignment, activation, policies, communications, and automation.',
    path: studentPaths.enrollment.settingsSections.routingScoring,
    icon: 'mdi:tune-variant',
    group: 'Advanced',
  },
] as const;

export function EnrollmentSetupCenter() {
  const { academicYearId, state } = useEnrollmentWorkspace();
  const query = useGetAdmissionCrmSetupStatusQuery(
    { academicYearId: academicYearId || '' },
    { skip: !academicYearId }
  );
  const withCycle = (path: string) =>
    state.cycle ? `${path}?cycle=${encodeURIComponent(state.cycle)}` : path;
  const setup = query.data;
  const configured = setup?.status === 2 || setup?.status === 3;
  const visibleItems = setup?.items.filter((item) => item.accessMode !== 0);
  const admissionCyclesReady = Boolean(academicYearId);
  const essentialKeys = [
    'journey',
    'inquiry-capture',
    'entrance-exams',
    'registration-documents',
    'offers-seats',
  ];
  const completedCount =
    (visibleItems?.filter(
      (item) => essentialKeys.includes(item.key) && (item.status === 2 || item.status === 3)
    ).length ?? 0) + (admissionCyclesReady ? 1 : 0);
  const essentialCount = Math.max(
    1,
    (visibleItems?.filter((item) => essentialKeys.includes(item.key)).length ?? 5) + 1
  );

  return (
    <Stack spacing={2} sx={{ minWidth: 0 }}>
      <CustomBreadcrumbs
        heading="Enrollment Setup Center"
        description="Complete the essentials first. Advanced controls can stay on the recommended defaults."
        links={[
          { name: 'Student', href: studentPaths.dashboard },
          { name: 'Student Enrollment', href: withCycle(studentPaths.enrollment.overview) },
          { name: 'Settings' },
        ]}
        action={
          <Chip
            icon={<Iconify icon={configured ? 'mdi:check-circle-outline' : 'mdi:progress-alert'} />}
            color={configured ? 'success' : 'warning'}
            label={configured ? 'Core setup ready' : 'Setup needs attention'}
          />
        }
        sx={{ px: 2 }}
      />

      {query.isFetching ? <LinearProgress aria-label="Loading enrollment setup" /> : null}
      {query.isError ? (
        <Alert
          severity="error"
          action={
            <Button color="inherit" onClick={() => query.refetch()}>
              Retry
            </Button>
          }
        >
          Enrollment readiness could not be loaded.
        </Alert>
      ) : null}

      <Paper variant="outlined" sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} gap={2} justifyContent="space-between">
          <Stack spacing={0.75}>
            <Typography variant="overline" color="text.secondary">
              Current admission cycle
            </Typography>
            <Typography variant="h6">
              {setup?.cycleName || 'Select an academic year to begin'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {setup
                ? 'Configuration and readiness for the selected academic year.'
                : 'Configuration will be saved for the selected academic year.'}
            </Typography>
          </Stack>
          <Stack spacing={0.75} sx={{ minWidth: { md: 260 } }}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2">Essential progress</Typography>
              <Typography variant="body2" fontWeight={700}>
                {completedCount}/{essentialCount}
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={Math.min(100, (completedCount / essentialCount) * 100)}
              sx={{ height: 8, borderRadius: 999 }}
            />
            <Typography variant="caption" color="text.secondary">
              {setup?.appliedPresetName
                ? `Platform managed · ${setup.appliedPresetName} v${setup.appliedPresetVersion}`
                : 'School managed · no platform preset applied'}
            </Typography>
          </Stack>
        </Stack>
      </Paper>

      <Box>
        <Typography component="h2" variant="h6">
          Setup checklist
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Open a section to review its configuration. Your progress is saved automatically by
          section.
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
          gap: 1.25,
        }}
      >
        {setupItems
          .filter((item) => {
            if (item.key === 'admission-cycles') return true;
            if (!setup) return true;
            if (item.key === 'advanced')
              return setup.items.some(
                (statusItem) =>
                  [
                    'routing-scoring',
                    'activation',
                    'governance',
                    'communications',
                    'automation',
                  ].includes(statusItem.key) && statusItem.accessMode !== 0
              );
            return setup.items.some(
              (statusItem) => statusItem.key === item.key && statusItem.accessMode !== 0
            );
          })
          .map((item, index) => {
            const statusItem = setup?.items.find((candidate) => candidate.key === item.key);
            const ready = statusItem
              ? statusItem.status === 2 || statusItem.status === 3
              : item.key === 'admission-cycles'
                ? admissionCyclesReady
                : configured && index < 2;
            const readOnly = statusItem?.accessMode === 1;
            return (
              <Paper key={item.key} variant="outlined" sx={{ p: 1.75, borderRadius: 2 }}>
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      display: 'grid',
                      placeItems: 'center',
                      borderRadius: 1.5,
                      bgcolor: 'action.hover',
                      color: 'primary.main',
                      flexShrink: 0,
                    }}
                  >
                    <Iconify icon={item.icon} width={22} />
                  </Box>
                  <Stack spacing={0.75} sx={{ minWidth: 0, flex: 1 }}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      gap={1}
                      alignItems="flex-start"
                    >
                      <Box>
                        <Typography variant="subtitle1">{item.title}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.group}
                        </Typography>
                      </Box>
                      <Chip
                        size="small"
                        color={ready ? 'success' : 'default'}
                        label={readOnly ? 'Managed' : ready ? 'Ready' : 'Review'}
                      />
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {item.description}
                    </Typography>
                    <Button
                      component={RouterLink}
                      href={withCycle(item.path)}
                      size="small"
                      endIcon={<Iconify icon="mdi:arrow-right" />}
                      sx={{ alignSelf: 'flex-start' }}
                    >
                      {readOnly || ready ? 'Review' : 'Configure'}
                    </Button>
                  </Stack>
                </Stack>
              </Paper>
            );
          })}
      </Box>
    </Stack>
  );
}
