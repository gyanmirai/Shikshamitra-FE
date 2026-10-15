import type { GrantedPermission } from 'src/utils/permissions';
import type { StudentModuleDashboardMetric } from 'src/redux/student/dashboard/student-module-dashboard-types';

import Link from 'next/link';
import { Iconify } from 'src/components/iconify';
import { fNumber } from 'src/utils/format-number';
import { EmptyContent } from 'src/components/empty-content';
import { hasGrantedPermission } from 'src/utils/permissions';
import { Box, Alert, Stack, Button, Skeleton, Typography, ButtonBase } from '@mui/material';

import { AdminDashboardPanel } from './admin-dashboard-panel';

import type {
  StudentSectionQuery,
  StudentSectionQueries,
} from '../hooks/use-student-dashboard-sections';

const icons: Record<string, string> = {
  admissionDecisions: 'mdi:application-edit-outline',
  recordApprovals: 'mdi:file-document-edit-outline',
  inquiryFollowUps: 'mdi:message-processing-outline',
  leave: 'mdi:calendar-edit-outline',
  division: 'mdi:google-classroom',
  gr: 'mdi:identifier',
  roll: 'mdi:format-list-numbered',
  documents: 'mdi:file-check-outline',
  credentials: 'mdi:account-key-outline',
  ready: 'mdi:check-circle-outline',
};

function WorkRow({ item }: { item: StudentModuleDashboardMetric }) {
  return (
    <ButtonBase
      component={Link}
      prefetch={false}
      href={item.href}
      aria-label={`${item.label}: ${fNumber(item.value)}. Open workspace`}
      sx={{
        display: 'flex',
        width: 1,
        gap: 1.5,
        py: 1.25,
        px: 1,
        textAlign: 'left',
        borderRadius: 1,
        '&:hover': { bgcolor: 'action.hover' },
        '&.Mui-focusVisible': { outline: '2px solid', outlineColor: 'primary.main' },
      }}
    >
      <Iconify
        icon={icons[item.id] ?? 'mdi:clipboard-check-outline'}
        width={20}
        sx={{ flexShrink: 0, color: item.tone === 'success' ? 'success.main' : 'text.secondary' }}
      />
      <Typography variant="body2" sx={{ flex: 1 }}>
        {item.label}
      </Typography>
      <Typography
        variant="subtitle2"
        color={
          item.tone === 'warning'
            ? 'warning.dark'
            : item.tone === 'success'
              ? 'success.dark'
              : 'text.primary'
        }
      >
        {fNumber(item.value)}
      </Typography>
      <Iconify
        icon="mdi:chevron-right"
        width={18}
        sx={{ color: 'text.secondary', flexShrink: 0 }}
      />
    </ButtonBase>
  );
}

export function AdminDashboardWorkGroups({
  queries,
  sections,
  permissions,
}: {
  queries: StudentSectionQueries;
  sections: (keyof StudentSectionQueries)[];
  permissions: GrantedPermission[];
}) {
  const active = sections.map((key) => ({ key, query: queries[key] }));
  const loading = active.some(({ query }) => !query.currentData && !query.isError);
  const failed = active.filter(({ query }) => query.isError);
  const rows = active
    .flatMap(({ query }) => (query.isError ? [] : (query.currentData?.workGroups ?? [])))
    .filter((item) => item.value > 0 && hasGrantedPermission(permissions, item.permission));
  return (
    <AdminDashboardPanel
      title="Decisions & follow-ups"
      description="Review pending decisions and follow-ups in their owning workspace."
    >
      <Stack spacing={1} sx={{ flex: 1 }}>
        {failed.map(({ key, query }) => (
          <Alert
            key={key}
            severity="warning"
            action={
              <Button size="small" color="inherit" onClick={query.refetch}>
                Retry
              </Button>
            }
          >
            {key === 'admissions' ? 'Admissions' : key === 'records' ? 'Record changes' : 'Leave'}{' '}
            summary unavailable. This queue may be incomplete.
          </Alert>
        ))}
        {loading && (
          <Skeleton variant="rounded" height={100} aria-label="Loading decisions and follow-ups" />
        )}
        <Box sx={{ '& > :not(:last-child)': { borderBottom: 1, borderColor: 'divider' } }}>
          {rows.map((item) => (
            <WorkRow key={item.id} item={item} />
          ))}
        </Box>
        {!loading && !failed.length && !rows.length && (
          <EmptyContent
            title={
              <Typography component="span" variant="body2" fontWeight={600} color="text.primary">
                No pending decisions
              </Typography>
            }
            description="No follow-ups awaiting a response in this scope."
            sx={{ py: 3 }}
            slotProps={{ img: { maxWidth: 88 }, description: { color: 'text.secondary' } }}
          />
        )}
        {rows.length > 0 && (
          <Typography variant="caption" color="text.secondary">
            Open a queue to review its records.
          </Typography>
        )}
      </Stack>
    </AdminDashboardPanel>
  );
}

export function AdminDashboardOnboarding({
  query,
  permissions,
}: {
  query: StudentSectionQuery;
  permissions: GrantedPermission[];
}) {
  const tasks = (!query.isError ? (query.currentData?.onboardingTasks ?? []) : []).filter((item) =>
    hasGrantedPermission(permissions, item.permission)
  );
  const ready = tasks.find((item) => item.id === 'ready');
  const pending = tasks.filter((item) => item.id !== 'ready' && item.value > 0);
  return (
    <AdminDashboardPanel
      title="Onboarding tasks"
      description="Find the step holding setup back. Task groups may overlap. Activation readiness is checked again in Onboarding."
      query={query}
    >
      <Stack spacing={1} sx={{ flex: 1 }}>
        <Box sx={{ '& > :not(:last-child)': { borderBottom: 1, borderColor: 'divider' } }}>
          {pending.map((item) => (
            <WorkRow key={item.id} item={item} />
          ))}
        </Box>
        {!pending.length && (
          <EmptyContent
            title={
              <Typography component="span" variant="body2" fontWeight={600} color="text.primary">
                No pending setup tasks
              </Typography>
            }
            description="For the selected scope."
            sx={{ py: 3 }}
            slotProps={{ img: { maxWidth: 88 }, description: { color: 'text.secondary' } }}
          />
        )}
        {ready && ready.value > 0 && (
          <Box sx={{ bgcolor: 'background.neutral', borderRadius: 1 }}>
            <WorkRow item={ready} />
          </Box>
        )}
      </Stack>
    </AdminDashboardPanel>
  );
}
