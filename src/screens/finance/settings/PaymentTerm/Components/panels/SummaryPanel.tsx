'use client';

import { Scrollbar } from 'src/components/scrollbar';
import { Box, Chip, Alert, Stack, Divider, Typography } from '@mui/material';

import { SummaryRow } from '../ui/SummaryRow';
import { TimelineItem } from '../ui/TimelineItem';
import { ValidationCheck } from '../ui/ValidationCheck';

import type { IPaymentTerm } from '../../type';
import type { IBoard, IPaymentTermChecks } from '../../hooks/usePaymentTermForm';

// ---------------------------------------------------------------------------
// Status colour map (duplicated from GeneralInfoSection to keep panel self-contained)
// ---------------------------------------------------------------------------
const STATUS_COLORS: Record<string, string> = {
  Active: '#22c55e',
  Draft: '#f59e0b',
  Archived: '#94a3b8',
  Inactive: '#94a3b8',
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface SummaryPanelProps {
  values: IPaymentTerm;
  boards: IBoard[];
  checks: IPaymentTermChecks;
  demandLabel: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function SummaryPanel({ values, boards, checks, demandLabel }: SummaryPanelProps) {
  const selectedBoardName = boards.find((b) => b.id === values.boardId)?.name ?? '—';

  return (
    <Box
      sx={{
        width: 280,
        flexShrink: 0,
        display: { xs: 'none', lg: 'flex' },
        flexDirection: 'column',
        borderLeft: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
        bgcolor: (theme) =>
          theme.palette.mode === 'dark' ? theme.palette.background.neutral : theme.palette.grey[50],
      }}
    >
      <Scrollbar sx={{ flex: 1 }}>
        <Box sx={{ p: 2 }}>
          {/* ── Live Summary ───────────────────────────────────────────────── */}
          <Typography
            variant="overline"
            sx={{
              fontSize: '0.6rem',
              fontWeight: 800,
              letterSpacing: '0.1em',
              color: 'text.secondary',
            }}
          >
            Live Summary
          </Typography>

          <Stack spacing={0.75} mt={1} mb={2}>
            <SummaryRow
              label="Board"
              value={
                <Typography
                  variant="caption"
                  fontWeight={600}
                  sx={{
                    maxWidth: 130,
                    textAlign: 'right',
                    wordBreak: 'break-word',
                    fontSize: '0.7rem',
                  }}
                >
                  {selectedBoardName}
                </Typography>
              }
            />
            <SummaryRow
              label="Term Name"
              value={
                <Typography
                  variant="caption"
                  fontWeight={600}
                  sx={{
                    maxWidth: 130,
                    textAlign: 'right',
                    wordBreak: 'break-word',
                    fontSize: '0.7rem',
                  }}
                >
                  {values.paymentTermName || '—'}
                </Typography>
              }
            />
            <SummaryRow
              label="Version"
              value={
                <Chip
                  label={values.status === 'Active' ? 'Active' : 'Draft'}
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: '0.6rem',
                    bgcolor:
                      values.status === 'Active' ? STATUS_COLORS.Active : STATUS_COLORS.Draft,
                    color: 'white',
                    fontWeight: 700,
                  }}
                />
              }
            />
            <SummaryRow
              label="Installments"
              value={
                <Chip
                  label={`${values.installments.length} total`}
                  size="small"
                  color={values.installments.length > 0 ? 'primary' : 'default'}
                  variant="outlined"
                  sx={{ height: 18, fontSize: '0.6rem' }}
                />
              }
            />
            <SummaryRow
              label="Default Term"
              value={
                <Chip
                  label={values.isDefaultTerm ? 'Yes' : 'No'}
                  size="small"
                  color={values.isDefaultTerm ? 'primary' : 'default'}
                  variant={values.isDefaultTerm ? 'filled' : 'outlined'}
                  sx={{ height: 18, fontSize: '0.6rem' }}
                />
              }
            />
            <SummaryRow
              label="Invoice Date Rule"
              value={
                <Typography
                  variant="caption"
                  fontWeight={600}
                  sx={{ fontSize: '0.7rem', maxWidth: 120, textAlign: 'right' }}
                >
                  {demandLabel}
                </Typography>
              }
            />
            <SummaryRow
              label="Invoice Creation"
              value={
                <Chip
                  label={values.invoiceCreationEnabled ? 'Enabled' : 'Disabled'}
                  size="small"
                  color={values.invoiceCreationEnabled ? 'success' : 'default'}
                  variant="outlined"
                  sx={{ height: 18, fontSize: '0.6rem' }}
                />
              }
            />
          </Stack>

          <Divider sx={{ my: 1.5 }} />

          {/* ── Timeline Preview ───────────────────────────────────────────── */}
          <Typography
            variant="overline"
            sx={{
              fontSize: '0.6rem',
              fontWeight: 800,
              letterSpacing: '0.1em',
              color: 'text.secondary',
            }}
          >
            Timeline Preview
          </Typography>
          <Box mt={1} mb={2}>
            {values.installments.length === 0 ? (
              <Box
                sx={{
                  border: '1px dashed',
                  borderColor: 'divider',
                  borderRadius: 1,
                  py: 2,
                  textAlign: 'center',
                }}
              >
                <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.68rem' }}>
                  Add installments to see timeline
                </Typography>
              </Box>
            ) : (
              values.installments.map((inst, i) => (
                <TimelineItem
                  key={i}
                  seq={i + 1}
                  name={inst.installmentName}
                  startDate={inst.startDate ? String(inst.startDate) : null}
                  endDate={inst.endDate ? String(inst.endDate) : null}
                  dueDate={inst.dueDate ? String(inst.dueDate) : null}
                  isLast={i === values.installments.length - 1}
                />
              ))
            )}
          </Box>

          <Divider sx={{ my: 1.5 }} />

          {/* ── Publish Checklist ──────────────────────────────────────────── */}
          <Typography
            variant="overline"
            sx={{
              fontSize: '0.6rem',
              fontWeight: 800,
              letterSpacing: '0.1em',
              color: 'text.secondary',
            }}
          >
            Validation Checklist
          </Typography>
          <Stack spacing={0.4} mt={1}>
            <ValidationCheck label="Board selected" valid={checks.boardValid} />
            <ValidationCheck label="Term name (3+ characters)" valid={checks.nameValid} />
            <ValidationCheck label="At least 1 installment" valid={checks.hasInstallments} />
            <ValidationCheck label="All installment names set" valid={checks.allNames} />
            <ValidationCheck label="All due dates configured" valid={checks.allDueDates} />
            <ValidationCheck label="Unique installment names" valid={checks.uniqueNames} />
            <ValidationCheck label="Allocation totals 100%" valid={checks.allocationValid} />
            <ValidationCheck label="Due dates are within each period" valid={checks.periodsValid} />
            <ValidationCheck
              label="Installment periods do not overlap"
              valid={checks.periodsNonOverlapping}
            />
            <ValidationCheck
              label="Periods are within the selected board dates"
              valid={checks.periodsWithinBoard}
            />
            <ValidationCheck label="Due dates in ascending order" valid={checks.datesSequential} />
            <ValidationCheck label="Invoice date rule selected" valid={checks.demandSet} />
            {values.demandGenerationRule === 'XDaysBeforeDue' && (
              <ValidationCheck
                label="Offset days configured (≥1)"
                valid={checks.demandOffsetValid}
              />
            )}
            {values.demandGenerationRule === 'SpecificDate' && (
              <ValidationCheck label="Invoice dates configured" valid={checks.specificDatesValid} />
            )}
          </Stack>

          {checks.isReadyToPublish ? (
            <Alert
              severity="success"
              sx={{
                mt: 1.5,
                py: 0.5,
                borderRadius: 1,
                '& .MuiAlert-message': { fontSize: '0.7rem' },
              }}
            >
              Ready to save as {values.status === 'Active' ? 'an active version' : 'a draft'}.
            </Alert>
          ) : (
            <Alert
              severity="info"
              sx={{
                mt: 1.5,
                py: 0.5,
                borderRadius: 1,
                '& .MuiAlert-message': { fontSize: '0.7rem' },
              }}
            >
              Complete the required fields before saving.
            </Alert>
          )}
        </Box>
      </Scrollbar>
    </Box>
  );
}
