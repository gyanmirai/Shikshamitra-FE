'use client';

import type { RootState } from 'src/redux/store';
import type { EsiEmployeeImpact } from 'src/redux/hr/statutory-scheme-api';

import Link from 'next/link';
import { useSelector } from 'react-redux';
import { hrPermissions } from 'src/constants/hr-menus';
import { shikshaMitraToast } from 'src/components/toast';
import { Refresh, VerifiedUser } from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import { hasGrantedPermission } from 'src/utils/permissions';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import {
  Box,
  Tab,
  Tabs,
  Chip,
  Alert,
  Button,
  Skeleton,
  TextField,
  Typography,
} from '@mui/material';
import {
  useGetEsiRuleQuery,
  useActivateEsiMutation,
  usePreviewEsiImpactQuery,
  useGetEsiEstablishmentQuery,
  useGetEsiComponentTreatmentsQuery,
} from 'src/redux/hr/statutory-scheme-api';

import EsiOverrideDialog from './esi-override-dialog';
import { EsiEnrollmentDrawer } from './esi-enrollment-drawer';
import { EsiActivationDialog } from './esi-activation-dialog';
import { EsiStatutoryOverview } from './esi-statutory-overview';
import { EsiStatutoryAdvanced } from './esi-statutory-advanced';
import { EsiStatutoryEmployees } from './esi-statutory-employees';
import { useEsiUnsavedNavigation } from './esi-unsaved-navigation';
import {
  toApiMonth,
  formatPreviewTime,
  getPayrollMonthEnd,
  getLegacyEsiTabHash,
  buildEsiWorkspaceHref,
  parseEsiWorkspaceQuery,
} from './esi-statutory-utils';

const statusLabels: Record<string, string> = {
  Draft: 'Setup needed',
  Ready: 'Ready for review',
  Active: 'Active',
  Suspended: 'Suspended',
};

const viewLabels = {
  overview: 'Overview',
  employees: 'Employees',
  advanced: 'Settings',
} as const;

export const isStalePreviewError = (error: unknown) =>
  parseApiProblemDetail(error).errorCode === 'ESI_PREVIEW_STALE';

export default function EsiStatutorySettings() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = useMemo(
    () => parseEsiWorkspaceQuery(new URLSearchParams(searchParams.toString())),
    [searchParams]
  );
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canEdit = hasGrantedPermission(
    permissions,
    hrPermissions.payroll.settings.statutorySchemeActions.edit
  );
  const canActivate = hasGrantedPermission(
    permissions,
    hrPermissions.payroll.settings.statutorySchemeActions.activate
  );
  const canManageEnrollment = hasGrantedPermission(
    permissions,
    hrPermissions.payroll.settings.statutorySchemeActions.manageEnrollment
  );
  const canApproveOverride = hasGrantedPermission(
    permissions,
    hrPermissions.payroll.settings.statutorySchemeActions.approveOverride
  );
  const [selectedEmployee, setSelectedEmployee] = useState<EsiEmployeeImpact | null>(null);
  const [overrideEmployee, setOverrideEmployee] = useState<EsiEmployeeImpact | null>(null);
  const [activationOpen, setActivationOpen] = useState(false);
  const [hasUnsavedAdvancedChanges, setHasUnsavedAdvancedChanges] = useState(false);
  const { requestNavigation, confirmation } = useEsiUnsavedNavigation(
    hasUnsavedAdvancedChanges,
    router.push
  );

  const ruleQuery = useGetEsiRuleQuery(getPayrollMonthEnd(query.month));
  const establishmentQuery = useGetEsiEstablishmentQuery();
  const treatmentsQuery = useGetEsiComponentTreatmentsQuery(`${query.month}-01`);
  const previewRequest = useMemo(
    () => ({
      monthYear: toApiMonth(query.month),
      search: query.search || undefined,
      coverage: query.coverage,
      readiness: query.readiness,
      enrollmentStatuses: query.enrollmentStatuses,
      page: query.page,
      pageSize: query.pageSize,
      sortBy: query.sortBy,
      sortDirection: query.sortDirection,
    }),
    [query]
  );
  const previewQuery = usePreviewEsiImpactQuery(previewRequest, {
    refetchOnMountOrArgChange: true,
  });
  const [activate, activationState] = useActivateEsiMutation();

  const hrefFor = useCallback(
    (updates: Record<string, string | number | null>) =>
      buildEsiWorkspaceHref(new URLSearchParams(searchParams.toString()), updates),
    [searchParams]
  );

  const updateQuery = useCallback(
    (updates: Record<string, string | number | null>) => {
      router.replace(hrefFor(updates), { scroll: false });
    },
    [hrefFor, router]
  );

  useEffect(() => {
    const hasLegacyTab = searchParams.has('tab');
    const hasValidView = ['overview', 'employees', 'advanced'].includes(
      searchParams.get('view') || ''
    );
    if (hasLegacyTab || !hasValidView || !searchParams.has('month')) {
      router.replace(
        `${hrefFor({ view: query.view, month: query.month })}${getLegacyEsiTabHash(searchParams.get('tab'))}`,
        { scroll: false }
      );
    }
  }, [hrefFor, query.month, query.view, router, searchParams]);

  const goToResolution = () => {
    requestNavigation(() => {
    const firstIssue = previewQuery.data?.summary.blockingIssues[0];
    if (
      firstIssue?.resolutionTarget === 'employeeEnrollment' ||
      firstIssue?.resolutionTarget === 'compensationRevision'
    ) {
      router.push(hrefFor({ view: 'employees', readiness: 'needsAttention', page: 0 }));
      return;
    }
    const hash =
      firstIssue?.resolutionTarget === 'establishment'
        ? '#establishment'
        : '#earning-classifications';
    router.push(`${hrefFor({ view: 'advanced' })}${hash}`);
    });
  };

  const handlePrimaryAction = () => {
    const reviewOnly =
      establishmentQuery.data?.status === 'Active' ||
      (previewQuery.data?.summary.canActivate && !canActivate);
    if (reviewOnly) {
      if (query.view === 'overview') {
        document
          .getElementById('monthly-impact')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        requestNavigation(() => router.push(`${hrefFor({ view: 'overview', page: 0 })}#monthly-impact`));
      }
      return;
    }
    if (previewQuery.data?.summary.canActivate && canActivate) {
      setActivationOpen(true);
      return;
    }
    goToResolution();
  };

  const activateScheme = async () => {
    const preview = previewQuery.data;
    if (!preview?.summary.canActivate) return;
    try {
      await activate({
        monthYear: toApiMonth(query.month),
        previewFingerprint: preview.previewFingerprint,
      }).unwrap();
      setActivationOpen(false);
      shikshaMitraToast.success({ message: 'ESI is active for payroll.' });
      await Promise.all([establishmentQuery.refetch(), previewQuery.refetch()]);
    } catch (error) {
      setActivationOpen(false);
      if (isStalePreviewError(error)) {
        await previewQuery.refetch();
        shikshaMitraToast.info({
          message: 'The payroll impact changed. Review the refreshed totals before activating ESI.',
        });
        return;
      }
      shikshaMitraToast.error({
        message: 'ESI could not be activated. Refresh the impact and resolve every blocker.',
      });
    }
  };

  const status = establishmentQuery.data?.status || 'Draft';
  const primaryActionLabel =
    status === 'Active' || (previewQuery.data?.summary.canActivate && !canActivate)
      ? 'Review current month'
      : previewQuery.data?.summary.canActivate && canActivate
        ? 'Review and activate'
        : 'Resolve setup issues';
  const coreError = ruleQuery.isError || establishmentQuery.isError;
  const coreLoading = ruleQuery.isLoading || establishmentQuery.isLoading;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pb: 4, minWidth: 0 }}>
      <Box
        sx={{
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
          bgcolor: 'background.paper',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: { xs: 'stretch', md: 'center' },
            justifyContent: 'space-between',
            flexDirection: { xs: 'column', md: 'row' },
            flexWrap: 'wrap',
            gap: 2,
            p: { xs: 2, md: 2.5 },
          }}
        >
          <Box minWidth={0}>
            <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
              <VerifiedUser color="primary" />
              <Typography variant="h5">Employee State Insurance</Typography>
              <Chip
                size="small"
                color={status === 'Active' ? 'success' : status === 'Ready' ? 'info' : 'warning'}
                label={coreLoading ? 'Checking' : coreError ? 'Unavailable' : statusLabels[status]}
              />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Recurring setup, employee coverage, and monthly payroll impact in one workspace.
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: { xs: 'stretch', sm: 'center' },
              flexDirection: { xs: 'column', sm: 'row' },
              flexShrink: 0,
              gap: 1.25,
            }}
          >
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Last preview
              </Typography>
              <Typography variant="body2">
                {formatPreviewTime(previewQuery.data?.generatedAtUtc)}
              </Typography>
            </Box>
            <TextField
              size="small"
              type="month"
              label="Payroll month"
              value={query.month}
              slotProps={{ inputLabel: { shrink: true } }}
              onChange={(event) => {
                const month = event.target.value;
                requestNavigation(() => updateQuery({ month, page: 0, search: null }));
              }}
              sx={{ minWidth: 170 }}
            />
            <Button
              variant="contained"
              onClick={handlePrimaryAction}
              disabled={coreLoading || coreError || previewQuery.isFetching || previewQuery.isError}
              sx={{ minHeight: 44, whiteSpace: 'nowrap' }}
            >
              {primaryActionLabel}
            </Button>
          </Box>
        </Box>

        <Tabs
          value={query.view}
          variant="scrollable"
          allowScrollButtonsMobile
          aria-label="ESI workspace views"
          sx={{ borderTop: 1, borderColor: 'divider', px: 1 }}
        >
          {Object.entries(viewLabels).map(([view, label]) => (
            <Tab
              key={view}
              component={Link}
              href={hrefFor({ view, page: view === 'employees' ? query.page : 0 })}
              value={view}
              label={label}
              id={`esi-tab-${view}`}
              aria-controls={`esi-panel-${view}`}
              sx={{ minHeight: 48 }}
            />
          ))}
        </Tabs>
      </Box>

      {coreError ? (
        <Alert
          severity="error"
          action={
            <Button
              onClick={() => {
                ruleQuery.refetch();
                establishmentQuery.refetch();
              }}
            >
              Retry
            </Button>
          }
        >
          Core ESI settings could not be loaded. Navigation remains available while you retry.
        </Alert>
      ) : null}

      {coreLoading ? (
        <Box display="grid" gap={1.5}>
          <Skeleton variant="rounded" height={92} />
          <Skeleton variant="rounded" height={220} />
        </Box>
      ) : null}

      <Box role="tabpanel" id={`esi-panel-${query.view}`} aria-labelledby={`esi-tab-${query.view}`} sx={{ minWidth: 0 }}>
      {!coreLoading && query.view === 'overview' ? (
        <EsiStatutoryOverview
          month={query.month}
          rule={ruleQuery.data}
          establishment={establishmentQuery.data}
          establishmentUnavailable={establishmentQuery.isError}
          treatments={treatmentsQuery.data}
          isTreatmentsLoading={treatmentsQuery.isFetching}
          treatmentsError={treatmentsQuery.isError}
          preview={previewQuery.data}
          isPreviewLoading={previewQuery.isFetching}
          previewError={previewQuery.isError}
          hrefFor={hrefFor}
          onRetryPreview={() => previewQuery.refetch()}
        />
      ) : null}

      {!coreLoading && query.view === 'employees' ? (
        <EsiStatutoryEmployees
          query={query}
          preview={previewQuery.data}
          isLoading={previewQuery.isFetching}
          isError={previewQuery.isError}
          canManageEnrollment={canManageEnrollment}
          canApproveOverride={canApproveOverride}
          onRetry={() => previewQuery.refetch()}
          onQueryChange={updateQuery}
          onOpenEmployee={setSelectedEmployee}
        />
      ) : null}

      {!coreLoading && query.view === 'advanced' ? (
        <EsiStatutoryAdvanced
          month={query.month}
          rule={ruleQuery.data}
          establishment={establishmentQuery.data}
          treatments={treatmentsQuery.data}
          isTreatmentsLoading={treatmentsQuery.isFetching}
          treatmentsError={treatmentsQuery.isError}
          canEdit={canEdit}
          onRetryTreatments={() => treatmentsQuery.refetch()}
          onDirtyChange={setHasUnsavedAdvancedChanges}
        />
      ) : null}

      </Box>
      {previewQuery.isFetching && previewQuery.data ? (
        <Box sx={{ position: 'fixed', right: 24, bottom: 24, zIndex: 1200 }}>
          <Chip icon={<Refresh />} label="Refreshing ESI impact…" color="info" />
        </Box>
      ) : null}

      <EsiEnrollmentDrawer
        employee={selectedEmployee}
        open={Boolean(selectedEmployee)}
        canManageEnrollment={canManageEnrollment}
        canApproveOverride={canApproveOverride}
        onClose={() => setSelectedEmployee(null)}
        onSaved={() => previewQuery.refetch()}
        onAddOverride={() => {
          setOverrideEmployee(selectedEmployee);
          setSelectedEmployee(null);
        }}
      />

      <EsiOverrideDialog
        employee={overrideEmployee}
        month={query.month}
        open={Boolean(overrideEmployee)}
        onClose={() => setOverrideEmployee(null)}
        onSaved={async () => {
          await previewQuery.refetch();
        }}
      />

      {activationOpen && previewQuery.data ? (
        <EsiActivationDialog
          open
          month={query.month}
          summary={previewQuery.data.summary}
          isActivating={activationState.isLoading}
          onClose={() => setActivationOpen(false)}
          onConfirm={activateScheme}
        />
      ) : null}
      {confirmation}
    </Box>
  );
}
