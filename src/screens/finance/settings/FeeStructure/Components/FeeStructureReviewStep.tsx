import type {
  StructureRecord,
  StructurePreview,
  StructureCandidate,
} from 'src/redux/finance/feeStructureWorkspace';

import dayjs from 'dayjs';
import { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { Iconify } from 'src/components/iconify';
import CustomizableTable from 'src/components/customizabaleTable';
import { FormSectionHeader } from 'src/components/form-section-card';
import {
  Box,
  Stack,
  Alert,
  Button,
  Accordion,
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
      <Box
        component="dl"
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(3, minmax(0, 1fr))' },
          gap: 2,
          m: 0,
        }}
      >
        <Box>
          <Typography component="dt" variant="caption" color="text.secondary">
            Configured fixed amount
          </Typography>
          <Typography component="dd" variant="subtitle2" sx={{ m: 0 }}>
            {structureMoney(
              candidate.feeHeads
                .filter((line) => !line.isVariable)
                .reduce((sum, line) => sum + (line.amount ?? 0), 0)
            )}
          </Typography>
        </Box>
        {impacts.map((impact) => (
          <Box key={impact.key}>
            <Typography component="dt" variant="caption" color="text.secondary">
              {impact.label}
            </Typography>
            <Typography component="dd" variant="body2" sx={{ m: 0, overflowWrap: 'anywhere' }}>
              {candidate[`${impact.key}PolicyVersionId`] ? impact.policyLabel : impact.empty}
            </Typography>
          </Box>
        ))}
      </Box>
      {locked && (
        <Alert severity={record?.publicationReview ? 'info' : 'warning'}>
          {record?.publicationReview
            ? 'This is the saved publication review. Later settings changes do not alter it.'
            : 'This legacy structure has no saved publication review. These checks describe current settings, not historical calculations.'}
        </Alert>
      )}
      <FormSectionHeader
        icon="mdi:clipboard-check-outline"
        title={
          locked
            ? 'Publication checks'
            : preview?.errors.length
              ? `${preview.errors.length} issue${preview.errors.length === 1 ? ' blocks' : 's block'} publication`
              : 'Configuration readiness'
        }
        descriptionTooltip="These checks describe structure configuration. Student eligibility and transactions are calculated in their own workflows."
        action={
          <LoadingButton
            size="small"
            startIcon={<Iconify icon="mdi:refresh" />}
            loading={previewing}
            disabled={busy}
            onClick={onReview}
          >
            {locked ? 'View Publication Checks' : 'Recheck Configuration'}
          </LoadingButton>
        }
      />
      {!preview && (
        <Typography variant="body2" color="text.secondary" role="status">
          {previewing
            ? 'Checking policy coverage and installment schedules…'
            : 'Check the current configuration to see readiness and coverage.'}
        </Typography>
      )}
      {preview && (
        <>
          {!preview.errors.length && (
            <Alert severity={preview.isReady ? 'success' : 'info'}>
              {locked && record?.publicationReview
                ? 'Configuration checks saved at publication.'
                : preview.isReady
                  ? 'All configuration checks passed.'
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
                          ? 'Review Policies'
                          : 'Review Fee Heads'}
                      </Button>
                      {/refund/i.test(message) && onRemoveRefund && (
                        <Button size="small" disabled={busy} onClick={onRemoveRefund}>
                          Remove Refund Policy
                        </Button>
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
              <Button size="small" disabled={busy} onClick={() => onNavigate(1)}>
                {writable ? 'Edit Policies' : 'View Policies'}
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
                width: '34%',
                minWidth: 200,
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
            title="Installment schedule"
            action={
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                <Button size="small" onClick={() => setDetails(!details)} aria-pressed={details}>
                  {details ? 'Hide Details' : 'Show Details'}
                </Button>
                <Button size="small" disabled={busy} onClick={() => onNavigate(0)}>
                  {writable ? 'Edit Fee Heads' : 'View Fee Heads'}
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
            <Stack key={schedule.feeHeadId} spacing={1}>
              <Stack direction="row" spacing={1} alignItems="baseline" useFlexGap flexWrap="wrap">
                <Typography component="h3" variant="subtitle2">
                  {schedule.feeHeadName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {schedule.paymentTermName} · v{schedule.versionNumber} ·{' '}
                  {schedule.installments.length} installment
                  {schedule.installments.length === 1 ? '' : 's'}
                </Typography>
              </Stack>
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
                          id: 'allocationPercentage',
                          label: 'Allocation (%)',
                          minWidth: 120,
                          align: 'right' as const,
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
                    id: 'calculatedAmount',
                    label: 'Amount (₹)',
                    width: '20%',
                    minWidth: 150,
                    align: 'right',
                    isSort: false,
                    isFilter: false,
                    render: (_value, row) =>
                      structureMoney(
                        row.calculatedAmount == null ? null : Number(row.calculatedAmount)
                      ),
                  },
                ]}
              />
            </Stack>
          ))}
        </>
      )}
    </Stack>
  );
}
