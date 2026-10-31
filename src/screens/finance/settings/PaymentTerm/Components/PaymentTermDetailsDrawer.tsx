'use client';

import type { ReactNode } from 'react';
import type { LabelColor } from 'src/components/label';
import type {
  PaymentTermVersionResponse,
  PaymentTermVersionHistoryItem,
} from 'src/redux/finance/paymentTerm';

import { alpha } from '@mui/material/styles';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { fPercent } from 'src/utils/format-number';
import { useMemo, useState, useEffect } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import { fDate, fDateTime } from 'src/utils/format-time';
import CustomizableTable from 'src/components/customizabaleTable';
import { FormSectionCard } from 'src/components/form-section-card';
import { DetailGrid, DetailField, DetailSection } from 'src/components/detail-view';
import { Box, Alert, Stack, Button, Drawer, Typography, LinearProgress } from '@mui/material';
import FinancePolicySkeleton from 'src/screens/finance/policies/components/FinancePolicySkeleton';
import FinancePolicyDrawerHeader from 'src/screens/finance/policies/components/FinancePolicyDrawerHeader';
import {
  useGetPaymentTermByIdQuery,
  useGetPaymentTermVersionHistoryQuery,
} from 'src/redux/finance/paymentTerm';

import PaymentTermVersionHistory from './PaymentTermVersionHistory';
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
const sectionCardProps = {
  titleTypographyProps: { variant: 'subtitle1' as const, fontWeight: 600 },
  sx: { minWidth: 0, boxShadow: 'none', containerType: 'inline-size' },
};
const detailGridSx = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr)',
  gap: 2,
  '@container (min-width: 440px)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
};

function DetailItem({
  label,
  value,
  fullWidth = false,
}: {
  label: string;
  value: ReactNode;
  fullWidth?: boolean;
}) {
  return <DetailField label={label} value={value} fullWidth={fullWidth} />;
}

function InvoiceRule({ version }: { version: PaymentTermVersionResponse }) {
  return (
    <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap" alignItems="center">
      <span>{getDemandGenerationRuleLabel(version.demandGenerationRule)}</span>
      {version.demandGenerationRule === 'XDaysBeforeDue' && version.demandOffsetDays != null && (
        <Label color="info">
          {version.demandOffsetDays} {version.demandOffsetDays === 1 ? 'day' : 'days'}
        </Label>
      )}
    </Stack>
  );
}

function InstallmentSchedule({
  version,
  onHistory,
  showRules = true,
}: {
  version: PaymentTermVersionResponse;
  onHistory?: () => void;
  showRules?: boolean;
}) {
  const totalAllocation = version.installments.reduce(
    (total, installment) => total + installment.allocationPercentage,
    0
  );

  return (
    <FormSectionCard
      {...sectionCardProps}
      title="Installment Schedule"
      actionFullWidthOnMobile
      icon={GlobalIcons.calendar}
      descriptionTooltip="Saved coverage periods, invoice dates, payment due dates, and percentage allocations for this version."
      action={
        <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
          <Label color={versionColor(version.status)}>
            v{version.versionNumber} · {version.status}
          </Label>
          {onHistory && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<Iconify icon={GlobalIcons.history} />}
              onClick={onHistory}
            >
              Version history
            </Button>
          )}
        </Stack>
      }
    >
      {showRules && (
        <Box sx={detailGridSx}>
          <DetailItem label="Invoice date rule" value={<InvoiceRule version={version} />} />
          <DetailItem
            label="Holiday shift"
            value={getHolidayShiftingMethodLabel(version.holidayShiftingMethod)}
          />
        </Box>
      )}
      <Typography variant="caption" color="text.secondary">
        {version.installments.length}{' '}
        {version.installments.length === 1 ? 'installment' : 'installments'} ·{' '}
        {fPercent(totalAllocation)} allocated
      </Typography>
      {version.installments.length ? (
        <CustomizableTable
          key={version.id}
          tableId={`payment-term-schedule-${version.id}`}
          tableTitle="Installment schedule"
          variant="embedded"
          showToolbar={false}
          isFilter={false}
          isShowedDense={false}
          isPagination={version.installments.length > 10}
          defaultRowsPerPage={10}
          data={version.installments}
          columns={[
            {
              isSort: false,
              isFilter: true,
              id: 'name',
              label: 'Installment',
              filterType: 'string' as const,
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
              isFilter: true,
              isSort: false,
              label: 'Start–end dates',
              filterType: 'string' as const,
              minWidth: 220,
              cellSx: { whiteSpace: 'nowrap' },
              render: (value, row) => `${formatDate(value)} – ${formatDate(row.coverageEndDate)}`,
            },
            {
              id: 'demandDate',
              isFilter: true,
              isSort: false,
              label: 'Invoice date',
              filterType: 'date' as const,
              minWidth: 120,
              cellSx: { whiteSpace: 'nowrap' },
              render: (value) => formatDate(value),
            },
            {
              id: 'dueDate',
              isFilter: true,
              isSort: false,
              label: 'Due date',
              filterType: 'date' as const,
              minWidth: 120,
              cellSx: { whiteSpace: 'nowrap' },
              render: (value) => formatDate(value),
            },
            {
              cellSx: { textAlign: 'right' as const },
              id: 'allocationPercentage',
              isFilter: true,
              isSort: false,
              label: 'Allocation',
              filterType: 'number' as const,
              minWidth: 90,
              align: 'right',
              render: (value) => fPercent(value),
            },
          ]}
          wrapperProps={{ sx: { minWidth: 0, boxShadow: 'none', borderRadius: 1 } }}
        />
      ) : (
        <Box>No installments are available for this version.</Box>
      )}
    </FormSectionCard>
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
    <FormSectionCard
      {...sectionCardProps}
      title={`Version ${version.versionNumber}`}
      actionFullWidthOnMobile
      icon={GlobalIcons.notebook}
      descriptionTooltip="This immutable snapshot records the saved schedule, effective dates, publication, and available audit information."
      action={
        <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
          {current && <Label>Current version</Label>}
          <Label color={versionColor(version.status)}>{version.status}</Label>
        </Stack>
      }
    >
      <Box sx={detailGridSx}>
        <DetailItem
          label="Effective period"
          value={`${formatDate(version.effectiveFrom)} – ${version.effectiveTo ? formatDate(version.effectiveTo) : 'No end date'}`}
        />
        <DetailItem label="Published on" value={formatDateTime(version.publishedAt)} />
        <DetailItem label="Invoice date rule" value={<InvoiceRule version={version} />} />
        <DetailItem
          label="Holiday shift"
          value={getHolidayShiftingMethodLabel(version.holidayShiftingMethod)}
        />
        {audit && (
          <>
            <DetailItem label="History action" value={formatAction(audit.changeAction)} />
            <DetailItem
              label="Created by"
              value={`${audit.createdByName || 'Unknown user'} · ${formatDateTime(audit.creationTime)}`}
            />
          </>
        )}
        {version.changeReason && (
          <DetailItem fullWidth label="Change reason" value={version.changeReason} />
        )}
      </Box>
    </FormSectionCard>
  );
}

export default function PaymentTermDetailsDrawer({
  open,
  paymentTermId,
  initialTab,
  onClose,
}: PaymentTermDetailsDrawerProps) {
  const [view, setView] = useState<PaymentTermDetailsTab>(initialTab);
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
    { skip: !open || !paymentTermId || view !== 'versions' }
  );
  useEffect(() => {
    if (open) {
      setView(initialTab);
      setSelectedVersionId(null);
    }
  }, [initialTab, open, paymentTermId]);
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
    () => versions.find((version) => version.id === selectedVersionId) ?? versions[0],
    [selectedVersionId, versions]
  );
  const headerVersion = view === 'versions' ? selectedVersion : displayedVersion;
  const selectedVersionAudit = versionHistory?.items.find(
    (item) =>
      item.id === selectedVersion?.id || item.versionNumber === selectedVersion?.versionNumber
  );

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        backdrop: { sx: { bgcolor: (theme) => alpha(theme.palette.common.black, 0.32) } },
      }}
      PaperProps={{
        role: 'dialog',
        'aria-modal': true,
        'aria-labelledby': 'payment-term-detail-title',
        sx: {
          width: { xs: '100%', sm: view === 'versions' ? 'min(960px, 96vw)' : 'min(760px, 92vw)' },
          maxWidth: '100%',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: 0,
          bgcolor: view === 'versions' ? 'background.neutral' : 'background.paper',
        }}
      >
        <FinancePolicyDrawerHeader
          title={
            view === 'versions' ? 'Payment Term Version History' : (data?.name ?? 'Payment Term')
          }
          titleId="payment-term-detail-title"
          helpText={
            view === 'versions'
              ? 'Select a saved schedule version to compare it with the previous version. Viewing history does not change the payment term.'
              : 'Review this payment term’s saved settings, status, and schedule. This view is read-only.'
          }
          badges={
            view === 'versions' ? (
              <Label>Read Only</Label>
            ) : (
              data && (
                <>
                  <Label
                    color={
                      data.status === 'Active'
                        ? 'success'
                        : data.status === 'Draft'
                          ? 'warning'
                          : 'default'
                    }
                  >
                    {data.status}
                  </Label>
                  {headerVersion && <Label>v{headerVersion.versionNumber}</Label>}
                </>
              )
            )
          }
          onClose={onClose}
        />
        {versionHistoryFetching && !isFetching && (
          <LinearProgress aria-label="Loading payment term version history" />
        )}
        {isFetching ? (
          <Scrollbar sx={{ flex: 1, minHeight: 0 }}>
            <Box sx={{ p: 2 }}>
              <FinancePolicySkeleton label="Loading payment term details" />
            </Box>
          </Scrollbar>
        ) : isError ? (
          <Box sx={{ p: 3, flex: 1 }}>
            <Alert
              severity="error"
              action={
                <Button size="small" color="inherit" onClick={() => refetch()}>
                  Retry
                </Button>
              }
            >
              Unable to load payment term details.
            </Alert>
          </Box>
        ) : data && view === 'versions' && selectedVersion ? (
          <PaymentTermVersionHistory
            key={paymentTermId}
            versions={versions}
            audits={versionHistory?.items}
            selectedVersionId={selectedVersion.id}
            onSelect={setSelectedVersionId}
            auditError={versionHistoryError}
            onRetry={() => refetchVersionHistory()}
          >
            <VersionSnapshot
              version={selectedVersion}
              audit={selectedVersionAudit}
              current={selectedVersion.id === data.currentVersionId}
            />
            <InstallmentSchedule version={selectedVersion} showRules={false} />
          </PaymentTermVersionHistory>
        ) : (
          <Scrollbar sx={{ flex: 1, minHeight: 0 }}>
            <Stack spacing={1} sx={{ p: 2, minWidth: 0 }}>
              {data && view === 'details' ? (
                <>
                  <DetailSection
                    title="General Information"
                    icon={GlobalIcons.notebook}
                    helpText="Payment-term identity, academic board and year, default selection, description, and references."
                  >
                    <DetailGrid>
                      <DetailItem label="Payment term name" value={data.name} />
                      <DetailItem label="Payment term code" value={data.code} />
                      <DetailItem label="Academic year" value={data.academicYearName ?? '—'} />
                      <DetailItem label="Board" value={data.boardName ?? '—'} />
                      <DetailItem
                        label="Default selection"
                        value={
                          <Label color={data.isDefault ? 'primary' : 'default'}>
                            {data.isDefault ? 'Default payment term' : 'Standard payment term'}
                          </Label>
                        }
                      />
                      <DetailItem label="Versions" value={data.versionCount} />
                      <DetailItem label="Installments" value={data.totalInstallments} />
                      <DetailItem
                        label="Referenced structures"
                        value={data.isUsedInFeeStructures ? 'In use' : 'Not referenced'}
                      />
                      <DetailItem
                        label="Description"
                        value={data.description || 'No description provided.'}
                      />
                    </DetailGrid>
                  </DetailSection>
                  {displayedVersion ? (
                    <InstallmentSchedule
                      version={displayedVersion}
                      onHistory={() => setView('versions')}
                    />
                  ) : (
                    <FormSectionCard
                      {...sectionCardProps}
                      title="Installment Schedule"
                      actionFullWidthOnMobile
                      icon={GlobalIcons.calendar}
                      descriptionTooltip="Saved installment coverage periods, invoice dates, payment due dates, and allocations."
                      action={
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Iconify icon={GlobalIcons.history} />}
                          onClick={() => setView('versions')}
                        >
                          Version history
                        </Button>
                      }
                    >
                      <Typography variant="body2" color="text.secondary">
                        No installment schedule is available.
                      </Typography>
                    </FormSectionCard>
                  )}
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {view === 'versions'
                    ? 'No payment-term versions are available.'
                    : 'No payment term details are available.'}
                </Typography>
              )}
            </Stack>
          </Scrollbar>
        )}
        <Box
          sx={{
            px: 2,
            py: 1.5,
            bgcolor: 'background.paper',
            borderTop: 1,
            borderColor: 'divider',
            display: 'flex',
            justifyContent: view === 'versions' ? 'space-between' : 'flex-end',
            flexShrink: 0,
          }}
        >
          {view === 'versions' && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<Iconify icon={GlobalIcons.retrunIcon} />}
              onClick={() => setView('details')}
            >
              Back to details
            </Button>
          )}
          <Button
            size="small"
            variant="outlined"
            onClick={onClose}
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
          >
            Close
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}
