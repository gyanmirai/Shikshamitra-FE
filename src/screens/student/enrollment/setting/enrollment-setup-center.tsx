'use client';

import type { AdmissionCrmSetupStatusDto } from 'src/redux/student/admissions-crm/setup-playbooks-contracts';

import { Iconify } from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import { studentPaths } from 'src/constants/student-menu';
import { Box, Chip, Alert, Stack, Paper, Button, Typography, LinearProgress } from '@mui/material';
import { useGetAdmissionCrmSetupStatusQuery } from 'src/redux/student/admissions-crm/setup-playbooks-api';

import { EnrollmentWorkspaceHeader } from '../admissions-crm/workspace-header';
import { useEnrollmentWorkspace } from '../admissions-crm/enrollment-workspace-context';

type SetupItem = {
  key: string;
  statusKeys: string[];
  title: string;
  description: string;
  path: string;
  icon: string;
  group: string;
};

type SetupCard = SetupItem & {
  ready: boolean;
  readOnly: boolean;
};

const setupItems: SetupItem[] = [
  {
    key: 'admission-year',
    statusKeys: ['admission-year'],
    title: 'Admission Year Setup',
    description: 'Connect enrollment to an academic year and control when admissions are open.',
    path: studentPaths.enrollment.settingsSections.admissionYear,
    icon: 'mdi:calendar-sync-outline',
    group: 'Admission year',
  },
  {
    key: 'pipeline',
    statusKeys: ['pipeline'],
    title: 'Pipeline Settings',
    description: 'Configure inquiry sources, capture fields, ownership, and priority.',
    path: studentPaths.enrollment.settingsSections.pipeline,
    icon: 'mdi:view-column-outline',
    group: 'Inquiry',
  },
  {
    key: 'entrance-exam',
    statusKeys: ['entrance-exam'],
    title: 'Assessment Settings',
    description: 'Configure written tests, interviews, interactions, schedules, and result rules.',
    path: studentPaths.enrollment.settingsSections.entranceExam,
    icon: 'mdi:clipboard-text-clock-outline',
    group: 'Evaluation',
  },
  {
    key: 'registration',
    statusKeys: ['registration'],
    title: 'Registration Settings',
    description: 'Choose the applicant details and documents the school must collect.',
    path: studentPaths.enrollment.settingsSections.registration,
    icon: 'mdi:file-document-check-outline',
    group: 'Registration',
  },
  {
    key: 'finance-handoff',
    statusKeys: ['finance-handoff'],
    title: 'Finance Handoff Settings',
    description: 'Control when a fee request is sent to Finance and what status blocks activation.',
    path: studentPaths.enrollment.settingsSections.financeHandoff,
    icon: 'mdi:bank-transfer',
    group: 'Finance',
  },
  {
    key: 'class-placement',
    statusKeys: ['class-placement'],
    title: 'Class Placement Settings',
    description:
      'Configure placement timing and capacity handling for board, medium, and standard.',
    path: studentPaths.enrollment.settingsSections.classPlacement,
    icon: 'mdi:seat-outline',
    group: 'Placement',
  },
  {
    key: 'activation',
    statusKeys: ['activation'],
    title: 'Activation Settings',
    description: 'Define the checks required before creating the active student record.',
    path: studentPaths.enrollment.settingsSections.activation,
    icon: 'mdi:account-check-outline',
    group: 'Activation',
  },
  {
    key: 'communication',
    statusKeys: ['communication'],
    title: 'Communication Settings',
    description: 'Choose parent message templates, channels, and reminder timing.',
    path: studentPaths.enrollment.settingsSections.communication,
    icon: 'mdi:message-text-outline',
    group: 'Communication',
  },
];

export const buildEnrollmentSetupCards = (setup?: AdmissionCrmSetupStatusDto): SetupCard[] =>
  setupItems.flatMap((item) => {
    if (!setup) return [{ ...item, ready: false, readOnly: false }];

    const visibleStatuses = setup.items.filter(
      (candidate) => item.statusKeys.includes(candidate.key) && candidate.accessMode !== 0
    );
    if (!visibleStatuses.length) return [];

    return [
      {
        ...item,
        ready: visibleStatuses.every(
          (candidate) => candidate.status === 2 || candidate.status === 3
        ),
        readOnly: visibleStatuses.every((candidate) => candidate.accessMode === 1),
      },
    ];
  });

export function EnrollmentSetupCenter() {
  const { academicYearId, state } = useEnrollmentWorkspace();
  const query = useGetAdmissionCrmSetupStatusQuery(
    { academicYearId: academicYearId || '' },
    { skip: !academicYearId }
  );
  const withCycle = (path: string) =>
    state.cycle ? `${path}?cycle=${encodeURIComponent(state.cycle)}` : path;
  const setup = query.data;
  const isActiveYearPending = Boolean(academicYearId) && !setup;
  const showSetupContent = !query.isError && !isActiveYearPending;
  const cards = showSetupContent ? buildEnrollmentSetupCards(setup) : [];
  const completedCount = cards.filter((item) => item.ready).length;
  const essentialCount = cards.length;
  const configured = essentialCount > 0 && completedCount === essentialCount;

  return (
    <Stack spacing={2} sx={{ minWidth: 0 }}>
      <EnrollmentWorkspaceHeader
        title="Enrollment Setup Center"
        description="Complete the essentials first. Advanced controls can stay on the recommended defaults."
        actions={
          setup && !query.isError ? (
            <Chip
              icon={
                <Iconify icon={configured ? 'mdi:check-circle-outline' : 'mdi:progress-alert'} />
              }
              color={configured ? 'success' : 'warning'}
              label={configured ? 'Core setup ready' : 'Setup needs attention'}
            />
          ) : undefined
        }
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

      {showSetupContent ? (
        <>
          <Paper variant="outlined" sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 2 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} gap={2} justifyContent="space-between">
              <Stack spacing={0.75}>
                <Typography variant="overline" color="text.secondary">
                  Current admission year
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
                  aria-label="Essential enrollment setup completion"
                  variant="determinate"
                  value={
                    essentialCount ? Math.min(100, (completedCount / essentialCount) * 100) : 0
                  }
                  sx={{ height: 8, borderRadius: 999 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {setup?.appliedPresetName
                    ? `Platform managed | ${setup.appliedPresetName} v${setup.appliedPresetVersion}`
                    : 'School managed | no platform preset applied'}
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
            {cards.map((item) => (
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
                        color={item.ready ? 'success' : 'default'}
                        label={item.readOnly ? 'Managed' : item.ready ? 'Ready' : 'Review'}
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
                      {item.readOnly || item.ready ? 'Review' : 'Configure'}
                    </Button>
                  </Stack>
                </Stack>
              </Paper>
            ))}
          </Box>
        </>
      ) : null}
    </Stack>
  );
}
