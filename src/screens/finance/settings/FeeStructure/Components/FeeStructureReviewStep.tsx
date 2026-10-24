import type {
  StructureRecord,
  StructurePreview,
  StructureCandidate,
} from 'src/redux/finance/feeStructureWorkspace';

import dayjs from 'dayjs';
import { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import CustomAccordion from 'src/components/custom-accordian';
import CustomizableTable from 'src/components/customizabaleTable';
import { DetailField, DetailSection } from 'src/components/detail-view';
import {
  Box,
  Grid,
  Stack,
  Alert,
  Button,
  IconButton,
  Typography,
  AccordionSummary,
} from '@mui/material';

import { structureMoney } from '../feeStructurePresentation';

import type { StructurePolicyImpact } from './FeeStructurePoliciesStep';

interface Props {
  candidate: StructureCandidate;
  record?: StructureRecord;
  preview?: StructurePreview;
  impacts: StructurePolicyImpact[];
  writable: boolean;
  locked: boolean;
  busy: boolean;
  previewing: boolean;
  tableId: string;
  onReview: () => void;
  onNavigate: (step: number) => void;
  onRemoveRefund?: () => void;
}

const date = (value: string | null | undefined) =>
  value ? dayjs(value).format('DD MMM YYYY') : '—';

export default function FeeStructureReviewStep({
  candidate,
  record,
  preview,
  impacts,
  writable,
  locked,
  busy,
  previewing,
  tableId,
  onReview,
  onNavigate,
  onRemoveRefund,
}: Props) {
  const [details, setDetails] = useState(false);
  return (
    <Stack spacing={2}>
      <DetailSection
        helpText="Fixed fee total includes optional and admission-only heads. Admission-only heads are excluded from regular dues, Fee Collection and income. Variable amounts are set during student assignment; this is not a student's amount due."
        icon={GlobalIcons.notebook}
        title="Structure Summary"

        action={
          <Label color={locked ? 'info' : preview?.isReady ? 'success' : 'warning'}>
            {locked ? 'Published' : preview?.isReady ? 'Ready to publish' : 'Draft'}
          </Label>
        }
      >
        <Grid container spacing={2}>
          {[
            {
              label: 'Fixed fee total',
              value: structureMoney(
                candidate.feeHeads
                  .filter((line) => !line.isVariable)
                  .reduce((sum, line) => sum + (line.amount ?? 0), 0)
              ),
            },
            { label: 'Fee heads', value: candidate.feeHeads.length },
            {
              label: 'Admission-only heads',
              value: candidate.feeHeads.filter((line) => line.collectAtAdmission).length,
            },
            {
              label: 'Optional fee heads',
              value: candidate.feeHeads.filter((line) => line.isOptional).length,
            },
            {
              label: 'Variable fee heads',
              value: candidate.feeHeads.filter((line) => line.isVariable).length,
            },
          ].map((item) => (
            <Grid key={item.label} size={{ xs: 12, sm: 6 }}>
              <DetailField label={item.label} value={item.value} />
            </Grid>
          ))}
        </Grid>
      </DetailSection>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(2, minmax(0, 1fr))' },
          gap: 1.5,
        }}
      >
        {impacts.map((impact) => (
          <DetailSection
            key={impact.key}
            icon={GlobalIcons.receiptIcon}
            title={impact.label}
            helpText={impact.description}
            action={
              <CustomTooltip title={`${writable ? 'Edit' : 'View'} ${impact.label}`}>
                <span>
                  <IconButton
                    size="small"
                    disabled={busy}
                    aria-label={`${writable ? 'Edit' : 'View'} ${impact.label}`}
                    onClick={() => onNavigate(1)}
                  >
                    <Iconify icon={writable ? GlobalIcons.edit : GlobalIcons.eye} />
                  </IconButton>
                </span>
              </CustomTooltip>
            }
          >
            <DetailField
              label="Attached policy"
              value={candidate[`${impact.key}PolicyVersionId`] ? impact.policyLabel : impact.empty}
            />
          </DetailSection>
        ))}
      </Box>

      <DetailSection
        helpText="These checks describe structure configuration. Student eligibility and transactions are calculated in their own workflows."
        icon={GlobalIcons.publish}
        title={locked ? 'Publication Validation' : 'Publish Readiness'}

        action={
          <LoadingButton
            size="small"
            startIcon={<Iconify icon={GlobalIcons.refresh} />}
            loading={previewing}
            disabled={busy}
            onClick={onReview}
          >
            {locked ? 'View Saved Checks' : 'Check Readiness'}
          </LoadingButton>
        }
      >
        {!preview && (
          <Typography variant="body2" color="text.secondary">
            {previewing
              ? 'Checking structure configuration…'
              : 'Check readiness to review publication requirements.'}
          </Typography>
        )}

        {preview && (
          <>
            {!preview.errors.length && !preview.isReady && (
              <Alert severity="error">
                {locked && record?.publicationReview
                  ? 'Configuration checks saved at publication.'
                  : 'This configuration is not ready to publish. Recheck configuration for details.'}
              </Alert>
            )}
            {!!preview.errors.length && (
              <Alert severity="error">
                <Stack spacing={1}>
                  <Typography variant="subtitle2">
                    {preview.errors.length} issue
                    {preview.errors.length === 1 ? ' blocks' : 's block'} publication
                  </Typography>
                  {preview.errors.map((message, index) => (
                    <Box key={`${index}-${message}`}>
                      <Typography variant="body2">{message}</Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                        <Button
                          size="small"
                          disabled={busy}
                          onClick={() =>
                            onNavigate(/policy|collection|refund/i.test(message) ? 1 : 0)
                          }
                        >
                          {/policy|collection|refund/i.test(message)
                            ? 'Review Policies'
                            : 'Review Fee Heads'}
                        </Button>
                        {/refund/i.test(message) && onRemoveRefund && (
                          <CustomTooltip title="Remove Refund Policy">
                            <IconButton
                              size="small"
                              color="error"
                              aria-label="Remove Refund Policy"
                              disabled={busy}
                              onClick={onRemoveRefund}
                            >
                              <Iconify icon={GlobalIcons.delete} />
                            </IconButton>
                          </CustomTooltip>
                        )}
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </Alert>
            )}
            {!preview.errors.length && preview.isReady && (
              <Typography variant="body2">No issues block publication.</Typography>
            )}
            {!!preview.warnings.length && (
              <CustomAccordion
                title={`${preview.warnings.length} warning${preview.warnings.length === 1 ? '' : 's'}`}
                summary={
                  <AccordionSummary
                    id={`${tableId}-warnings-summary`}
                    aria-controls={`${tableId}-warnings-content`}
                    expandIcon={<Iconify icon="mdi:chevron-down" />}
                  >
                    <Typography variant="subtitle2">
                      {preview.warnings.length} warning{preview.warnings.length === 1 ? '' : 's'}
                    </Typography>
                  </AccordionSummary>
                }
                content={
                  <Stack spacing={1}>
                    {preview.warnings.map((message, index) => (
                      <Typography key={`${index}-${message}`} variant="body2">
                        {message}
                      </Typography>
                    ))}
                  </Stack>
                }
              />
            )}
          </>
        )}
      </DetailSection>
      {preview && (
        <>
          <DetailSection
            icon={GlobalIcons.documentIcon}
            title="Policy Coverage"
            helpText="Collection, refund, and accounting treatment for each fee head in this review."
            action={
              <Button
                size="small"
                startIcon={<Iconify icon={writable ? GlobalIcons.edit : GlobalIcons.eye} />}
                disabled={busy}
                onClick={() => onNavigate(1)}
              >
                {writable ? 'Edit Policies' : 'View Policies'}
              </Button>
            }
          >
            <CustomizableTable
              tableTitle="Policy coverage"
              tableId={`${tableId}-coverage`}
              data={preview.coverage.map((row) => ({ ...row, _id: row.feeHeadId }))}
              showToolbar={false}
              isPagination={false}
              isSearch={false}
              isFilter={false}
              isShowedDense={false}
              noDataText="No fee-head coverage is available."
              columns={[
                {
                  id: 'name',
                  label: 'Fee head',
                  filterType: 'string' as const,
                  width: '28%',
                  minWidth: 140,
                  isSort: false,
                  isFilter: true,
                },
                {
                  id: 'collection',
                  label: 'Collection',
                  filterType: 'string' as const,
                  width: '24%',
                  minWidth: 160,
                  isSort: false,
                  isFilter: true,
                },
                {
                  id: 'refund',
                  label: 'Refund',
                  filterType: 'string' as const,
                  width: '24%',
                  minWidth: 160,
                  isSort: false,
                  isFilter: true,
                },
                {
                  id: 'accounting',
                  label: 'Accounting',
                  filterType: 'string' as const,
                  width: '18%',
                  minWidth: 130,
                  isSort: false,
                  isFilter: true,
                },
              ]}
            />
          </DetailSection>
          <DetailSection
            icon={GlobalIcons.calendar}
            title="Payment Schedules"
            helpText="Expand a fee head to review its payment term version, service periods, due dates, and installment amounts. Show Details adds demand dates and allocation percentages."
            action={
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                <Button size="small" onClick={() => setDetails(!details)} aria-pressed={details}>
                  {details ? 'Hide Details' : 'Show Details'}
                </Button>
                <Button
                  size="small"
                  startIcon={<Iconify icon={writable ? GlobalIcons.edit : GlobalIcons.eye} />}
                  disabled={busy}
                  onClick={() => onNavigate(0)}
                >
                  {writable ? 'Edit Fee Heads' : 'View Fee Heads'}
                </Button>
              </Stack>
            }
          >
            {!preview.schedules.length && (
              <Typography variant="body2" color="text.secondary">
                No installment schedule is available.
              </Typography>
            )}
            {preview.schedules.map((schedule) => (
              <CustomAccordion
                key={schedule.feeHeadId}
                title={schedule.feeHeadName}
                summary={
                  <AccordionSummary
                    id={`${tableId}-schedule-${schedule.feeHeadId}-summary`}
                    aria-controls={`${tableId}-schedule-${schedule.feeHeadId}-content`}
                    expandIcon={<Iconify icon="mdi:chevron-down" />}
                  >
                    <Stack spacing={0.5} sx={{ minWidth: 0 }}>
                      <Typography
                        component="h3"
                        variant="subtitle2"
                        sx={{ overflowWrap: 'anywhere' }}
                      >
                        {schedule.feeHeadName}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ overflowWrap: 'anywhere' }}
                      >
                        {schedule.paymentTermName} · Version {schedule.versionNumber} ·{' '}
                        {schedule.installments.length} installment
                        {schedule.installments.length === 1 ? '' : 's'}
                      </Typography>
                    </Stack>
                  </AccordionSummary>
                }
                content={
                  <CustomizableTable
                    tableTitle={`${schedule.feeHeadName} installments`}
                    tableId={`${tableId}-installments-${schedule.feeHeadId}-${details ? 'detail' : 'summary'}`}
                    data={schedule.installments.map((line) => ({
                      ...line,
                      _id: `${schedule.feeHeadId}-${line.sequence}`,
                    }))}
                    showToolbar={false}
                    isPagination={schedule.installments.length > 12}
                    isFilter={false}
                    isSearch={false}
                    isShowedDense={false}
                    columns={[
                      {
                        id: 'name',
                        label: 'Installment',
                        filterType: 'string' as const,
                        width: '20%',
                        minWidth: 140,
                        isSort: false,
                        isFilter: true,
                      },
                      {
                        id: 'coverageStartDate',
                        label: 'Service period',
                        filterType: 'string' as const,
                        width: '38%',
                        minWidth: 240,
                        isSort: false,
                        isFilter: true,
                        render: (_value, row) =>
                          `${date(row.coverageStartDate)} – ${date(row.coverageEndDate)}`,
                      },
                      ...(details
                        ? [
                            {
                              id: 'demandDate',
                              label: 'Demand date',
                              filterType: 'date' as const,
                              minWidth: 140,
                              isSort: false,
                              isFilter: true,
                              render: (value: string) => date(value),
                            },
                            {
                              cellSx: { textAlign: 'right' as const },
                              id: 'allocationPercentage',
                              label: 'Allocation (%)',
                              filterType: 'number' as const,
                              minWidth: 120,
                              align: 'left' as const,
                              isSort: false,
                              isFilter: true,
                            },
                          ]
                        : []),
                      {
                        id: 'dueDate',
                        label: 'Due date',
                        filterType: 'date' as const,
                        width: '22%',
                        minWidth: 140,
                        isSort: false,
                        isFilter: true,
                        render: (value) => date(value),
                      },
                      {
                        cellSx: { textAlign: 'right' as const },
                        id: 'calculatedAmount',
                        label: 'Amount (₹)',
                        filterType: 'number' as const,
                        width: '20%',
                        minWidth: 150,
                        align: 'left',
                        isSort: false,
                        isFilter: true,
                        render: (_value, row) =>
                          structureMoney(
                            row.calculatedAmount == null ? null : Number(row.calculatedAmount)
                          ),
                      },
                    ]}
                  />
                }
              />
            ))}
          </DetailSection>
        </>
      )}
    </Stack>
  );
}
