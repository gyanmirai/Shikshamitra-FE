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
import CustomizableTable from 'src/components/customizabaleTable';
import { FormSectionCard, FormSectionHeader } from 'src/components/form-section-card';
import {
  Box,
  Stack,
  Alert,
  Button,
  Accordion,
  IconButton,
  Typography,
  AccordionSummary,
  AccordionDetails,
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
      <FormSectionCard
        descriptionTooltip="Fixed fee total includes optional heads. Variable amounts are set during student assignment; this is not a student's amount due."
        icon="mdi:clipboard-check-outline"
        title="Structure summary"

        action={
          <Label color={locked ? 'info' : preview?.isReady ? 'success' : 'warning'}>
            {locked ? 'Published' : preview?.isReady ? 'Ready to publish' : 'Draft'}
          </Label>
        }
      >
        <Typography variant="h6" sx={{ overflowWrap: 'anywhere' }}>
          {candidate.name}
        </Typography>
        <Box
          component="dl"
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, minmax(0, 1fr))',
              md: 'repeat(4, minmax(0, 1fr))',
            },
            gap: 2,
            m: 0,
          }}
        >
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
              label: 'Optional fee heads',
              value: candidate.feeHeads.filter((line) => line.isOptional).length,
            },
            {
              label: 'Variable fee heads',
              value: candidate.feeHeads.filter((line) => line.isVariable).length,
            },
          ].map((item) => (
            <Box key={item.label}>
              <Typography component="dt" variant="caption" color="text.secondary">
                {item.label}
              </Typography>
              <Typography component="dd" variant="h6" sx={{ m: 0 }}>
                {item.value}
              </Typography>
            </Box>
          ))}
        </Box>
      </FormSectionCard>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(2, minmax(0, 1fr))' },
          gap: 1.5,
        }}
      >
        {impacts.map((impact) => (
          <FormSectionCard
            key={impact.key}
            icon={impact.key === 'collection' ? 'mdi:cash-check' : 'mdi:cash-refund'}
            title={impact.label}
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
            <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
              {candidate[`${impact.key}PolicyVersionId`] ? impact.policyLabel : impact.empty}
            </Typography>
          </FormSectionCard>
        ))}
      </Box>

      <FormSectionHeader
        descriptionTooltip="These checks describe structure configuration. Student eligibility and transactions are calculated in their own workflows."
        icon="mdi:clipboard-check-outline"
        title={
          locked
            ? 'Publication validation'
            : preview?.errors.length
              ? `${preview.errors.length} issue${preview.errors.length === 1 ? ' blocks' : 's block'} publication`
              : 'Publish readiness'
        }

        action={
          <LoadingButton
            size="small"
            startIcon={<Iconify icon={GlobalIcons.refresh} />}
            loading={previewing}
            disabled={busy}
            onClick={onReview}
          >
            {locked ? 'View saved checks' : 'Check readiness'}
          </LoadingButton>
        }
      />

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
                          ? 'Review policies'
                          : 'Review fee heads'}
                      </Button>
                      {/refund/i.test(message) && onRemoveRefund && (
                        <CustomTooltip title="Remove refund policy">
                          <IconButton
                            size="small"
                            color="error"
                            aria-label="Remove refund policy"
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
          {!!preview.warnings.length && (
            <Accordion
              disableGutters
              elevation={0}
              sx={{ bgcolor: 'background.neutral', borderRadius: 1 }}
            >
              <AccordionSummary expandIcon={<Iconify icon="mdi:chevron-down" />}>
                <Typography variant="subtitle2">
                  {preview.warnings.length} warning{preview.warnings.length === 1 ? '' : 's'}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={1}>
                  {preview.warnings.map((message, index) => (
                    <Typography key={`${index}-${message}`} variant="body2">
                      {message}
                    </Typography>
                  ))}
                </Stack>
              </AccordionDetails>
            </Accordion>
          )}
          <FormSectionHeader
            icon="mdi:shield-check-outline"
            title="Policy coverage"
            action={
              <Button
                size="small"
                startIcon={<Iconify icon={writable ? GlobalIcons.edit : GlobalIcons.eye} />}
                disabled={busy}
                onClick={() => onNavigate(1)}
              >
                {writable ? 'Edit policies' : 'View policies'}
              </Button>
            }
          />
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
                width: '28%',
                minWidth: 140,
                isSort: false,
                isFilter: false,
              },
              {
                id: 'collection',
                label: 'Collection',
                width: '24%',
                minWidth: 160,
                isSort: false,
                isFilter: false,
              },
              {
                id: 'refund',
                label: 'Refund',
                width: '24%',
                minWidth: 160,
                isSort: false,
                isFilter: false,
              },
              {
                id: 'accounting',
                label: 'Accounting',
                width: '18%',
                minWidth: 130,
                isSort: false,
                isFilter: false,
              },
            ]}
          />
          <FormSectionHeader
            icon="mdi:calendar-month-outline"
            title="Payment schedules"
            action={
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                <Button size="small" onClick={() => setDetails(!details)} aria-pressed={details}>
                  {details ? 'Hide details' : 'Show details'}
                </Button>
                <Button
                  size="small"
                  startIcon={<Iconify icon={writable ? GlobalIcons.edit : GlobalIcons.eye} />}
                  disabled={busy}
                  onClick={() => onNavigate(0)}
                >
                  {writable ? 'Edit fee heads' : 'View fee heads'}
                </Button>
              </Stack>
            }
          />
          {!preview.schedules.length && (
            <Typography variant="body2" color="text.secondary">
              No installment schedule is available.
            </Typography>
          )}
          {preview.schedules.map((schedule) => (
            <Accordion
              key={schedule.feeHeadId}
              disableGutters
              elevation={0}
              sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                '&:before': { display: 'none' },
              }}
            >
              <AccordionSummary expandIcon={<Iconify icon="mdi:chevron-down" />}>
                <Stack spacing={0.5} sx={{ minWidth: 0 }}>
                  <Typography component="h3" variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
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
              <AccordionDetails sx={{ p: { xs: 1, sm: 1.5 }, pt: 0 }}>
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
                      width: '20%',
                      minWidth: 140,
                      isSort: false,
                      isFilter: false,
                    },
                    {
                      id: 'coverageStartDate',
                      label: 'Service period',
                      width: '38%',
                      minWidth: 240,
                      isSort: false,
                      isFilter: false,
                      render: (_value, row) =>
                        `${date(row.coverageStartDate)} – ${date(row.coverageEndDate)}`,
                    },
                    ...(details
                      ? [
                          {
                            id: 'demandDate',
                            label: 'Demand date',
                            minWidth: 140,
                            isSort: false,
                            isFilter: false,
                            render: (value: string) => date(value),
                          },
                          {
                            cellSx: { textAlign: 'right' as const },
                            id: 'allocationPercentage',
                            label: 'Allocation (%)',
                            minWidth: 120,
                            align: 'left' as const,
                            isSort: false,
                            isFilter: false,
                          },
                        ]
                      : []),
                    {
                      id: 'dueDate',
                      label: 'Due date',
                      width: '22%',
                      minWidth: 140,
                      isSort: false,
                      isFilter: false,
                      render: (value) => date(value),
                    },
                    {
                      cellSx: { textAlign: 'right' as const },
                      id: 'calculatedAmount',
                      label: 'Amount (₹)',
                      width: '20%',
                      minWidth: 150,
                      align: 'left',
                      isSort: false,
                      isFilter: false,
                      render: (_value, row) =>
                        structureMoney(
                          row.calculatedAmount == null ? null : Number(row.calculatedAmount)
                        ),
                    },
                  ]}
                />
              </AccordionDetails>
            </Accordion>
          ))}
        </>
      )}
    </Stack>
  );
}
