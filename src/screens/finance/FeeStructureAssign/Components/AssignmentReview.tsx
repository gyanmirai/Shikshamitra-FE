import type { AssignmentPreview } from 'src/redux/finance/studentFeeAssignment';

import { useState } from 'react';
import { Label } from 'src/components/label';
import { fDate } from 'src/utils/format-time';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { formatNumber } from 'src/utils/formate_number';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Link, Stack, Typography } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { DetailField, DetailSection } from 'src/components/detail-view';

import { selectableAssignmentPolicyFamilies } from 'src/redux/finance/studentFeeAssignment';

import { groupAssignmentInstallments } from './assignmentReviewPresentation';
import { InfoTooltipIcon } from 'src/screens/hr/policies/components/HRPolicySharedUI';

// Embedded evidence tables: the drawer body owns vertical scrolling, while each
// shared table contains horizontal overflow at narrow widths.
const embeddedTableProps = {
  showToolbar: false,
  isPagination: false,
  isSearch: false,
  isFilter: false,
  isShowedDense: false,
  wrapperProps: { sx: { flex: 'none', minWidth: 0 } },
  tableContainerProps: { sx: { height: 'auto', flex: 'none' } },
} as const;

export default function AssignmentReview({
  data,
  committed = false,
}: {
  data: AssignmentPreview;
  committed?: boolean;
}) {
  const [showInstallments, setShowInstallments] = useState(false);
  const installments = groupAssignmentInstallments(data.lines);
  const legacy = data.calculationVersion === 'LegacyUnknown';
  const tableId = `assignment-${data.studentId}-${data.structureId}-${committed ? 'saved' : 'preview'}`;
  const money = (value: number) => formatNumber(value, data.currency);
  const summary = (
    <DetailSection
      helpText="Totals are calculated by the server. Service reduction is the difference between the full scheduled amount and the amount assigned for the selected service dates."
      icon="mdi:cash-multiple"
      title="Assignment total"
    >
      <DetailField
        label="Fee Structure"
        value={`${data.structureName} · ${data.revisionNumber ? `r${data.revisionNumber}` : 'Historical'}`}
      />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(3, minmax(0, 1fr))' },
          gap: 1.5,
          bgcolor: 'background.neutral',
          p: 1.5,
          borderRadius: 1,
          '& .MuiTypography-root': { fontVariantNumeric: 'tabular-nums' },
        }}
      >
        {[
          { label: committed ? 'Assigned amount' : 'Total to assign', value: data.proratedTotal },
          ...(!legacy
            ? [
                { label: 'Before service adjustment', value: data.scheduledTotal },
                { label: 'Service reduction', value: data.reductionTotal },
              ]
            : []),
        ].map((metric) => (
          <DetailField key={metric.label} label={metric.label} value={money(metric.value)} />
        ))}
      </Box>

      {data.overrideReason && (
        <DetailField label="Amount override reason" value={data.overrideReason} />
      )}
      {data.policyOverrideReason && (
        <DetailField label="Policy override reason" value={data.policyOverrideReason} />
      )}
    </DetailSection>
  );
  return (
    <Box sx={{ minWidth: 0, containerType: 'inline-size' }}>
      <Stack spacing={1.5}>
        <Box
          sx={{
            display: 'grid',
            gap: 1.5,
            gridTemplateColumns: 'minmax(0, 1fr)',
            gridTemplateAreas: '"summary" "details"',
            alignItems: 'start',
          }}
        >
          <Box sx={{ gridArea: 'summary', minWidth: 0, alignSelf: 'start' }}>{summary}</Box>
          <Stack spacing={1.5} sx={{ gridArea: 'details', minWidth: 0 }}>
            <DetailSection icon="mdi:format-list-bulleted" title="Fee breakdown">
              <CustomizableTable
                {...embeddedTableProps}
                tableId={`${tableId}-heads`}
                tableTitle="Assignment fee-head breakdown"
                data={data.heads.map((head) => ({ ...head, _id: head.feeHeadId }))}
                noDataText="No fee heads recorded for this assignment."
                columns={[
                  {
                    id: 'feeHeadName',
                    label: 'Fee Head',
                    filterType: 'string' as const,
                    minWidth: 180,
                    width: '40%',
                    isSort: false,
                    isFilter: true,
                    render: (_value, head) => (
                      <Stack spacing={0.5}>
                        <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
                          {head.feeHeadName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {head.isOptional ? 'Optional' : 'Required'}
                          {!head.included && <Label>Not selected</Label>}
                        </Typography>
                        {head.included && head.zeroAmountReason && (
                          <Typography variant="caption" color="text.secondary">
                            Zero amount: {head.zeroAmountReason}
                          </Typography>
                        )}
                      </Stack>
                    ),
                  },
                  {
                    id: 'paymentTermName',
                    label: 'Payment Term',
                    filterType: 'string' as const,
                    minWidth: 180,
                    isSort: false,
                    isFilter: true,
                    render: (_value, head) =>
                      head.included ? (
                        <Stack spacing={0.5}>
                          {head.paymentTermName && (
                            <Typography variant="body2">
                              {head.paymentTermName} · v{head.paymentTermVersionNumber ?? '—'}
                            </Typography>
                          )}
                          {head.servicePeriod?.reason && (
                            <Typography variant="caption" color="text.secondary">
                              {head.servicePeriod.reason}
                            </Typography>
                          )}
                        </Stack>
                      ) : (
                        '—'
                      ),
                  },
                  {
                    id: 'obligation',
                    label: legacy ? 'Recorded Amount' : 'Assigned Amount',
                    filterType: 'number' as const,
                    minWidth: 130,
                    align: 'left',
                    cellSx: { textAlign: 'right', fontVariantNumeric: 'tabular-nums' },
                    isSort: false,
                    isFilter: true,
                    render: (value, head) => (
                      <Stack spacing={0.5}>
                        <Typography variant="subtitle2" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                          {money(value)}
                        </Typography>
                        {!head.included && (
                          <Typography variant="caption" color="text.secondary">
                            Not assigned
                          </Typography>
                        )}
                      </Stack>
                    ),
                  },
                ]}
              />
            </DetailSection>

            <DetailSection
              icon="mdi:calendar-clock-outline"
              title="Installment schedule"
              action={
                <Link
                  component="button"
                  type="button"
                  variant="body2"
                  underline="hover"
                  color="text.primary"
                  disabled={!data.lines.length}
                  onClick={() => setShowInstallments(true)}
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.75,
                    fontWeight: 600,
                    p: 0,
                    bgcolor: 'transparent',
                    border: 0,
                    '&:focus-visible': {
                      outline: '2px solid',
                      outlineColor: 'primary.main',
                      outlineOffset: 4,
                      borderRadius: 0.5,
                    },
                    '&:disabled': { color: 'text.disabled', cursor: 'default' },
                  }}
                >
                  <Iconify icon={GlobalIcons.eye} width={18} aria-hidden />
                  View all
                </Link>
              }
            >
              <CustomizableTable
                {...embeddedTableProps}
                tableId={`${tableId}-schedule-ledger`}
                tableTitle="Assignment installment schedule"
                data={installments.map((item) => ({ ...item, _id: item.id }))}
                noDataText="No installments recorded for this assignment."
                columns={[
                  {
                    id: 'label',
                    label: 'Installment',
                    filterType: 'string' as const,
                    minWidth: 145,
                    isSort: false,
                    isFilter: true,
                    render: (value, row) => {
                      const headCount = new Set(
                        row.lines.map((line: { feeHeadId: string }) => line.feeHeadId)
                      ).size;
                      return (
                        <Stack spacing={0.5}>
                          <Typography variant="body2">{value}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {headCount} {headCount === 1 ? 'fee head' : 'fee heads'}
                          </Typography>
                        </Stack>
                      );
                    },
                  },
                  {
                    id: 'demandDate',
                    label: 'Demand date',
                    filterType: 'date' as const,
                    renderColumn: () => (
                      <InfoTooltipIcon
                        label="About demand dates"
                        title="The date this installment becomes available for collection."
                      />
                    ),
                    minWidth: 110,
                    isSort: false,
                    isFilter: true,
                    render: (value) => (value ? fDate(value) : '—'),
                  },
                  {
                    id: 'dueDate',
                    label: 'Due date',
                    filterType: 'date' as const,
                    renderColumn: () => (
                      <InfoTooltipIcon
                        label="About due dates"
                        title="The payment deadline for this installment. Assignment preserves the configured date."
                      />
                    ),
                    minWidth: 110,
                    isSort: false,
                    isFilter: true,
                    render: (value) => (value ? fDate(value) : '—'),
                  },
                  {
                    id: 'obligation',
                    label: 'Assigned Amount',
                    filterType: 'number' as const,
                    minWidth: 110,
                    align: 'left',
                    cellSx: { textAlign: 'right', fontVariantNumeric: 'tabular-nums' },
                    isSort: false,
                    isFilter: true,
                    render: (value) => money(value),
                  },
                  ...(committed
                    ? [
                        {
                          id: 'paid',
                          label: 'Paid',
                          filterType: 'number' as const,
                          minWidth: 100,
                          align: 'left' as const,
                          cellSx: {
                            textAlign: 'right' as const,
                            fontVariantNumeric: 'tabular-nums',
                          },
                          isSort: false,
                          isFilter: true,
                          render: (value: number) => money(value),
                        },
                        {
                          id: 'outstanding',
                          label: 'Outstanding',
                          filterType: 'number' as const,
                          minWidth: 110,
                          align: 'left' as const,
                          cellSx: {
                            textAlign: 'right' as const,
                            fontVariantNumeric: 'tabular-nums',
                          },
                          isSort: false,
                          isFilter: true,
                          render: (value: number) => money(value),
                        },
                      ]
                    : []),
                ]}
              />
            </DetailSection>

            <DetailSection icon="mdi:shield-check-outline" title="Applicable policies">
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))' },
                  gap: 1.5,
                }}
              >
                {selectableAssignmentPolicyFamilies.map((family) => {
                  const policy = data.policies.find((p) => p.family === family);
                  return (
                    <DetailField
                      key={family}
                      label={`${family} policy`}
                      value={policy ? `${policy.name} · v${policy.version}` : 'No policy assigned'}
                    />
                  );
                })}
                {committed &&
                  data.originalPolicies &&
                  data.originalPolicies.some(
                    (original) =>
                      selectableAssignmentPolicyFamilies.some(
                        (family) => family === original.family
                      ) &&
                      !data.policies.some((current) => current.versionId === original.versionId)
                  ) && (
                    <DetailField
                      fullWidth
                      label="Policies when assigned"
                      value={data.originalPolicies
                        .filter((policy) =>
                          selectableAssignmentPolicyFamilies.some(
                            (family) => family === policy.family
                          )
                        )
                        .map((policy) => `${policy.family}: ${policy.name} · v${policy.version}`)
                        .join('; ')}
                    />
                  )}
              </Box>
            </DetailSection>
          </Stack>
        </Box>
      </Stack>
      {showInstallments && (
        <CustomDialog
          open
          title="Installment details"
          maxWidth={committed ? 'lg' : 'md'}
          hasForm={false}
          guardUnsavedChanges={false}
          handleClose={() => setShowInstallments(false)}
        >
          <DialogScrollContent>
            <CustomizableTable
              {...embeddedTableProps}
              tableContainerProps={{
                sx: {
                  height: 'auto',
                  maxHeight: '65vh',
                  overflow: 'auto',
                  flex: 'none',
                  '& .MuiTableCell-head': {
                    position: 'sticky',
                    top: 0,
                    zIndex: 2,
                    bgcolor: 'background.paper',
                    whiteSpace: 'nowrap',
                  },
                  '& .MuiTableCell-root': { py: 1, px: 1.5 },
                },
              }}
              tableId={`${tableId}-installments`}
              tableTitle={
                committed ? 'Assigned fee installments and balances' : 'Preview fee installments'
              }
              data={data.lines.map((line, i) => ({
                ...line,
                _id: line.dueFeeId ?? `${line.feeHeadId}-${line.sequence}-${i}`,
              }))}
              noDataText="No installments recorded for this assignment."
              columns={[
                {
                  id: 'feeHeadName',
                  label: 'Fee head / installment',
                  filterType: 'string' as const,
                  minWidth: 220,
                  width: '35%',
                  isSort: false,
                  isFilter: true,
                  render: (_value, line) => (
                    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        sx={{ minWidth: 0, flex: 1, overflowWrap: 'anywhere' }}
                      >
                        {line.feeHeadName} · {line.installmentLabel}
                      </Typography>
                      {line.explanation && (
                        <InfoTooltipIcon
                          label={`${line.feeHeadName} ${line.installmentLabel} calculation details`}
                          title={line.explanation}
                        />
                      )}
                    </Stack>
                  ),
                },
                {
                  id: 'allocationPercentage',
                  label: 'Share',
                  filterType: 'number' as const,
                  renderColumn: () => (
                    <InfoTooltipIcon
                      label="About installment shares"
                      title="The percentage of this fee allocated to the installment by its saved payment term. Service-date adjustments do not change this share."
                    />
                  ),
                  minWidth: 80,
                  align: 'left',
                  cellSx: { textAlign: 'right', fontVariantNumeric: 'tabular-nums' },
                  isSort: false,
                  isFilter: true,
                  render: (value) => (legacy ? 'Unknown' : `${value}%`),
                },
                {
                  id: 'demandDate',
                  label: 'Demand date',
                  filterType: 'date' as const,
                  renderColumn: () => (
                    <InfoTooltipIcon
                      label="About installment demand dates"
                      title="The date this installment becomes available for collection."
                    />
                  ),
                  minWidth: 125,
                  isSort: false,
                  isFilter: true,
                  render: (value) => (value ? fDate(value) : '—'),
                },
                {
                  id: 'dueDate',
                  label: 'Due date',
                  filterType: 'date' as const,
                  renderColumn: () => (
                    <InfoTooltipIcon
                      label="About installment due dates"
                      title="The payment deadline for this installment. Assignment preserves the configured date."
                    />
                  ),
                  minWidth: 125,
                  isSort: false,
                  isFilter: true,
                  render: (value) => fDate(value),
                },
                {
                  id: 'proratedAmount',
                  label: 'Obligation',
                  filterType: 'number' as const,
                  renderColumn: () => (
                    <InfoTooltipIcon
                      label="About installment obligations"
                      title="The amount assigned to this installment after applicable service-date adjustments. This is not the outstanding balance after payments."
                    />
                  ),
                  minWidth: 125,
                  align: 'left',
                  cellSx: { textAlign: 'right', fontVariantNumeric: 'tabular-nums' },
                  isSort: false,
                  isFilter: true,
                  render: (value) => money(value),
                },
                ...(committed
                  ? [
                      {
                        id: 'paidAmount',
                        label: 'Paid',
                        filterType: 'number' as const,
                        minWidth: 120,
                        align: 'left' as const,
                        cellSx: { textAlign: 'right' as const, fontVariantNumeric: 'tabular-nums' },
                        isSort: false,
                        isFilter: true,
                        render: (value: number) => money(value),
                      },
                      {
                        id: 'outstandingAmount',
                        label: 'Outstanding',
                        filterType: 'number' as const,
                        minWidth: 140,
                        align: 'left' as const,
                        cellSx: { textAlign: 'right' as const, fontVariantNumeric: 'tabular-nums' },
                        isSort: false,
                        isFilter: true,
                        render: (value: number) => money(value),
                      },
                    ]
                  : []),
              ]}
            />
          </DialogScrollContent>
        </CustomDialog>
      )}
    </Box>
  );
}
