import type { IData } from 'src/components/customizabaleTable/types';
import type { AssignmentPreview } from 'src/redux/finance/studentFeeAssignment';

import { Label } from 'src/components/label';
import { fDate } from 'src/utils/format-time';
import { Iconify } from 'src/components/iconify';
import CustomizableTable from 'src/components/customizabaleTable';
import { FormSectionHeader } from 'src/components/form-section-card';
import { selectableAssignmentPolicyFamilies } from 'src/redux/finance/studentFeeAssignment';
import {
  Box,
  Stack,
  Alert,
  Accordion,
  Typography,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import { formatAssignmentMoney } from './assignmentMoney';

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
  const legacy = data.calculationVersion === 'LegacyUnknown';
  const tableId = `assignment-${data.studentId}-${data.structureId}-${committed ? 'saved' : 'preview'}`;
  const money = (value: number) => formatAssignmentMoney(value, data.currency);
  return (
    <Stack spacing={2.5} sx={{ minWidth: 0 }}>
      <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
        {data.structureName} · revision {data.revisionNumber || 'historical'}
      </Typography>

      <Box
        component="dl"
        sx={{
          m: 0,
          p: 2,
          borderRadius: 1,
          bgcolor: 'background.neutral',
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(3, minmax(0, 1fr))' },
          gap: 2,
        }}
      >
        {[
          { label: 'Total obligation', value: data.proratedTotal },
          ...(!legacy
            ? [
                { label: 'Configured schedule', value: data.scheduledTotal },
                { label: 'Service reduction', value: data.reductionTotal },
              ]
            : []),
        ].map((metric, index) => (
          <Box key={metric.label}>
            <Typography component="dt" variant="caption" color="text.secondary">
              {metric.label}
            </Typography>
            <Typography
              component="dd"
              variant={index === 0 ? 'h6' : 'subtitle1'}
              sx={{ m: 0, fontVariantNumeric: 'tabular-nums' }}
            >
              {money(metric.value)}
            </Typography>
          </Box>
        ))}
      </Box>
      {data.overrideReason && <Alert severity="info">Amount override: {data.overrideReason}</Alert>}
      {data.policyOverrideReason && (
        <Alert severity="info">Policy override: {data.policyOverrideReason}</Alert>
      )}
      {data.warnings.map((warning) => (
        <Alert key={warning} severity="warning">
          {warning}
        </Alert>
      ))}

      <Stack spacing={1} sx={{ minWidth: 0 }}>
        <FormSectionHeader icon="mdi:format-list-bulleted" title="Fee-head breakdown" />
        <CustomizableTable
          {...embeddedTableProps}
          tableId={`${tableId}-heads`}
          tableTitle="Assignment fee-head breakdown"
          data={data.heads.map((head) => ({ ...head, _id: head.feeHeadId }))}
          noDataText="No fee heads recorded for this assignment."
          columns={[
            {
              id: 'feeHeadName',
              label: 'Fee head',
              minWidth: 180,
              width: '25%',
              isSort: false,
              isFilter: false,
              render: (_value, head) => (
                <Stack spacing={0.5}>
                  <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
                    {head.feeHeadName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {head.isOptional ? 'Optional' : 'Mandatory'}
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
              id: 'servicePeriod',
              label: 'Service / payment term',
              minWidth: 220,
              isSort: false,
              isFilter: false,
              render: (_value, head) =>
                head.included ? (
                  <Stack spacing={0.5}>
                    {head.servicePeriod && (
                      <Typography variant="body2">
                        {head.servicePeriod.startDate ? fDate(head.servicePeriod.startDate) : '—'} –{' '}
                        {head.servicePeriod.endDate ? fDate(head.servicePeriod.endDate) : '—'}
                      </Typography>
                    )}
                    {head.paymentTermName && (
                      <Typography variant="body2">
                        {head.paymentTermName} · v{head.paymentTermVersionNumber ?? '—'}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary">
                      {head.verification}
                      {head.servicePeriod?.reason ? ` · ${head.servicePeriod.reason}` : ''}
                    </Typography>
                  </Stack>
                ) : (
                  '—'
                ),
            },
            ...(!legacy
              ? [
                  {
                    id: 'effectiveAmount',
                    label: 'Coverage amount',
                    minWidth: 160,
                    align: 'right' as const,
                    isSort: false,
                    isFilter: false,
                    render: (_value: unknown, head: IData) =>
                      head.included ? (
                        <Stack spacing={0.5}>
                          <Typography variant="body2" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                            {money(
                              head.isVariable
                                ? (head.effectiveAmount ?? 0)
                                : (head.configuredAmount ?? 0)
                            )}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {head.isVariable ? 'Student amount' : 'Configured'} ·{' '}
                            {head.amountBasis === 'OneTime' ? 'One-time' : 'Term total'}
                          </Typography>
                          {!head.isVariable && head.effectiveAmount !== head.configuredAmount && (
                            <Typography variant="caption">
                              Authorized service total {money(head.effectiveAmount ?? 0)}
                            </Typography>
                          )}
                        </Stack>
                      ) : (
                        '—'
                      ),
                  },
                ]
              : []),
            {
              id: 'obligation',
              label: legacy ? 'Recorded obligation' : 'Obligation',
              minWidth: 130,
              align: 'right',
              isSort: false,
              isFilter: false,
              render: (value, head) => (
                <Stack spacing={0.5}>
                  <Typography variant="subtitle2" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    {money(value)}
                  </Typography>
                  {!head.included && (
                    <Typography variant="caption" color="text.secondary">
                      No obligation
                    </Typography>
                  )}
                </Stack>
              ),
            },
            {
              id: 'included',
              label: 'Selection',
              minWidth: 120,
              sticky: true,
              stickyPosition: 'right',
              isSort: false,
              isFilter: false,
              render: (value) => <Label>{value ? 'Included' : 'Not selected'}</Label>,
            },
          ]}
        />
      </Stack>

      <Stack spacing={1} sx={{ minWidth: 0 }}>
        <FormSectionHeader icon="mdi:calendar-month-outline" title="Installment schedule" />
        <CustomizableTable
          {...embeddedTableProps}
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
              minWidth: 220,
              width: '35%',
              isSort: false,
              isFilter: false,
              render: (_value, line) => (
                <Stack spacing={0.5}>
                  <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                    {line.feeHeadName} · {line.installmentLabel}
                  </Typography>
                  {line.explanation && (
                    <Typography variant="caption" color="text.secondary">
                      {line.explanation}
                    </Typography>
                  )}
                </Stack>
              ),
            },
            {
              id: 'allocationPercentage',
              label: 'Share',
              minWidth: 80,
              align: 'right',
              isSort: false,
              isFilter: false,
              render: (value) => (legacy ? 'Unknown' : `${value}%`),
            },
            {
              id: 'demandDate',
              label: 'Demand date',
              minWidth: 125,
              isSort: false,
              isFilter: false,
              render: (value) => (value ? fDate(value) : '—'),
            },
            {
              id: 'dueDate',
              label: 'Due date',
              minWidth: 125,
              isSort: false,
              isFilter: false,
              render: (value) => fDate(value),
            },
            {
              id: 'proratedAmount',
              label: 'Obligation',
              minWidth: 125,
              align: 'right',
              isSort: false,
              isFilter: false,
              render: (value) => money(value),
              cellSx: { fontVariantNumeric: 'tabular-nums' },
            },
            ...(committed
              ? [
                  {
                    id: 'paidAmount',
                    label: 'Paid',
                    minWidth: 120,
                    align: 'right' as const,
                    isSort: false,
                    isFilter: false,
                    render: (value: number) => money(value),
                  },
                  {
                    id: 'outstandingAmount',
                    label: 'Outstanding',
                    minWidth: 140,
                    align: 'right' as const,
                    isSort: false,
                    isFilter: false,
                    render: (value: number) => money(value),
                  },
                ]
              : []),
          ]}
        />
      </Stack>

      <Accordion
        disableGutters
        elevation={0}
        sx={{ border: 1, borderColor: 'divider', '&::before': { display: 'none' } }}
      >
        <AccordionSummary expandIcon={<Iconify icon="mdi:chevron-down" />}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2">Applicable policies</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
              {selectableAssignmentPolicyFamilies
                .map((family) => {
                  const policy = data.policies.find((item) => item.family === family);
                  return `${family.charAt(0).toUpperCase()}${family.slice(1)}: ${policy ? `${policy.name} · v${policy.version}` : 'None'}`;
                })
                .join(' · ')}
            </Typography>
          </Box>
        </AccordionSummary>

        <AccordionDetails>
          <Stack spacing={2}>
            {selectableAssignmentPolicyFamilies.map((family) => {
              const policy = data.policies.find((p) => p.family === family);
              return (
                <Box key={family}>
                  <Typography variant="subtitle2" sx={{ textTransform: 'capitalize' }}>
                    {family} policy:{' '}
                    {policy ? `${policy.name} · v${policy.version}` : 'No policy assigned'}
                  </Typography>
                  {policy && (
                    <Typography variant="caption" color="text.secondary">
                      {policy.source === 'StudentOverride'
                        ? 'Student override'
                        : 'Fee structure default'}
                      {policy.description ? ` · ${policy.description}` : ''}
                    </Typography>
                  )}
                  {policy &&
                    data.heads
                      .filter((h) => h.included && policy.headTreatment?.[h.feeHeadId])
                      .map((h) => (
                        <Typography key={h.feeHeadId} variant="body2">
                          {h.feeHeadName}: {policy.headTreatment[h.feeHeadId]}
                        </Typography>
                      ))}
                </Box>
              );
            })}
            {committed &&
              data.originalPolicies &&
              data.originalPolicies.some(
                (original) =>
                  selectableAssignmentPolicyFamilies.some((family) => family === original.family) &&
                  !data.policies.some((current) => current.versionId === original.versionId)
              ) && (
                <Typography variant="body2" color="text.secondary">
                  Policies recorded when assigned:{' '}
                  {data.originalPolicies
                    .filter((policy) =>
                      selectableAssignmentPolicyFamilies.some((family) => family === policy.family)
                    )
                    .map((p) => `${p.family}: ${p.name} · v${p.version}`)
                    .join('; ')}
                  . Existing charges retain this calculation evidence.
                </Typography>
              )}
            <Typography variant="caption" color="text.secondary">
              Collection and refund events are evaluated separately. Assignment does not assess a
              penalty or create a refund.
            </Typography>
          </Stack>
        </AccordionDetails>
      </Accordion>
    </Stack>
  );
}
