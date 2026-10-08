'use client';

import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';
import type {
  AdmissionIntakeSetup,
  AdmissionIntakeSetupUsage,
} from 'src/redux/student/admissions/admission-intake-profiles-api';

import Link from 'next/link';
import { useSelector } from 'react-redux';
import { useRouter } from 'src/routes/hooks';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useSearchParams } from 'next/navigation';
import { useRef, useState, useEffect } from 'react';
import { CustomTabs } from 'src/components/custom-tabs';
import { shikshaMitraToast } from 'src/components/toast';
import { studentPaths } from 'src/constants/student-menu';
import { hasGrantedPermission } from 'src/utils/permissions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import CustomizableTable from 'src/components/customizabaleTable';
import { FormSectionCard } from 'src/components/form-section-card';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';
import {
  Tab,
  Box,
  Alert,
  Stack,
  Button,
  Drawer,
  Divider,
  IconButton,
  Typography,
} from '@mui/material';
import {
  useGetAdmissionIntakeSetupsQuery,
  useGetAdmissionIntakeSetupUsageQuery,
  useArchiveAdmissionIntakeSetupMutation,
  useLazyGetAdmissionIntakeSetupUsageQuery,
} from 'src/redux/student/admissions/admission-intake-profiles-api';

import { AdmissionTableText } from './admission-table-text';
import { AdmissionIntakeNotice } from './admission-intake-notice';
import { AdmissionIntakeSetupEditor } from './admission-intake-setup-editor';
import { AdmissionPublicInquiryLinks } from './admission-public-inquiry-links';
import { shouldAutoOpenInquiryLinkCreate } from './admission-intake-setup-selection';
import {
  getAdmissionIntakeSetupListState,
  isAdmissionIntakeSetupConcurrencyError,
} from './admission-intake-setup-state';

type SetupRow = AdmissionIntakeSetup & {
  inquirySummary: string;
  routingSummary: string;
  usageSummary: string;
  statusLabel: 'Ready' | 'In use' | 'Archived' | 'Needs attention';
};

const usageTotal = (setup: AdmissionIntakeSetup) =>
  (setup.activeOfferingCount ?? 0) + (setup.activePublicInquiryLinkCount ?? 0);

const setupStatus = (setup: AdmissionIntakeSetup): SetupRow['statusLabel'] => {
  if (setup.isArchived) return 'Archived';
  if (
    !setup.isConfigurationValid ||
    !setup.inquiryRules ||
    !setup.counsellorAssignmentRules?.counsellorUserIds?.length ||
    !setup.counsellorAssignmentRules?.fallbackManagerUserId
  )
    return 'Needs attention';
  return usageTotal(setup) > 0 ? 'In use' : 'Ready';
};

const toSetupRow = (setup: AdmissionIntakeSetup): SetupRow => ({
  ...setup,
  inquirySummary: setup.inquiryRules
    ? `Contact ${setup.inquiryRules.firstContactDueInHours ?? '—'}h · Qualify ${setup.inquiryRules.qualificationDueInDays ?? '—'}d · Follow-up ${setup.inquiryRules.followUpDueInDays}d`
    : 'Inquiry rules need review',
  routingSummary: setup.counsellorAssignmentRules
    ? `${setup.counsellorAssignmentRules.counsellorUserIds.length} counsellor${setup.counsellorAssignmentRules.counsellorUserIds.length === 1 ? '' : 's'} · ${setup.counsellorAssignmentRules.maxActiveCasesPerCounsellor} cases each`
    : 'Routing rules need review',
  usageSummary:
    usageTotal(setup) === 0
      ? 'Not used yet'
      : `${setup.activeOfferingCount ?? 0} active Offering${setup.activeOfferingCount === 1 ? '' : 's'} · ${setup.activePublicInquiryLinkCount ?? 0} active link${setup.activePublicInquiryLinkCount === 1 ? '' : 's'}`,
  statusLabel: setupStatus(setup),
});

const statusColor = (status: SetupRow['statusLabel']) => {
  if (status === 'In use' || status === 'Ready') return 'success' as const;
  if (status === 'Needs attention') return 'warning' as const;
  return 'default' as const;
};

function getSetupColumns({
  canEdit,
  onEdit,
  onUseInOffering,
  onCreateLink,
  onArchive,
}: {
  canEdit: boolean;
  onEdit: (setup: AdmissionIntakeSetup) => void;
  onUseInOffering: (setup: AdmissionIntakeSetup) => void;
  onCreateLink: (setup: AdmissionIntakeSetup) => void;
  onArchive: (setup: AdmissionIntakeSetup) => void;
}): IColumn[] {
  return [
    {
      id: 'name',
      label: 'Setup name',
      filterType: 'string',
      sticky: true,
      stickyPosition: 'left',
      stickyOnMobile: false,
      minWidth: 190,
      render: (value) => <AdmissionTableText text={String(value ?? '')} strong />,
    },
    {
      id: 'inquirySummary',
      label: 'Inquiry handling',
      filterType: 'string',
      minWidth: 260,
      render: (value) => <AdmissionTableText text={String(value ?? '')} />,
    },
    {
      id: 'routingSummary',
      label: 'Counsellor routing',
      filterType: 'string',
      minWidth: 220,
      render: (value) => <AdmissionTableText text={String(value ?? '')} />,
    },
    {
      id: 'usageSummary',
      label: 'Used by',
      filterType: 'string',
      minWidth: 170,
      render: (value) => <AdmissionTableText text={String(value ?? '')} />,
    },
    {
      id: 'statusLabel',
      label: 'Status',
      filterType: 'enum',
      enumOptions: ['Ready', 'In use', 'Archived', 'Needs attention'].map((value) => ({
        label: value,
        value,
      })),
      sticky: true,
      stickyPosition: 'right',
      minWidth: 130,
      render: (_value, row) => {
        const setup = row as SetupRow;
        return <Label color={statusColor(setup.statusLabel)}>{setup.statusLabel}</Label>;
      },
    },
    {
      id: 'actions',
      label: 'Actions',
      sticky: true,
      stickyPosition: 'right',
      isSort: false,
      isFilter: false,
      excludeFromExport: true,
      align: 'right',
      minWidth: 92,
      render: (_value, row) => {
        const setup = row as SetupRow;
        const actions =
          canEdit && !setup.isArchived
            ? [
                {
                  id: 'edit',
                  label: `Edit `,
                  icon: 'solar:pen-bold',
                  onClick: () => onEdit(setup),
                },
                {
                  id: 'offering',
                  label: `Use  in an Offering`,
                  icon: 'mdi:school-outline',
                  onClick: () => onUseInOffering(setup),
                },
                {
                  id: 'link',
                  label: `Create inquiry link `,
                  icon: 'mdi:link-variant-plus',
                  onClick: () => onCreateLink(setup),
                },
                {
                  id: 'archive',
                  label: `Archive `,
                  icon: 'mdi:archive-arrow-down-outline',
                  onClick: () => onArchive(setup),
                },
              ]
            : [];
        return (
          <AdaptiveThreeDotsActions
            mobileDirectActionLimit={0}
            actions={actions}
            placement="top-right"
            moreLabel={`More actions for ${setup.name}`}
            sx={{ justifyContent: 'flex-end' }}
          />
        );
      },
    },
  ];
}

export default function AdmissionIntakeAssignmentScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = searchParams.get('view') === 'links' ? 'links' : 'setups';
  const preselectedSetupId = searchParams.get('intakeSetupId');
  const granted = useSelector((state: RootState) => state.auth.permissions);
  const currentUserId = useSelector(
    (state: RootState) => state.auth.user?.sub as string | undefined
  );
  const canEdit = hasGrantedPermission(granted, 'Students.Admissions.Offerings.Add');
  const setups = useGetAdmissionIntakeSetupsQuery({ includeArchived: true });
  const [editorSetup, setEditorSetup] = useState<AdmissionIntakeSetup | null | undefined>();
  const [viewSetup, setViewSetup] = useState<AdmissionIntakeSetup | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<AdmissionIntakeSetup | null>(null);
  const [archiveUsage, setArchiveUsage] = useState<AdmissionIntakeSetupUsage | null>(null);
  const [archiveError, setArchiveError] = useState('');
  const [archiveConflict, setArchiveConflict] = useState(false);
  const [archiveReloading, setArchiveReloading] = useState(false);
  const [linkCreateOpen, setLinkCreateOpen] = useState(Boolean(preselectedSetupId));
  const lastAutoOpenedLinkSetupId = useRef<string | null>(preselectedSetupId);
  const [loadArchiveUsage, archiveUsageState] = useLazyGetAdmissionIntakeSetupUsageQuery();
  const [archiveSetup, archiveState] = useArchiveAdmissionIntakeSetupMutation();
  const rows = (setups.data ?? []).map(toSetupRow);
  const setupListState = getAdmissionIntakeSetupListState({
    isLoading: setups.isLoading,
    isError: setups.isError,
    hasData: setups.data !== undefined,
    rowCount: rows.length,
  });
  const basePath = studentPaths.enrollment.settings.intakeAssignment;

  useEffect(() => {
    if (
      !shouldAutoOpenInquiryLinkCreate(view, preselectedSetupId, lastAutoOpenedLinkSetupId.current)
    )
      return;

    lastAutoOpenedLinkSetupId.current = preselectedSetupId;
    setLinkCreateOpen(true);
  }, [preselectedSetupId, view]);

  const useInOffering = (setup: AdmissionIntakeSetup) => {
    router.push(
      `${studentPaths.enrollment.settings.offerings}?intakeSetupId=${encodeURIComponent(setup.id)}`
    );
  };
  const createLink = (setup: AdmissionIntakeSetup) => {
    router.push(`${basePath}?view=links&intakeSetupId=${encodeURIComponent(setup.id)}`);
    setLinkCreateOpen(true);
  };
  const requestArchive = async (setup: AdmissionIntakeSetup) => {
    setArchiveTarget(setup);
    setArchiveUsage(null);
    setArchiveError('');
    setArchiveConflict(false);
    try {
      setArchiveUsage(await loadArchiveUsage(setup.id, false).unwrap());
    } catch (error) {
      setArchiveError(
        parseApiProblemDetail(error).detail || 'Unable to check where this setup is used.'
      );
    }
  };
  const confirmArchive = async () => {
    if (!archiveTarget || archiveUsage?.hasActiveUsage || archiveState.isLoading) return;
    try {
      await archiveSetup({
        id: archiveTarget.id,
        concurrencyStamp: archiveTarget.concurrencyStamp,
      }).unwrap();
      shikshaMitraToast.success({ message: 'Admission intake setup archived.' });
      setArchiveTarget(null);
      setArchiveUsage(null);
    } catch (error) {
      if (isAdmissionIntakeSetupConcurrencyError(error)) {
        setArchiveConflict(true);
        setArchiveError('');
      } else {
        setArchiveError(parseApiProblemDetail(error).detail || 'Unable to archive this setup.');
      }
    }
  };
  const reloadArchiveLatest = async () => {
    if (!archiveTarget || archiveReloading) return;
    setArchiveReloading(true);
    setArchiveError('');
    try {
      const latestSetups = await setups.refetch().unwrap();
      const latest = latestSetups.find((setup) => setup.id === archiveTarget.id);
      if (!latest) throw new Error('This admission intake setup is no longer available.');
      const latestUsage = await loadArchiveUsage(latest.id, false).unwrap();
      setArchiveTarget(latest);
      setArchiveUsage(latestUsage);
      setArchiveConflict(false);
    } catch (error) {
      setArchiveError(parseApiProblemDetail(error).detail || 'Unable to reload this setup.');
    } finally {
      setArchiveReloading(false);
    }
  };
  const reloadEditorLatest = async () => {
    if (!editorSetup) return;
    const latestSetups = await setups.refetch().unwrap();
    const latest = latestSetups.find((setup) => setup.id === editorSetup.id);
    if (!latest) throw new Error('This admission intake setup is no longer available.');
    setEditorSetup(latest);
  };

  const columns = getSetupColumns({
    canEdit,
    onEdit: setEditorSetup,
    onUseInOffering: useInOffering,
    onCreateLink: createLink,
    onArchive: requestArchive,
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: 1, minHeight: 0 }}>
      <CustomBreadcrumbs
        heading="Intake & Assignment"
        description="Configure how inquiries are handled and how one journey counsellor is assigned through onboarding."
        links={[
          { name: 'Student', href: studentPaths.dashboard },
          { name: 'Admissions', href: studentPaths.enrollment.root },
          { name: 'Settings', href: studentPaths.enrollment.settings.root },
          { name: 'Intake & Assignment' },
        ]}
        slotProps={{
          action: { alignSelf: 'flex-end' },
          heading: {},
          moreLink: {},
          breadcrumbs: {},
        }}
        action={
          canEdit ? (
            <Button
              size="small"
              variant="contained"
              startIcon={<Iconify icon={view === 'links' ? 'mdi:link-variant-plus' : 'mdi:plus'} />}
              onClick={() => {
                if (view === 'links') setLinkCreateOpen(true);
                else setEditorSetup(null);
              }}
              sx={{ minWidth: 160 }}
            >
              {view === 'links' ? 'Create inquiry link' : 'Create intake setup'}
            </Button>
          ) : null
        }
      />

      <Box
        sx={{
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
          bgcolor: 'background.paper',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        <CustomTabs
          value={view}
          aria-label="Admission intake settings"
          guardUnsavedChanges={false}
          variant="scrollable"
          scrollButtons="auto"
          slotProps={{ tab: { minHeight: 44 } }}
        >
          <Tab
            component={Link}
            href={basePath}
            value="setups"
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <Iconify icon="mdi:account-switch-outline" width={18} />
                <span>Admission intake setups</span>
              </Stack>
            }
            id="intake-setups-tab"
            aria-controls="intake-setups-panel"
          />
          <Tab
            component={Link}
            href={`${basePath}?view=links`}
            value="links"
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <Iconify icon="mdi:link-variant" width={18} />
                <span>Public inquiry links</span>
              </Stack>
            }
            id="intake-links-tab"
            aria-controls="intake-links-panel"
          />
        </CustomTabs>
      </Box>

      {view === 'setups' ? (
        <Box
          id="intake-setups-panel"
          role="tabpanel"
          aria-labelledby="intake-setups-tab"
          sx={{
            flex: 1,
            minHeight: 0,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          <AdmissionIntakeNotice
            severity="info"
            icon={<Iconify icon="mdi:source-branch" />}
            dismissalKey={currentUserId ? `admission-intake-guidance:${currentUserId}` : undefined}
          >
            <strong>How it works:</strong> Capture inquiry rules → assign the lowest-load journey
            owner → use the setup in an Admission Offering or public inquiry link.
          </AdmissionIntakeNotice>
          {!canEdit && (
            <AdmissionIntakeNotice severity="info">
              You have view-only access. An Admission Head or Admin can create and update setups.
            </AdmissionIntakeNotice>
          )}
          {setupListState === 'error' ? (
            <Alert
              severity="error"
              action={
                <Button size="small" onClick={() => setups.refetch()}>
                  Retry
                </Button>
              }
            >
              Unable to load admission intake setups.
            </Alert>
          ) : (
            <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
              <CustomizableTable
                tableId="admission-intake-setups"
                tableTitle="Admission intake setups"
                wrapperProps={{ sx: { height: 1 } }}
                tableContainerProps={{ sx: { height: 1 } }}
                columns={columns}
                data={rows}
                handleRowClick={(row) => setViewSetup(row as SetupRow)}
                rowProps={(row) => ({
                  tabIndex: 0,
                  sx: { cursor: 'pointer' },
                  onKeyDown: (event) => {
                    if (
                      event.target === event.currentTarget &&
                      (event.key === 'Enter' || event.key === ' ')
                    ) {
                      event.preventDefault();
                      setViewSetup(row as SetupRow);
                    }
                  },
                })}
                isLoading={setupListState === 'loading'}
                isPagination
                isSearch
                isFilter
                // noDataText={
                //   <Stack spacing={1.5} alignItems="center" sx={{ py: 3 }}>
                //     <Iconify icon="mdi:account-switch-outline" width={40} color="text.disabled" />
                //     <Box textAlign="center">
                //       <Typography variant="subtitle2">No admission intake setups yet</Typography>
                //       <Typography variant="body2" color="text.secondary">
                //         Create inquiry handling and counsellor routing together.
                //       </Typography>
                //     </Box>
                //     {canEdit && (
                //       <Button
                //         size="small"
                //         variant="contained"
                //         onClick={() => setEditorSetup(null)}
                //       >
                //         Create intake setup
                //       </Button>
                //     )}
                //   </Stack>
                // }
              />
            </Box>
          )}
        </Box>
      ) : (
        <Box
          id="intake-links-panel"
          role="tabpanel"
          aria-labelledby="intake-links-tab"
          sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}
        >
          <AdmissionPublicInquiryLinks
            canEdit={canEdit}
            createOpen={linkCreateOpen}
            onCreateClose={() => setLinkCreateOpen(false)}
            initialSetupId={preselectedSetupId}
          />
        </Box>
      )}

      {editorSetup !== undefined && (
        <AdmissionIntakeSetupEditor
          key={
            editorSetup ? `${editorSetup.id}:${editorSetup.concurrencyStamp}` : 'new-intake-setup'
          }
          setup={editorSetup}
          onClose={() => setEditorSetup(undefined)}
          onReloadLatest={editorSetup ? reloadEditorLatest : undefined}
        />
      )}
      <SetupDetailsDrawer
        setup={viewSetup}
        onClose={() => setViewSetup(null)}
        onEdit={canEdit ? setEditorSetup : undefined}
      />
      <ConfirmDialog
        open={Boolean(archiveTarget)}
        onClose={() => {
          if (archiveState.isLoading) return;
          setArchiveTarget(null);
          setArchiveUsage(null);
          setArchiveError('');
          setArchiveConflict(false);
        }}
        disableBackdropClick
        disableCancel={archiveState.isLoading}
        icon={archiveUsage && !archiveUsage.hasActiveUsage ? 'warning' : 'info'}
        title={
          archiveConflict
            ? 'Reload setup before archiving'
            : archiveUsage && !archiveUsage.hasActiveUsage
              ? 'Archive admission intake setup?'
              : 'Setup cannot be archived'
        }
        content={
          <Stack spacing={1}>
            {archiveUsageState.isFetching && (
              <Typography variant="body2">Checking setup usage…</Typography>
            )}
            {archiveError && <Alert severity="error">{archiveError}</Alert>}
            {archiveConflict && (
              <AdmissionIntakeNotice
                severity="warning"
                key={`archive-conflict-${archiveTarget?.id}`}
                closeDisabled={archiveReloading}
                action={
                  <Button
                    size="small"
                    color="warning"
                    loading={archiveReloading}
                    onClick={reloadArchiveLatest}
                  >
                    Reload latest
                  </Button>
                }
              >
                This setup changed in another session. Reload its latest status before deciding
                whether to archive it.
              </AdmissionIntakeNotice>
            )}
            {archiveUsage && !archiveUsage.hasActiveUsage && (
              <Typography variant="body2">
                <strong>{archiveTarget?.name}</strong> will be hidden from new Offering and
                inquiry-link selections. Its history remains available.
              </Typography>
            )}
            {archiveUsage?.hasActiveUsage && (
              <AdmissionIntakeNotice severity="warning" key={`archive-usage-${archiveTarget?.id}`}>
                Remove this setup from its active Offerings and public inquiry links before
                archiving it.
              </AdmissionIntakeNotice>
            )}
          </Stack>
        }
        action={
          archiveUsage && !archiveUsage.hasActiveUsage && !archiveConflict ? (
            <Button
              size="small"
              variant="contained"
              loading={archiveState.isLoading}
              disabled={archiveState.isLoading}
              onClick={confirmArchive}
            >
              Archive setup
            </Button>
          ) : null
        }
      />
    </Box>
  );
}

function SetupDetailsDrawer({
  setup,
  onClose,
  onEdit,
}: {
  setup: AdmissionIntakeSetup | null;
  onClose: () => void;
  onEdit?: (setup: AdmissionIntakeSetup) => void;
}) {
  const usage = useGetAdmissionIntakeSetupUsageQuery(setup?.id ?? '', { skip: !setup });
  if (!setup) return null;
  const row = toSetupRow(setup);
  return (
    <Drawer
      anchor="right"
      open
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: 1, sm: 520 },
          maxWidth: 1,
          height: '100dvh',
          display: 'flex',
          overflow: 'hidden',
        },
        role: 'dialog',
        'aria-labelledby': 'intake-setup-details-title',
      }}
    >
      <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ px: 2, py: 1.5 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
            <Typography id="intake-setup-details-title" variant="h6">
              {setup.name}
            </Typography>
            <Label color={statusColor(row.statusLabel)}>{row.statusLabel}</Label>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Admission intake setup
          </Typography>
        </Box>
        <IconButton
          size="small"
          aria-label={`Close ${setup.name} details`}
          onClick={onClose}
          sx={{ width: { xs: 44, sm: 32 }, height: { xs: 44, sm: 32 } }}
        >
          <Iconify icon="mdi:close" />
        </IconButton>
      </Stack>
      <Divider />
      <Stack
        spacing={2}
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          p: 2,
          '& > .MuiCard-root': { flexShrink: 0 },
        }}
      >
        <FormSectionCard
          icon="mdi:clipboard-text-outline"
          title="Inquiry handling"
          titleTypographyProps={{
            sx: { fontSize: { xs: '1rem', sm: '1.05rem' }, fontWeight: 700 },
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {row.inquirySummary}
          </Typography>
        </FormSectionCard>
        <FormSectionCard
          icon="mdi:account-switch-outline"
          title="Counsellor routing"
          titleTypographyProps={{
            sx: { fontSize: { xs: '1rem', sm: '1.05rem' }, fontWeight: 700 },
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {row.routingSummary}
          </Typography>
        </FormSectionCard>
        <FormSectionCard
          icon="mdi:link-variant"
          title="Dependencies & usage"
          titleTypographyProps={{
            sx: { fontSize: { xs: '1rem', sm: '1.05rem' }, fontWeight: 700 },
          }}
        >
          {usage.isLoading && (
            <Typography variant="body2" color="text.secondary">
              Loading usage…
            </Typography>
          )}
          {usage.isError && (
            <Alert
              severity="error"
              action={
                <Button size="small" onClick={() => usage.refetch()}>
                  Retry
                </Button>
              }
            >
              Unable to load setup usage.
            </Alert>
          )}
          {usage.data && (
            <Stack spacing={0.75}>
              <Typography variant="body2">
                {usage.data.offerings.length} Admission Offering
                {usage.data.offerings.length === 1 ? '' : 's'} · {usage.data.activeOfferingCount}{' '}
                active
              </Typography>
              <Typography variant="body2">
                {usage.data.publicInquiryLinks.length} public inquiry link
                {usage.data.publicInquiryLinks.length === 1 ? '' : 's'} ·{' '}
                {usage.data.activePublicInquiryLinkCount} active
              </Typography>
              {usage.data.offerings.map((item) => (
                <Typography key={item.id} variant="caption" color="text.secondary">
                  Offering · {item.name}
                </Typography>
              ))}
              {usage.data.publicInquiryLinks.map((item) => (
                <Typography key={item.id} variant="caption" color="text.secondary">
                  Link · {item.name}
                </Typography>
              ))}
            </Stack>
          )}
        </FormSectionCard>
      </Stack>
      <Divider />
      <Stack
        direction="row"
        justifyContent="flex-end"
        spacing={1}
        sx={{ p: 2, '& .MuiButton-root': { minHeight: { xs: 44, sm: 30 } } }}
      >
        <Button
          size="small"
          variant="outlined"
          startIcon={<Iconify icon="mdi:close" />}
          onClick={onClose}
        >
          Close
        </Button>
        {onEdit && !setup.isArchived && (
          <Button
            size="small"
            variant="contained"
            startIcon={<Iconify icon="solar:pen-bold" />}
            onClick={() => {
              onClose();
              onEdit(setup);
            }}
          >
            Edit setup
          </Button>
        )}
      </Stack>
    </Drawer>
  );
}
