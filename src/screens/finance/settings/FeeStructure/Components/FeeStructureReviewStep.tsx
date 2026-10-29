import type {
  StructureRecord,
  StructurePreview,
  StructureCandidate,
} from 'src/redux/finance/feeStructureWorkspace';

import dayjs from 'dayjs';
import { useState, useEffect } from 'react';
import { LoadingButton } from '@mui/lab';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import CustomAccordion from 'src/components/custom-accordian';
import CustomizableTable from 'src/components/customizabaleTable';
import { FormSectionCard } from 'src/components/form-section-card';
import { DetailField, DetailSection } from 'src/components/detail-view';
import { Box, Stack, Button, IconButton, Typography, AccordionSummary } from '@mui/material';

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
}: Props) {
  const [readinessExpanded, setReadinessExpanded] = useState(true);

  useEffect(() => {
    if (preview && (preview.errors.length || !preview.isReady)) {
      setReadinessExpanded(true);
    }
  }, [preview]);

  return (
    <Stack spacing={1.5}>
      <DetailSection
        collapsible
        helpText="Fixed fee total includes optional heads. All assigned heads are available in Fee Collection. Variable amounts are set during student assignment; this is not a student's amount due."
        icon={GlobalIcons.notebook}
        title="Structure Summary"

        action={
          <Label color={locked ? 'info' : preview?.isReady ? 'success' : 'warning'}>
            {locked ? 'Published' : preview?.isReady ? 'Ready to publish' : 'Draft'}
          </Label>
        }
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(4, minmax(0, 1fr))' },
            gap: 2,
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
            <DetailField key={item.label} label={item.label} value={item.value} />
          ))}
        </Box>
      </DetailSection>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(2, minmax(0, 1fr))' },
          gap: 1.5,
          alignItems: 'start',
        }}
      >
        {impacts.map((impact) => (
          <DetailSection
            collapsible
            defaultExpanded={false}
            key={impact.key}
            icon={GlobalIcons.receiptIcon}
            title={impact.label}
            helpText={impact.description}
            action={
              <CustomTooltip title={`${writable ? 'Edit' : 'View'} ${impact.label}`}>
                <span>
                  <IconButton
                    size="small"
                    sx={{ border: 1, borderColor: 'divider', borderRadius: 1 }}
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
            <Stack direction="row" spacing={1} alignItems="baseline" sx={{ minWidth: 0 }}>
              <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
                Attached policy:
              </Typography>
              <Typography variant="body2" sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
                {candidate[`${impact.key}PolicyVersionId`] ? impact.policyLabel : impact.empty}
              </Typography>
            </Stack>
          </DetailSection>
        ))}
      </Box>

      <FormSectionCard
        collapsible
        expanded={readinessExpanded}
        onExpandedChange={setReadinessExpanded}
        descriptionTooltip="These checks describe structure configuration. Student eligibility and transactions are calculated in their own workflows."
        icon={GlobalIcons.publish}
        title={locked ? 'Publication Validation' : 'Publish Readiness'}
        iconSize={16}
        iconContainerSize={28}
        titleTypographyProps={{ variant: 'subtitle1', fontWeight: 700 }}
        contentSpacing={1}
        sx={{ p: 1.5, minWidth: 0 }}
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
              <Typography variant="body2" role="alert">
                {locked && record?.publicationReview
                  ? 'Configuration checks saved at publication.'
                  : 'This configuration is not ready to publish. Recheck configuration for details.'}
              </Typography>
            )}
            {!!preview.errors.length && (
              <Stack spacing={1} role="alert">
                {preview.errors.map((message, index) => (
                  <Stack
                    key={`${index}-${message}`}
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1}
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                  >
                    <Typography variant="body2" sx={{ flex: 1, minWidth: 0 }}>
                      {message}
                    </Typography>
                    <Button
                      size="small"
                      disabled={busy}
                      sx={{ flexShrink: 0 }}
                      onClick={() => onNavigate(/policy|collection|refund/i.test(message) ? 1 : 0)}
                    >
                      {/policy|collection|refund/i.test(message)
                        ? 'Review Policies'
                        : 'Review Fee Heads'}
                    </Button>
                  </Stack>
                ))}
              </Stack>
            )}
            {!preview.errors.length && preview.isReady && (
              <Typography variant="body2">No issues block publication.</Typography>
            )}
            {!!preview.warnings.length && (
              <Box
                sx={{ border: 1, borderColor: 'warning.main', borderRadius: 1, overflow: 'hidden' }}
              >
                <CustomAccordion
                  title={`${preview.warnings.length} warning${preview.warnings.length === 1 ? '' : 's'}`}
                  summary={
                    <AccordionSummary
                      id={`${tableId}-warnings-summary`}
                      aria-controls={`${tableId}-warnings-content`}
                      expandIcon={<Iconify icon="mdi:chevron-down" />}
                      sx={{
                        minHeight: 44,
                        '&.Mui-expanded': { minHeight: 44 },
                        '& .MuiAccordionSummary-content': { my: 1 },
                        '& .MuiAccordionSummary-content.Mui-expanded': { my: 1 },
                      }}
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
              </Box>
            )}
          </>
        )}
      </FormSectionCard>
      {preview && (
        <>
          <DetailSection
            collapsible
            defaultExpanded={false}
            icon={GlobalIcons.documentIcon}
            title="Policy Coverage"
            helpText="Collection, refund, and accounting treatment for each fee head in this review."
            action={
              <CustomTooltip title={writable ? 'Edit policies' : 'View policies'} placement="right">
                <span>
                  <IconButton
                    size="small"
                    aria-label={writable ? 'Edit policies' : 'View policies'}
                    disabled={busy}
                    onClick={() => onNavigate(1)}
                    sx={{ border: 1, borderColor: 'divider', borderRadius: 1 }}
                  >
                    <Iconify icon={writable ? GlobalIcons.edit : GlobalIcons.eye} />
                  </IconButton>
                </span>
              </CustomTooltip>
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
          <FormSectionCard
            collapsible
            defaultExpanded={false}
            icon={GlobalIcons.calendar}
            title="Payment Schedules"
            iconSize={16}
            iconContainerSize={28}
            titleTypographyProps={{ variant: 'subtitle1', fontWeight: 700 }}
            descriptionTooltip="Expand a fee head to review its payment term version, service periods, demand and due dates, allocation percentages, and installment amounts."
            contentSpacing={1}
            sx={{ p: 1.5, minWidth: 0 }}
            action={
              <CustomTooltip
                title={writable ? 'Edit fee heads' : 'View fee heads'}
                placement="right"
              >
                <span>
                  <IconButton
                    size="small"
                    aria-label={writable ? 'Edit fee heads' : 'View fee heads'}
                    disabled={busy}
                    onClick={() => onNavigate(0)}
                    sx={{ border: 1, borderColor: 'divider', borderRadius: 1 }}
                  >
                    <Iconify icon={writable ? GlobalIcons.edit : GlobalIcons.eye} />
                  </IconButton>
                </span>
              </CustomTooltip>
            }
          >
            {!preview.schedules.length && (
              <Typography variant="body2" color="text.secondary">
                No installment schedule is available.
              </Typography>
            )}
            {preview.schedules.map((schedule) => (
              <Box
                key={schedule.feeHeadId}
                sx={{ border: 1, borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}
              >
                <CustomAccordion
                  title={schedule.feeHeadName}
                  summary={
                    <AccordionSummary
                      id={`${tableId}-schedule-${schedule.feeHeadId}-summary`}
                      aria-controls={`${tableId}-schedule-${schedule.feeHeadId}-content`}
                      expandIcon={<Iconify icon="mdi:chevron-down" />}
                      sx={{
                        minHeight: 44,
                        '&.Mui-expanded': { minHeight: 44 },
                        '& .MuiAccordionSummary-content': { my: 1 },
                        '& .MuiAccordionSummary-content.Mui-expanded': { my: 1 },
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1}
                        useFlexGap
                        flexWrap="wrap"
                        alignItems="baseline"
                        sx={{ minWidth: 0 }}
                      >
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
                      tableId={`${tableId}-installments-${schedule.feeHeadId}`}
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
              </Box>
            ))}
          </FormSectionCard>
        </>
      )}
    </Stack>
  );
}
