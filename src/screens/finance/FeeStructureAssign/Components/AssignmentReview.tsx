import type { AssignmentPreview } from 'src/redux/finance/studentFeeAssignment';

import { useState } from 'react';
import { Label } from 'src/components/label';
import { fDate } from 'src/utils/format-time';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { formatNumber } from 'src/utils/formate_number';
import CustomTooltip from 'src/components/custom-tooltip';
import CustomizableTable from 'src/components/customizabaleTable';
import { FormSectionCard } from 'src/components/form-section-card';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Box, Stack, Alert, Button, IconButton, Typography } from '@mui/material';
import { selectableAssignmentPolicyFamilies } from 'src/redux/finance/studentFeeAssignment';

import { groupAssignmentInstallments } from './assignmentReviewPresentation';

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
  onEdit,
}: {
  data: AssignmentPreview;
  committed?: boolean;
  onEdit?: (step: number) => void;
}) {
  const [showInstallments, setShowInstallments] = useState(false);
  const installments = groupAssignmentInstallments(data.lines);
  const legacy = data.calculationVersion === 'LegacyUnknown';
  const tableId = `assignment-${data.studentId}-${data.structureId}-${committed ? 'saved' : 'preview'}`;
  const money = (value: number) => formatNumber(value, data.currency);
  const summary = (
    <FormSectionCard
      icon="mdi:cash-multiple"
      title="Assignment total"
      contentSpacing={1.5}
      descriptionTooltip="Recorded assignment amounts before and after service adjustment. Prices and obligations are calculated by the server."
    >
      <Box
        component="dl"
        sx={{
          m: 0,
          p: 0,
          borderRadius: 1,

          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr)',
          gap: 2,
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
        ].map((metric, index) => (
          <Box key={metric.label}>
            <Typography component="dt" variant="caption" color="text.secondary">
              {metric.label}
            </Typography>
            <Typography
              component="dd"
              variant={index === 0 ? 'h4' : 'subtitle2'}
              sx={{ m: 0, fontVariantNumeric: 'tabular-nums' }}
            >
              {money(metric.value)}
            </Typography>
          </Box>
        ))}
      </Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
        <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
          {data.structureName} · {data.revisionNumber ? `r${data.revisionNumber}` : 'Historical'}
        </Typography>
        {onEdit && (
          <Button
            size="small"
            startIcon={<Iconify icon={GlobalIcons.edit} />}
            onClick={() => onEdit(0)}
            aria-label="Edit fee structure"
          >
            Edit
          </Button>
        )}
      </Stack>

      {(data.overrideReason || data.policyOverrideReason) && (
        <CustomTooltip
          title={
            <Stack spacing={0.5}>
              {data.overrideReason && (
                <Typography variant="caption">Amount override: {data.overrideReason}</Typography>
              )}
              {data.policyOverrideReason && (
                <Typography variant="caption">
                  Policy override: {data.policyOverrideReason}
                </Typography>
              )}
            </Stack>
          }
          arrow
          placement="right"
        >
          <IconButton
            size="small"
            color="info"
            aria-label="Assignment override reasons"
            sx={{ alignSelf: 'flex-start' }}
          >
            <Iconify icon="mdi:information-outline" width={18} />
          </IconButton>
        </CustomTooltip>
      )}
    </FormSectionCard>
  );
  return (
    <Box sx={{ minWidth: 0, containerType: 'inline-size' }}>
      <Stack spacing={1.5}>
        {data.warnings.map((warning) => (
          <Alert
            key={warning}
            severity="warning"
            action={
              /due dates.*past/i.test(warning) ? (
                <CustomTooltip title={warning} arrow placement="right">
                  <IconButton size="small" color="inherit" aria-label="Past due dates information">
                    <Iconify icon="mdi:information-outline" width={18} />
                  </IconButton>
                </CustomTooltip>
              ) : undefined
            }
          >
            {/due dates.*past/i.test(warning) ? 'Some due dates are in the past.' : warning}
          </Alert>
        ))}

        <Box
          sx={{
            display: 'grid',
            gap: 1.5,
            gridTemplateColumns: 'minmax(0, 1fr)',
            gridTemplateAreas: '"summary" "details"',
            alignItems: 'start',
            '@container (min-width: 740px)': {
              gridTemplateColumns: 'minmax(0, 1fr) 250px',
              gridTemplateAreas: '"details summary"',
            },
          }}
        >
          <Box sx={{ gridArea: 'summary', minWidth: 0, alignSelf: 'start' }}>{summary}</Box>
          <Stack spacing={1.5} sx={{ gridArea: 'details', minWidth: 0 }}>
            <FormSectionCard
              icon="mdi:format-list-bulleted"
              title="Fee breakdown"
              contentSpacing={1}
              descriptionTooltip="Review included fees and obligations. Each row's info icon contains its service verification and amount evidence."
              action={
                onEdit && (
                  <Button
                    size="small"
                    startIcon={<Iconify icon={GlobalIcons.edit} />}
                    aria-label="Edit fees and dates"
                    onClick={() => onEdit(1)}
                  >
                    Edit
                  </Button>
                )
              }
            >
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
                    id: 'servicePeriod',
                    label: 'Service / payment term',
                    minWidth: 180,
                    isSort: false,
                    isFilter: false,
                    render: (_value, head) =>
                      head.included ? (
                        <Stack spacing={0.5}>
                          {head.servicePeriod && (
                            <Typography variant="body2">
                              {head.servicePeriod.startDate
                                ? fDate(head.servicePeriod.startDate)
                                : '—'}{' '}
                              –{' '}
                              {head.servicePeriod.endDate ? fDate(head.servicePeriod.endDate) : '—'}
                            </Typography>
                          )}
                          {head.paymentTermName && (
                            <Typography variant="body2">
                              {head.paymentTermName} · v{head.paymentTermVersionNumber ?? '—'}
                            </Typography>
                          )}
                          <CustomTooltip
                            title={
                              <Stack spacing={0.5}>
                                {head.verification && (
                                  <Typography variant="caption">{head.verification}</Typography>
                                )}
                                {head.servicePeriod?.reason && (
                                  <Typography variant="caption">
                                    Service override: {head.servicePeriod.reason}
                                  </Typography>
                                )}
                                {!legacy && (
                                  <Typography variant="caption">
                                    {head.isVariable ? 'Student amount' : 'Configured amount'}:{' '}
                                    {(head.isVariable
                                      ? head.effectiveAmount
                                      : head.configuredAmount) == null
                                      ? '—'
                                      : money(
                                          head.isVariable
                                            ? head.effectiveAmount
                                            : head.configuredAmount
                                        )}{' '}
                                    · {head.amountBasis === 'OneTime' ? 'One-time' : 'Term total'}
                                  </Typography>
                                )}
                                {!legacy &&
                                  !head.isVariable &&
                                  head.effectiveAmount !== head.configuredAmount && (
                                    <Typography variant="caption">
                                      Authorized service total:{' '}
                                      {head.effectiveAmount == null
                                        ? '—'
                                        : money(head.effectiveAmount)}
                                    </Typography>
                                  )}
                              </Stack>
                            }
                            arrow
                            placement="right"
                          >
                            <IconButton
                              size="small"
                              color="info"
                              aria-label={`${head.feeHeadName} service details`}
                              sx={{ alignSelf: 'flex-start' }}
                            >
                              <Iconify icon="mdi:information-outline" width={16} />
                            </IconButton>
                          </CustomTooltip>
                        </Stack>
                      ) : (
                        '—'
                      ),
                  },
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
                ]}
              />
            </FormSectionCard>

            <FormSectionCard
              icon="mdi:calendar-clock-outline"
              title="Installment schedule"
              contentSpacing={1}
              descriptionTooltip="Terms with the same sequence and dates are grouped. View all to inspect the original fee-head shares and amounts."
              action={
                <Button
                  size="small"
                  disabled={!data.lines.length}
                  startIcon={<Iconify icon={GlobalIcons.eye} />}
                  onClick={() => setShowInstallments(true)}
                >
                  View all
                </Button>
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
                    minWidth: 145,
                    isSort: false,
                    isFilter: false,
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
                    minWidth: 110,
                    isSort: false,
                    isFilter: false,
                    render: (value) => (value ? fDate(value) : '—'),
                  },
                  {
                    id: 'dueDate',
                    label: 'Due date',
                    minWidth: 110,
                    isSort: false,
                    isFilter: false,
                    render: (value) => (value ? fDate(value) : '—'),
                  },
                  {
                    id: 'obligation',
                    label: 'Obligation',
                    minWidth: 110,
                    align: 'right',
                    isSort: false,
                    isFilter: false,
                    render: (value) => money(value),
                  },
                  ...(committed
                    ? [
                        {
                          id: 'paid',
                          label: 'Paid',
                          minWidth: 100,
                          align: 'right' as const,
                          isSort: false,
                          isFilter: false,
                          render: (value: number) => money(value),
                        },
                        {
                          id: 'outstanding',
                          label: 'Outstanding',
                          minWidth: 110,
                          align: 'right' as const,
                          isSort: false,
                          isFilter: false,
                          render: (value: number) => money(value),
                        },
                      ]
                    : []),
                ]}
              />
            </FormSectionCard>

            <FormSectionCard
              icon="mdi:shield-check-outline"
              title="Applicable policies"
              contentSpacing={1}
              action={
                onEdit && (
                  <Button
                    size="small"
                    startIcon={<Iconify icon={GlobalIcons.edit} />}
                    aria-label="Edit policies"
                    onClick={() => onEdit(0)}
                  >
                    Edit
                  </Button>
                )
              }
              descriptionTooltip="Policy versions and fee-head treatment recorded for this assignment."
            >
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
                    <Box key={family}>
                      <Typography variant="subtitle2" sx={{ textTransform: 'capitalize' }}>
                        {family} policy:{' '}
                        {policy ? `${policy.name} · v${policy.version}` : 'No policy assigned'}
                      </Typography>
                      {policy && (
                        <CustomTooltip
                          title={
                            <Stack spacing={0.5}>
                              {policy && (
                                <Typography variant="caption">
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
                            </Stack>
                          }
                          arrow
                          placement="right"
                        >
                          <IconButton
                            size="small"
                            color="info"
                            aria-label={`${family} policy information`}
                          >
                            <Iconify icon="mdi:information-outline" width={18} />
                          </IconButton>
                        </CustomTooltip>
                      )}
                    </Box>
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
                    <CustomTooltip
                      title={`Policies recorded when assigned: ${data.originalPolicies
                        .filter((policy) =>
                          selectableAssignmentPolicyFamilies.some(
                            (family) => family === policy.family
                          )
                        )
                        .map((p) => `${p.family}: ${p.name} · v${p.version}`)
                        .join('; ')}. Existing charges retain this calculation evidence.`}
                      arrow
                      placement="right"
                    >
                      <IconButton
                        size="small"
                        color="info"
                        aria-label="Original assigned policies information"
                        sx={{ justifySelf: 'start' }}
                      >
                        <Iconify icon="mdi:information-outline" width={18} />
                      </IconButton>
                    </CustomTooltip>
                  )}
              </Box>
            </FormSectionCard>
          </Stack>
        </Box>
      </Stack>
      {showInstallments && (
        <CustomDialog
          open
          title="Installment details"
          maxWidth="lg"
          hasForm={false}
          guardUnsavedChanges={false}
          handleClose={() => setShowInstallments(false)}
          titleInfo="Recorded fee-head installments. Closing this view preserves your assignment changes."
        >
          <DialogScrollContent>
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
          </DialogScrollContent>
        </CustomDialog>
      )}
    </Box>
  );
}
