'use client';

import type { LabelColor } from 'src/components/label';
import type {
  PaymentTermVersionResponse,
  PaymentTermVersionHistoryItem,
} from 'src/redux/finance/paymentTerm';

import CustomizableTable from 'src/components/customizabaleTable';
import FinancePolicyDrawerHeader from 'src/screens/finance/policies/components/FinancePolicyDrawerHeader';
import { Label } from 'src/components/label';
import { useTabs } from 'src/hooks/use-tabs';
import { Iconify } from 'src/components/iconify';
import { fPercent } from 'src/utils/format-number';
import { useMemo, useState, useEffect } from 'react';
import { alpha } from '@mui/material/styles';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomTabs } from 'src/components/custom-tabs';
import { fDate, fDateTime } from 'src/utils/format-time';

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
  Tooltip,
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
      <Typography
        variant="body2"
        component="div"
        sx={{
          fontWeight: 500,
          minHeight: 24,
          display: 'flex',
          alignItems: 'center',
          overflowWrap: 'anywhere',
          minWidth: 0,
        }}
      >
        {value}
      </Typography>
    </Stack>
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
        <CustomizableTable
          key={version.id}
          tableId={`payment-term-schedule-${version.id}`}
          variant="embedded"
          showToolbar={false}
          isShowedDense={false}
          isPagination={version.installments.length > 10}
          defaultRowsPerPage={10}
          data={version.installments}
          columns={[
            {
              id: 'name',
              label: 'Installment',
              minWidth: 150,
              render: (value, row) => (
                <Stack spacing={0.5}>
                  <Typography variant="body2">
                    {row.sequence}. {value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {row.demandEnabled ? 'Invoice creation enabled' : 'Invoice creation disabled'}
                    {row.reminderEnabled ? ` · Reminder ${formatDate(row.reminderDate)}` : ''}
                    {row.allowPartialOverride != null
                      ? ` · Partial payment ${row.allowPartialOverride ? 'allowed' : 'not allowed'}`
                      : ''}
                    {row.gracePeriodDaysOverride != null
                      ? ` · ${row.gracePeriodDaysOverride}-day grace period`
                      : ''}
                  </Typography>
                </Stack>
              ),
            },
            {
              id: 'coverageStartDate',
              label: 'Installment start–end date',
              minWidth: 190,
              render: (value, row) => `${formatDate(value)} – ${formatDate(row.coverageEndDate)}`,
            },
            {
              id: 'demandDate',
              label: 'Invoice date',
              minWidth: 110,
              render: (value) => formatDate(value),
            },
            {
              id: 'dueDate',
              label: 'Due date',
              minWidth: 110,
              render: (value) => formatDate(value),
            },
            {
              cellSx: { textAlign: 'right' as const },
              id: 'allocationPercentage',
              label: 'Allocation',
              minWidth: 90,
              align: 'left',
              render: (value) => fPercent(value),
            },
          ]}
          wrapperProps={{ sx: { minWidth: 0, maxHeight: 480 } }}
        />
      ) : (
        <Box>No installments are available for this version.</Box>
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
        width: 1,
        p: 2,
        minWidth: 0,
        flexShrink: 0,
        borderRight: { sm: 1 },
        borderBottom: { xs: 1, sm: 0 },
        borderColor: 'divider',
        bgcolor: 'background.neutral',
      }}
    >
      <Typography variant="overline" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
        Versions
      </Typography>
      <List
        disablePadding
        sx={{
          p: 0,
          display: 'flex',
          gap: 0.75,
          overflowX: 'auto',
        }}
      >
        {versions.map((version) => {
          const selected = version.id === selectedVersionId;
          const current = version.id === currentVersionId;

          return (
            <ListItemButton
              key={version.id}
              selected={selected}
              aria-pressed={selected}
              aria-label={`View version ${version.versionNumber}`}
              onClick={() => onSelect(version.id)}
              sx={{
                mb: { sm: 0.75 },
                minWidth: 180,
                flexShrink: 0,
                border: 1,
                borderRadius: 1,
                alignItems: 'flex-start',
                borderColor: selected ? 'primary.main' : 'divider',
                bgcolor: (theme) =>
                  selected
                    ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.2 : 0.12)
                    : (theme.vars || theme).palette.background.paper,
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
    <Stack spacing={2} sx={{ p: 2, minWidth: 0 }}>
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
            </Box>
          </Stack>
          <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
            {current ? <Label color="primary">Current version</Label> : null}
            <Label color={versionColor(version.status)}>{version.status}</Label>
          </Stack>
        </Stack>

        {version.changeReason ? (
          <Box>
            <Typography variant="caption" color="text.secondary" component="div">
              Change reason
            </Typography>
            {version.changeReason}
          </Box>
        ) : null}
      </Stack>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
            gap: 1.5,
          }}
        >
          <DetailItem
            label="Effective period"
            value={`${formatDate(version.effectiveFrom)} – ${
              version.effectiveTo ? formatDate(version.effectiveTo) : 'No end date'
            }`}
          />
          <DetailItem label="Published on" value={formatDateTime(version.publishedAt)} />
          <DetailItem
            label="Invoice date rule"
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
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
        <FinancePolicyDrawerHeader
          description="Review payment-term details and immutable version history."
          titleId="payment-term-detail-title"
          title={data?.name ?? 'Payment Term'}

          descriptionDisplay="tooltip"
          badges={
            data ? (
              <Label color={data.status === 'Active' ? 'success' : 'default'}>{data.status}</Label>
            ) : undefined
          }
          onClose={onClose}
        />
        <CustomTabs
          value={tab}
          onChange={handleTabChange}
          aria-label="Payment term details"
          variant="scrollable"
          scrollButtons="auto"
          sx={{ px: 2, pt: 1, flexShrink: 0 }}
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
        {data && (
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            useFlexGap
            flexWrap="wrap"
            sx={{ px: 2, py: 1, bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider' }}
          >
            <Typography variant="body2" color="text.secondary">
              {data.academicYearName ?? 'Academic year unavailable'} ·{' '}
              {data.boardName ?? 'Board unavailable'}
            </Typography>
            {(tab === 'versions' ? selectedVersion : displayedVersion) && (
              <Typography variant="caption">
                Version {(tab === 'versions' ? selectedVersion : displayedVersion)?.versionNumber} ·{' '}
                {(tab === 'versions' ? selectedVersion : displayedVersion)?.status}
              </Typography>
            )}
          </Stack>
        )}
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
                spacing={1.5}
                sx={{ p: 2 }}
              >
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                      gap: 1.5,
                    }}
                  >
                    <DetailItem label="Name" value={data.name} />
                    <DetailItem
                      label="Code"
                      value={
                        <Tooltip title={data.code}>
                          <Box component="span" tabIndex={0} sx={{ overflowWrap: 'anywhere' }}>
                            {data.code}
                          </Box>
                        </Tooltip>
                      }
                    />
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
                      label="Invoice date rule"
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
                  <Box>No installment schedule is available.</Box>
                )}
              </Stack>
            ) : (
              <Stack
                id="payment-term-versions-panel"
                role="tabpanel"
                aria-labelledby="payment-term-versions-tab"
                spacing={2}
                sx={{ p: 2, minWidth: 0 }}
              >
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  justifyContent="space-between"
                  alignItems={{ sm: 'baseline' }}
                  spacing={0.5}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="subtitle1">Version history</Typography>
                  </Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
                  >
                    {versions.length} {versions.length === 1 ? 'version' : 'versions'}
                  </Typography>
                </Stack>

                {versionHistoryError ? (
                  <Alert
                    severity="error"
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
                      flexDirection: 'column',
                      minWidth: 0,
                      overflow: 'hidden',
                    }}
                  >
                    <VersionList
                      versions={versions}
                      selectedVersionId={selectedVersion.id}
                      currentVersionId={data.currentVersionId}
                      onSelect={setSelectedVersionId}
                    />
                    <Box sx={{ flex: 1, minWidth: 0, bgcolor: 'background.paper' }}>
                      <VersionSnapshot
                        version={selectedVersion}
                        audit={selectedVersionAudit}
                        current={selectedVersion.id === data.currentVersionId}
                      />
                    </Box>
                  </Paper>
                ) : (
                  <Box>No payment-term versions are available.</Box>
                )}
              </Stack>
            )}
          </Scrollbar>
        ) : null}
        <Box
          sx={{
            px: { xs: 2, sm: 3 },
            py: 1.75,
            borderTop: 1,
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'flex-end',
            flexShrink: 0,
          }}
        >
          <Button
            size="small"
            variant="outlined"
            onClick={onClose}
            startIcon={<Iconify icon="mdi:close" />}
          >
            Close
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}
