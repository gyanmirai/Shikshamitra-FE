'use client';

import type { LabelColor } from 'src/components/label';
import type {
  PaymentTermVersionResponse,
  PaymentTermVersionHistoryItem,
  PaymentTermInstallmentResponse,
} from 'src/redux/finance/paymentTerm';

import { Label } from 'src/components/label';
import { useTabs } from 'src/hooks/use-tabs';
import { Iconify } from 'src/components/iconify';
import { fPercent } from 'src/utils/format-number';
import { useMemo, useState, useEffect } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomTabs } from 'src/components/custom-tabs';
import { fDate, fDateTime } from 'src/utils/format-time';
import { DrawerHeader } from 'src/screens/hr/policies/components/HRPolicySharedUI';
import { alpha } from '@mui/material/styles';
import {
  useGetPaymentTermByIdQuery,
  useGetPaymentTermVersionHistoryQuery,
} from 'src/redux/finance/paymentTerm';
import {
  Box,
  Tab,
  List,
  Alert,
  Paper,
  Stack,
  Button,
  Drawer,
  Divider,
  Typography,
  ListItemText,
  ListItemButton,
  LinearProgress,
} from '@mui/material';

import { getDemandGenerationRuleLabel, getHolidayShiftingMethodLabel } from '../paymentTermLabels';

type PaymentTermDetailsTab = 'details' | 'versions';

interface PaymentTermDetailsDrawerProps {
  open: boolean;
  paymentTermId: string | null;
  initialTab: PaymentTermDetailsTab;
  onClose: () => void;
}

const formatDate = (value?: string) => fDate(value) ?? '—';
const formatDateTime = (value?: string) => fDateTime(value) ?? '—';

const formatAction = (value: string) =>
  value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const versionColor = (status: PaymentTermVersionResponse['status']): LabelColor => {
  if (status === 'Published') return 'success';
  if (status === 'Draft') return 'warning';
  if (status === 'Archived') return 'error';
  return 'default';
};

function DetailItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Stack spacing={0.5} sx={{ minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" component="div" sx={{ fontWeight: 500 }}>
        {value}
      </Typography>
    </Stack>
  );
}

function InstallmentCard({ installment }: { installment: PaymentTermInstallmentResponse }) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={1.5}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                flexShrink: 0,
                display: 'grid',
                borderRadius: '50%',
                placeItems: 'center',
                color: 'primary.main',
                bgcolor: (theme) =>
                  alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.18 : 0.12),
              }}
            >
              <Typography variant="subtitle2">{installment.sequence}</Typography>
            </Box>
            <Typography variant="subtitle2" noWrap>
              {installment.name}
            </Typography>
          </Stack>
          <Label color="primary" variant="soft">
            {fPercent(installment.allocationPercentage)}
          </Label>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1.5fr 1fr 1fr' },
            gap: 1.5,
          }}
        >
          <DetailItem
            label="Coverage period"
            value={`${formatDate(installment.coverageStartDate)} – ${formatDate(
              installment.coverageEndDate
            )}`}
          />
          <DetailItem label="Demand date" value={formatDate(installment.demandDate)} />
          <DetailItem label="Due date" value={formatDate(installment.dueDate)} />
        </Box>

        <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
          <Label color={installment.demandEnabled ? 'success' : 'default'} variant="outlined">
            {installment.demandEnabled ? 'Demand enabled' : 'Demand disabled'}
          </Label>
          {installment.reminderEnabled ? (
            <Label color="info" variant="outlined">
              Reminder {formatDate(installment.reminderDate)}
            </Label>
          ) : null}
          {installment.allowPartialOverride !== null &&
            installment.allowPartialOverride !== undefined ? (
            <Label color="default" variant="outlined">
              Partial payment {installment.allowPartialOverride ? 'allowed' : 'not allowed'}
            </Label>
          ) : null}
          {installment.gracePeriodDaysOverride !== null &&
            installment.gracePeriodDaysOverride !== undefined ? (
            <Label color="default" variant="outlined">
              {installment.gracePeriodDaysOverride}-day grace period
            </Label>
          ) : null}
        </Stack>
      </Stack>
    </Paper>
  );
}

function InstallmentSchedule({ version }: { version: PaymentTermVersionResponse }) {
  const totalAllocation = version.installments.reduce(
    (total, installment) => total + installment.allocationPercentage,
    0
  );

  return (
    <Stack spacing={1.25}>
      <Stack direction="row" alignItems="baseline" justifyContent="space-between" spacing={1}>
        <Typography variant="subtitle1">Installment schedule</Typography>
        <Typography variant="caption" color="text.secondary">
          {version.installments.length}{' '}
          {version.installments.length === 1 ? 'installment' : 'installments'} ·{' '}
          {fPercent(totalAllocation)} allocated
        </Typography>
      </Stack>
      {version.installments.length ? (
        version.installments.map((installment) => (
          <InstallmentCard key={installment.id} installment={installment} />
        ))
      ) : (
        <Alert severity="info">No installments are available for this version.</Alert>
      )}
    </Stack>
  );
}

function VersionList({
  versions,
  selectedVersionId,
  currentVersionId,
  onSelect,
}: {
  versions: PaymentTermVersionResponse[];
  selectedVersionId?: string;
  currentVersionId?: string;
  onSelect: (versionId: string) => void;
}) {
  return (
    <Box
      component="nav"
      aria-label="Payment term versions"
      sx={{
        width: { xs: 1, sm: 220 },
        flexShrink: 0,
        borderRight: { sm: 1 },
        borderBottom: { xs: 1, sm: 0 },
        borderColor: 'divider',
        bgcolor: 'background.neutral',
      }}
    >
      <Typography
        variant="overline"
        color="text.secondary"
        sx={{ px: 2, pt: 1.5, display: 'block' }}
      >
        Versions
      </Typography>
      <List
        disablePadding
        sx={{
          p: 1,
          display: { xs: 'flex', sm: 'block' },
          gap: 0.75,
          overflowX: { xs: 'auto', sm: 'visible' },
        }}
      >
        {versions.map((version) => {
          const selected = version.id === selectedVersionId;
          const current = version.id === currentVersionId;

          return (
            <ListItemButton
              key={version.id}
              selected={selected}
              aria-label={`View version ${version.versionNumber}`}
              onClick={() => onSelect(version.id)}
              sx={{
                mb: { sm: 0.75 },
                minWidth: { xs: 180, sm: 0 },
                border: 1,
                borderRadius: 1,
                alignItems: 'flex-start',
                borderColor: selected ? 'primary.main' : 'divider',
                bgcolor: (theme) =>
                  selected
                    ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.2 : 0.12)
                    : theme.palette.background.paper,
                '&.Mui-selected, &.Mui-selected:hover': {
                  bgcolor: (theme) =>
                    alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.2 : 0.12),
                },
              }}
            >
              <ListItemText
                disableTypography
                primary={
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={1}
                  >
                    <Typography variant="subtitle2">Version {version.versionNumber}</Typography>
                    {current ? (
                      <Label color="primary" variant="soft">
                        Current
                      </Label>
                    ) : null}
                  </Stack>
                }
                secondary={
                  <Stack spacing={0.5} sx={{ mt: 0.75 }}>
                    <Box>
                      <Label color={versionColor(version.status)}>{version.status}</Label>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      From {formatDate(version.effectiveFrom)}
                    </Typography>
                  </Stack>
                }
              />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
}

function VersionSnapshot({
  version,
  audit,
  current,
}: {
  version: PaymentTermVersionResponse;
  audit?: PaymentTermVersionHistoryItem;
  current: boolean;
}) {
  return (
    <Stack spacing={2.5} sx={{ p: { xs: 2, sm: 2.5 }, minWidth: 0 }}>
      <Stack spacing={1}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ sm: 'center' }}
          justifyContent="space-between"
          spacing={1}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box
              sx={{
                width: 40,
                height: 40,
                display: 'grid',
                borderRadius: 1,
                placeItems: 'center',
                color: 'primary.main',
                bgcolor: (theme) =>
                  alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.18 : 0.12),
              }}
            >
              <Iconify icon="solar:document-text-bold-duotone" width={22} />
            </Box>
            <Box>
              <Typography variant="h6">Version {version.versionNumber}</Typography>
              <Typography variant="caption" color="text.secondary">
                Immutable payment-term snapshot
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
            {current ? <Label color="primary">Current version</Label> : null}
            <Label color={versionColor(version.status)}>{version.status}</Label>
          </Stack>
        </Stack>

        {version.changeReason ? (
          <Alert severity="info" icon={<Iconify icon="solar:notes-outline" />}>
            <Typography variant="caption" color="text.secondary" component="div">
              Change reason
            </Typography>
            {version.changeReason}
          </Alert>
        ) : null}
      </Stack>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
            gap: 2,
          }}
        >
          <DetailItem
            label="Effective period"
            value={`${formatDate(version.effectiveFrom)} – ${version.effectiveTo ? formatDate(version.effectiveTo) : 'No end date'
              }`}
          />
          <DetailItem label="Published on" value={formatDateTime(version.publishedAt)} />
          <DetailItem
            label="Demand rule"
            value={
              <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap" alignItems="center">
                <span>{getDemandGenerationRuleLabel(version.demandGenerationRule)}</span>
                {version.demandGenerationRule === 'XDaysBeforeDue' &&
                  version.demandOffsetDays !== null &&
                  version.demandOffsetDays !== undefined ? (
                  <Label color="info" variant="soft">
                    {version.demandOffsetDays} {version.demandOffsetDays === 1 ? 'day' : 'days'}
                  </Label>
                ) : null}
              </Stack>
            }
          />
          <DetailItem
            label="Holiday shift"
            value={getHolidayShiftingMethodLabel(version.holidayShiftingMethod)}
          />
          {audit ? (
            <>
              <DetailItem label="History action" value={formatAction(audit.changeAction)} />
              <DetailItem
                label="Created by"
                value={`${audit.createdByName || 'Unknown user'} · ${formatDateTime(
                  audit.creationTime
                )}`}
              />
            </>
          ) : null}
        </Box>
      </Paper>

      <InstallmentSchedule version={version} />
    </Stack>
  );
}

export default function PaymentTermDetailsDrawer({
  open,
  paymentTermId,
  initialTab,
  onClose,
}: PaymentTermDetailsDrawerProps) {
  const { value: tabValue, setValue: setTabValue, onChange: handleTabChange } = useTabs(initialTab);
  const tab = tabValue as PaymentTermDetailsTab;
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const { data, isFetching, isError, refetch } = useGetPaymentTermByIdQuery(paymentTermId ?? '', {
    skip: !open || !paymentTermId,
  });
  const {
    data: versionHistory,
    isFetching: versionHistoryFetching,
    isError: versionHistoryError,
    refetch: refetchVersionHistory,
  } = useGetPaymentTermVersionHistoryQuery(
    { paymentTermId: paymentTermId ?? '', maxResultCount: 50 },
    { skip: !open || !paymentTermId || tab !== 'versions' }
  );

  useEffect(() => {
    if (open) {
      setTabValue(initialTab);
      setSelectedVersionId(null);
    }
  }, [initialTab, open, paymentTermId, setTabValue]);

  const versions = useMemo(
    () =>
      [...(data?.versions ?? [])].sort((left, right) => right.versionNumber - left.versionNumber),
    [data?.versions]
  );

  const displayedVersion = useMemo(
    () =>
      versions.find((version) => version.status === 'Draft') ??
      versions.find((version) => version.id === data?.currentVersionId) ??
      versions.find((version) => version.status === 'Published') ??
      versions[0],
    [data?.currentVersionId, versions]
  );

  const selectedVersion = useMemo(
    () =>
      versions.find((version) => version.id === selectedVersionId) ??
      versions.find((version) => version.id === data?.currentVersionId) ??
      versions[0],
    [data?.currentVersionId, selectedVersionId, versions]
  );

  const selectedVersionAudit = versionHistory?.items.find(
    (item) =>
      item.id === selectedVersion?.id || item.versionNumber === selectedVersion?.versionNumber
  );

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', md: 860 }, maxWidth: '100%' } }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <DrawerHeader
          title={data?.name ?? 'Payment Term'}
          subtitle="Review payment-term details and immutable version history."
          onClose={onClose}
        />
        <CustomTabs
          value={tab}
          onChange={handleTabChange}
          aria-label="Payment term details"
          variant="scrollable"
          scrollButtons="auto"
          sx={{ px: 1 }}
        >
          <Tab
            id="payment-term-details-tab"
            aria-controls="payment-term-details-panel"
            value="details"
            label="Details"
          />
          <Tab
            id="payment-term-versions-tab"
            aria-controls="payment-term-versions-panel"
            value="versions"
            label="Version History"
          />
        </CustomTabs>
        <Divider />
        {isFetching || versionHistoryFetching ? (
          <LinearProgress aria-label="Loading payment term details" />
        ) : null}

        {isError ? (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => refetch()}>
                Retry
              </Button>
            }
            sx={{ m: 3 }}
          >
            Unable to load payment term details.
          </Alert>
        ) : null}

        {!isError && data ? (
          <Scrollbar sx={{ flex: 1, minHeight: 0 }}>
            {tab === 'details' ? (
              <Stack
                id="payment-term-details-panel"
                role="tabpanel"
                aria-labelledby="payment-term-details-tab"
                spacing={3}
                sx={{ p: { xs: 2, sm: 3 } }}
              >
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                      gap: 2,
                    }}
                  >
                    <DetailItem label="Name" value={data.name} />
                    <DetailItem label="Code" value={data.code} />
                    <DetailItem label="Academic year" value={data.academicYearName ?? '—'} />
                    <DetailItem label="Board" value={data.boardName ?? '—'} />
                    <DetailItem
                      label="Status"
                      value={
                        <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
                          <Label color={data.status === 'Active' ? 'success' : 'default'}>
                            {data.status}
                          </Label>
                          {data.isDefault ? (
                            <Label color="primary" variant="outlined">
                              Default
                            </Label>
                          ) : null}
                        </Stack>
                      }
                    />
                    <DetailItem label="Versions" value={data.versionCount} />
                    <DetailItem label="Installments" value={data.totalInstallments} />
                    <DetailItem
                      label="Referenced structures"
                      value={data.isUsedInFeeStructures ? 'In use' : 'Not referenced'}
                    />
                    <DetailItem
                      label="Holiday shift"
                      value={getHolidayShiftingMethodLabel(data.holidayShiftingMethod)}
                    />
                    <DetailItem
                      label="Demand rule"
                      value={
                        <Stack
                          direction="row"
                          spacing={0.75}
                          useFlexGap
                          flexWrap="wrap"
                          alignItems="center"
                        >
                          <span>{getDemandGenerationRuleLabel(data.demandGenerationRule)}</span>
                          {data.demandGenerationRule === 'XDaysBeforeDue' &&
                            data.demandOffsetDays !== null &&
                            data.demandOffsetDays !== undefined ? (
                            <Label color="info" variant="soft">
                              {data.demandOffsetDays} {data.demandOffsetDays === 1 ? 'day' : 'days'}
                            </Label>
                          ) : null}
                        </Stack>
                      }
                    />
                  </Box>
                </Paper>

                {data.description ? (
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <DetailItem label="Description" value={data.description} />
                  </Paper>
                ) : null}

                {displayedVersion ? (
                  <Stack spacing={1.25}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle1">Displayed schedule</Typography>
                      <Stack direction="row" spacing={0.75} alignItems="center">
                        <Typography variant="caption" color="text.secondary">
                          Version {displayedVersion.versionNumber}
                        </Typography>
                        <Label color={versionColor(displayedVersion.status)}>
                          {displayedVersion.status}
                        </Label>
                      </Stack>
                    </Stack>
                    <InstallmentSchedule version={displayedVersion} />
                  </Stack>
                ) : (
                  <Alert severity="info">No installment schedule is available.</Alert>
                )}
              </Stack>
            ) : (
              <Stack
                id="payment-term-versions-panel"
                role="tabpanel"
                aria-labelledby="payment-term-versions-tab"
                spacing={2}
                sx={{ p: { xs: 2, sm: 2.5 } }}
              >
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  justifyContent="space-between"
                  alignItems={{ sm: 'baseline' }}
                  spacing={0.5}
                >
                  <Box>
                    <Typography variant="subtitle1">Version history</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Select a version to review the exact rules and installment schedule used at
                      that time.
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                    {versions.length} {versions.length === 1 ? 'version' : 'versions'}
                  </Typography>
                </Stack>

                {versionHistoryError ? (
                  <Alert
                    severity="warning"
                    action={
                      <Button color="inherit" size="small" onClick={() => refetchVersionHistory()}>
                        Retry
                      </Button>
                    }
                  >
                    Version snapshots are available, but creator and action details could not be
                    loaded.
                  </Alert>
                ) : null}

                {selectedVersion ? (
                  <Paper
                    variant="outlined"
                    sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      minHeight: 420,
                      overflow: 'hidden',
                    }}
                  >
                    <VersionList
                      versions={versions}
                      selectedVersionId={selectedVersion.id}
                      currentVersionId={data.currentVersionId}
                      onSelect={setSelectedVersionId}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <VersionSnapshot
                        version={selectedVersion}
                        audit={selectedVersionAudit}
                        current={selectedVersion.id === data.currentVersionId}
                      />
                    </Box>
                  </Paper>
                ) : (
                  <Alert severity="info">No payment-term versions are available.</Alert>
                )}
              </Stack>
            )}
          </Scrollbar>
        ) : null}
      </Box>
    </Drawer>
  );
}
