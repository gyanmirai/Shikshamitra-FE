'use client';

import React from 'react';
import dayjs from 'dayjs';
import { Label } from 'src/components/label';
import { alpha } from '@mui/material/styles';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import {
  Box,
  Grid,
  Chip,
  Stack,
  Paper,
  Table,
  Drawer,
  Button,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
  Typography,
  TableContainer,
} from '@mui/material';

import { hasActiveProration, ProrationEventDetail } from './proration/ProrationEventDetail';

import {
  CONCESSION_METHODS,
  CONCESSION_SCOPES,
  CONCESSION_VALUE_SOURCES,
  concessionOptionLabel,
  concessionValueLabel,
  policyDateTimeLabel,
} from './concession/concessionPresentation';
import FinancePolicyDrawerHeader from './FinancePolicyDrawerHeader';

import type { IFinancePolicyRow, IProrationPolicyRule } from '../types/finance-policy.types';

type FinancePolicyDetailsDrawerProps = {
  open: boolean;
  onClose: () => void;
  policy: IFinancePolicyRow | null;
  policyDetails: any; // Full policy object from API
  isLoading?: boolean;
};

// Reusable Detail Section Paper
const DetailSection = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) => (
  <Paper
    variant="outlined"
    sx={{
      p: 2,
      mb: 2,
      borderRadius: 2,
      bgcolor: (theme) => alpha(theme.palette.background.paper, 0.98),
      borderColor: 'divider',
    }}
  >
    <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 2 }}>
      <Box
        sx={{
          width: 28,
          height: 28,
          borderRadius: 0.75,
          bgcolor: 'background.neutral',
          color: 'text.secondary',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Iconify icon={icon} width={16} height={16} />
      </Box>
      <Typography variant="subtitle2" fontWeight={700} color="text.primary">
        {title}
      </Typography>
    </Stack>
    {children}
  </Paper>
);

const DetailField = ({
  label,
  value,
  secondary,
}: {
  label: string;
  value: React.ReactNode;
  secondary?: string;
}) => (
  <Box sx={{ mb: 0.5 }}>
    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
      {label}
    </Typography>
    <Typography
      variant="body2"
      fontWeight={600}
      color="text.primary"
      component="div"
      sx={{ overflowWrap: 'anywhere' }}
    >
      {value ?? '—'}
    </Typography>
    {secondary && (
      <Typography variant="caption" color="text.disabled" display="block">
        {secondary}
      </Typography>
    )}
  </Box>
);

const BooleanChip = ({ label, value }: { label: string; value?: boolean }) => (
  <Box sx={{ mb: 0.5 }}>
    <Typography
      variant="caption"
      color="text.secondary"
      display="block"
      sx={{ fontSize: '0.72rem', mb: 0.5 }}
    >
      {label}
    </Typography>
    <Label color={value ? 'success' : 'default'} sx={{ height: 22, fontSize: '0.7rem' }}>
      {value ? 'Yes / Enabled' : 'No / Disabled'}
    </Label>
  </Box>
);

const formatEnumValue = (val: string) => {
  if (!val) return '—';
  return val.replace(/([A-Z])/g, ' $1').trim();
};

export default function FinancePolicyDetailsDrawer({
  open,
  onClose,
  policy,
  policyDetails,
  isLoading = false,
}: FinancePolicyDetailsDrawerProps) {
  if (!policy) return null;

  const type = policy.policyType;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        backdrop: {
          sx: {
            bgcolor: (theme) => alpha(theme.palette.common.black, 0.32),
          },
        },
      }}
      PaperProps={{
        role: 'dialog',
        'aria-modal': true,
        'aria-labelledby': 'policy-details-title',
        sx: {
          width: { xs: '100%', sm: 'min(760px, 92vw)' },
          maxWidth: '100%',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          bgcolor: 'background.paper',
        }}
      >
        <FinancePolicyDrawerHeader
          title={policy.policyName}
          titleId="policy-details-title"
          description={`${formatEnumValue(policy.policyType)} policy · ${
            policy.academicYearName || 'Current academic year'
          }`}
          icon="solar:document-text-linear"
          onClose={onClose}
          badges={
            <>
              <Label
                color={
                  policy.status === 'Active' || policy.status === 'Published'
                    ? 'success'
                    : policy.status === 'Draft'
                      ? 'warning'
                      : 'default'
                }
              >
                {policy.status}
              </Label>
              {policy.version && <Label color="default">v{policy.version}</Label>}
            </>
          }
        />

        {/* Scrollable Content Body */}
        <Scrollbar sx={{ flex: 1, minHeight: 0 }}>
          <Box sx={{ p: { xs: 2, sm: 3 }, pb: 6 }}>
            {/* ── 1. General Information ── */}
            <DetailSection title="General Information" icon={GlobalIcons.notebook}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <DetailField label="Policy Name" value={policy.policyName} />
                </Grid>
                {type !== 'refund' && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <DetailField label="Policy Code" value={policy.policyCode || '—'} />
                  </Grid>
                )}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <DetailField label="Academic Year" value={policy.academicYearName || '—'} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ mb: 0.5 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      sx={{ fontSize: '0.72rem', mb: 0.25 }}
                    >
                      Default Selection
                    </Typography>
                    <Label color={policy.isDefault ? 'primary' : 'default'} sx={{ height: 22 }}>
                      {policy.isDefault ? 'Default Policy' : 'Standard Policy'}
                    </Label>
                  </Box>
                </Grid>
                {policy.effectiveFrom && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <DetailField
                      label="Effective From"
                      value={dayjs(policy.effectiveFrom).format('DD-MM-YYYY')}
                    />
                  </Grid>
                )}
                {policy.effectiveTo && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <DetailField
                      label="Effective To"
                      value={dayjs(policy.effectiveTo).format('DD-MM-YYYY')}
                    />
                  </Grid>
                )}
                <Grid size={{ xs: 12 }}>
                  <DetailField
                    label="Description"
                    value={policyDetails?.description || 'No description provided.'}
                  />
                </Grid>
              </Grid>
            </DetailSection>

            {/* Loading Indicator */}
            {isLoading ? (
              <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
                <Iconify
                  icon="line-md:loading-twotone-loop"
                  sx={{ width: 36, height: 36, color: 'primary.main', mb: 1.5 }}
                />
                <Typography variant="body2" color="text.secondary">
                  Loading policy configuration details...
                </Typography>
              </Stack>
            ) : !policyDetails ? (
              <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', borderRadius: 1.5 }}>
                <Typography variant="body2" color="text.secondary">
                  No detailed configuration found for this policy.
                </Typography>
              </Paper>
            ) : (
              <>
                {/* ── Collection Policy Specific Details ── */}
                {type === 'collection' && (
                  <>
                    <DetailSection title="Collection & Gateway Settings" icon="solar:card-bold">
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <DetailField
                            label="Grace Period"
                            value={`${policyDetails.gracePeriodDays ?? 0} days`}
                            secondary={`Type: ${policyDetails.gracePeriodType || 'Calendar'}`}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <BooleanChip
                            label="Online Gateway Collection"
                            value={policyDetails.allowOnlineCollection}
                          />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                          <BooleanChip
                            label="Consider As Operational Income"
                            value={policyDetails.considerAsIncome}
                          />
                        </Grid>
                        {policyDetails.considerAsIncome &&
                          policyDetails.lateFeeIncomeCategoryName && (
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <DetailField
                                label="Late Fee Income Category"
                                value={policyDetails.lateFeeIncomeCategoryName}
                              />
                            </Grid>
                          )}
                      </Grid>
                    </DetailSection>

                    <DetailSection title="Late Fee Accrual Rules" icon={GlobalIcons.receiptIcon}>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <BooleanChip
                            label="Late Fee Accrual"
                            value={policyDetails.enableLateFee}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <DetailField
                            label="Late Fee Formula Type"
                            value={formatEnumValue(policyDetails.lateFeeType || '—')}
                          />
                        </Grid>

                        {policyDetails.lateFeeType === 'Flat' && (
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <DetailField
                              label="Flat Late Fee Amount"
                              value={
                                policyDetails.flatAmount != null
                                  ? `₹${policyDetails.flatAmount}`
                                  : '—'
                              }
                            />
                          </Grid>
                        )}

                        {(policyDetails.lateFeeType === 'Percentage' ||
                          policyDetails.lateFeeType === 'Compound') && (
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <DetailField
                              label="Interest Rate"
                              value={
                                policyDetails.percentage != null
                                  ? `${policyDetails.percentage}%`
                                  : '—'
                              }
                              secondary={
                                policyDetails.percentageBase
                                  ? `Base: ${formatEnumValue(policyDetails.percentageBase)}`
                                  : undefined
                              }
                            />
                          </Grid>
                        )}

                        {policyDetails.lateFeeType === 'PerDay' && (
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <DetailField
                              label="Daily Amount"
                              value={
                                policyDetails.amountPerDay != null
                                  ? `₹${policyDetails.amountPerDay} / day`
                                  : '—'
                              }
                            />
                          </Grid>
                        )}
                        {policyDetails.lateFeeType === 'PerWeek' && (
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <DetailField
                              label="Weekly Amount"
                              value={
                                policyDetails.amountPerWeek != null
                                  ? `₹${policyDetails.amountPerWeek} / week`
                                  : '—'
                              }
                            />
                          </Grid>
                        )}
                        {policyDetails.lateFeeType === 'PerMonth' && (
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <DetailField
                              label="Monthly Amount"
                              value={
                                policyDetails.amountPerMonth != null
                                  ? `₹${policyDetails.amountPerMonth} / month`
                                  : '—'
                              }
                            />
                          </Grid>
                        )}

                        <Grid size={{ xs: 12, sm: 6 }}>
                          <DetailField
                            label="Maximum Late Fee Ceiling"
                            value={
                              policyDetails.maximumLateFeeAmount != null
                                ? `₹${policyDetails.maximumLateFeeAmount}`
                                : 'No ceiling (Uncapped)'
                            }
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <DetailField
                            label="Maximum Charging Days"
                            value={
                              policyDetails.maximumChargingDays != null
                                ? `${policyDetails.maximumChargingDays} days cutoff`
                                : 'No cutoff days'
                            }
                          />
                        </Grid>
                      </Grid>

                      {policyDetails.lateFeeType === 'Slab' && (
                        <Box sx={{ mt: 2.5 }}>
                          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                            Configured Escalation Slabs
                          </Typography>
                          {(policyDetails.escalationRules ?? []).length === 0 ? (
                            <Typography variant="caption" color="text.secondary">
                              No escalation slabs configured.
                            </Typography>
                          ) : (
                            <TableContainer
                              component={Paper}
                              variant="outlined"
                              sx={{ borderRadius: 1.5, overflow: 'hidden' }}
                            >
                              <Table size="small">
                                <TableHead>
                                  <TableRow
                                    sx={{
                                      bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
                                    }}
                                  >
                                    <TableCell sx={{ fontWeight: 700, fontSize: '11px', py: 0.75 }}>
                                      From Day
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 700, fontSize: '11px', py: 0.75 }}>
                                      To Day
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 700, fontSize: '11px', py: 0.75 }}>
                                      Calculation
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 700, fontSize: '11px', py: 0.75 }}>
                                      Charge Value
                                    </TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {(policyDetails.escalationRules as any[]).map((slab, i) => (
                                    <TableRow key={i}>
                                      <TableCell sx={{ fontSize: '12px', py: 0.75 }}>
                                        Day {slab.startDay}
                                      </TableCell>
                                      <TableCell sx={{ fontSize: '12px', py: 0.75 }}>
                                        {slab.endDay != null ? `Day ${slab.endDay}` : 'Open (∞)'}
                                      </TableCell>
                                      <TableCell sx={{ fontSize: '12px', py: 0.75 }}>
                                        {slab.calculationType}
                                      </TableCell>
                                      <TableCell
                                        sx={{ fontSize: '12px', fontWeight: 600, py: 0.75 }}
                                      >
                                        {slab.calculationType === 'Flat'
                                          ? `₹${slab.value}`
                                          : `${slab.value}%`}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          )}
                        </Box>
                      )}
                    </DetailSection>
                  </>
                )}

                {/* ── Payment Policy Details ── */}
                {type === 'payment' && (
                  <DetailSection title="Payment Behaviour & Modes" icon="mdi:cash-register">
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <BooleanChip
                          label="Allow Partial Payment"
                          value={policyDetails.allowPartialPayment}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <DetailField
                          label="Allocation Method"
                          value={formatEnumValue(policyDetails.allocationMethod)}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <DetailField
                          label="Minimum Payment Type"
                          value={formatEnumValue(policyDetails.minimumPaymentType)}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <DetailField
                          label="Minimum Payment Value"
                          value={
                            policyDetails.minimumPaymentValue != null
                              ? `₹${policyDetails.minimumPaymentValue}`
                              : '—'
                          }
                        />
                      </Grid>
                    </Grid>
                  </DetailSection>
                )}

                {/* ── Concession Policy Details (Enhanced) ── */}
                {type === 'concession' && (
                  <>
                    {/* Calculation Configuration */}
                    <DetailSection title="Calculation rules" icon="solar:tag-price-bold">
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <DetailField
                            label="Value Source"
                            value={concessionOptionLabel(
                              CONCESSION_VALUE_SOURCES,
                              policyDetails.valueSource
                            )}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <DetailField
                            label="Calculation Method"
                            value={concessionOptionLabel(
                              CONCESSION_METHODS,
                              policyDetails.calculationMethod
                            )}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <DetailField
                            label={
                              policyDetails.valueSource === 'PolicyFixed'
                                ? 'Configured Value'
                                : 'Maximum Allowed Ceiling'
                            }
                            value={concessionValueLabel(policyDetails)}
                          />
                        </Grid>
                      </Grid>
                    </DetailSection>

                    {/* Application Behaviour & Recalculation Scope */}
                    <DetailSection title="Application scope" icon="solar:shield-check-bold">
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <DetailField
                            label="Apply Concession On"
                            value={concessionOptionLabel(CONCESSION_SCOPES, policyDetails.applyOn)}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <DetailField
                            label="Fee Head Eligibility"
                            value="Configured per Fee Structure"
                            secondary="Attached when fee structure is assigned to students"
                          />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Paper
                            variant="outlined"
                            sx={{
                              p: 1.5,
                              bgcolor: (theme) => alpha(theme.palette.success.main, 0.04),
                              borderColor: (theme) => alpha(theme.palette.success.main, 0.2),
                              borderRadius: 1,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1.25,
                            }}
                          >
                            <Iconify
                              icon="solar:shield-check-bold"
                              width={18}
                              height={18}
                              sx={{ color: 'success.main', flexShrink: 0 }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {policyDetails.applyOn === 'AllFees'
                                ? 'Paid collections remain in history. Concessions on paid amounts create separate refund requests.'
                                : 'Only eligible unpaid balances are recalculated. Paid collections remain in history.'}
                            </Typography>
                          </Paper>
                        </Grid>
                      </Grid>
                    </DetailSection>

                    {/* Downstream Utilization & Audit Metadata */}
                    <DetailSection title="Usage and history" icon="solar:history-bold-duotone">
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <DetailField
                            label="Downstream Attachment"
                            value={
                              policy.isUsedInDownstream ? (
                                <Label color="info">Attached to Structures</Label>
                              ) : (
                                <Label color="default">Not Attached</Label>
                              )
                            }
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <DetailField
                            label="Active Version"
                            value={`Version ${policy.version || policyDetails.version || 1}`}
                          />
                        </Grid>
                        {(policy.updatedAt || policy.lastModificationTime) && (
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <DetailField
                              label="Last Modified"
                              value={policyDateTimeLabel(
                                policy.updatedAt || policy.lastModificationTime
                              )}
                              secondary={policy.updatedBy ? `By: ${policy.updatedBy}` : undefined}
                            />
                          </Grid>
                        )}
                        {(policy.creationTime || (policyDetails as any)?.creationTime) && (
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <DetailField
                              label="Created Date"
                              value={policyDateTimeLabel(
                                policy.creationTime || (policyDetails as any)?.creationTime
                              )}
                              secondary={
                                (policyDetails as any)?.creatorName ||
                                (policyDetails as any)?.createdBy
                                  ? `By: ${(policyDetails as any)?.creatorName || (policyDetails as any)?.createdBy}`
                                  : undefined
                              }
                            />
                          </Grid>
                        )}
                      </Grid>
                    </DetailSection>
                  </>
                )}

                {/* ── Refund Policy Details (Enhanced) ── */}
                {type === 'refund' && (
                  <>
                    {/* Scope & Eligibility */}
                    <DetailSection
                      title="Refund Scope & Eligibility"
                      icon="solar:shield-check-bold-duotone"
                    >
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <DetailField
                            label="Fee Head Scope"
                            value={
                              policyDetails.feeHeadScope === 'AllFeeHeads'
                                ? 'All Fee Heads Included'
                                : `${(policyDetails.applicableFeeHeadIds ?? []).length} Selected Fee Heads`
                            }
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <BooleanChip
                            label="Allow Partial Refund"
                            value={policyDetails.allowPartialRefund}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <BooleanChip
                            label="Include Paid Incidental Charges"
                            value={policyDetails.includePaidCharges}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <BooleanChip
                            label="Include Paid Late Fees"
                            value={policyDetails.includePaidLateFee}
                          />
                        </Grid>
                      </Grid>

                      {/* Fee Heads chip list if applicable */}
                      {policyDetails.feeHeadScope === 'SelectedFeeHeads' &&
                        (policyDetails.applicableFeeHeadIds ?? []).length > 0 && (
                          <Box
                            sx={{ mt: 2, pt: 1.5, borderTop: '1px dashed', borderColor: 'divider' }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              fontWeight={600}
                              display="block"
                              sx={{ mb: 1 }}
                            >
                              APPLICABLE FEE HEADS ({policyDetails.applicableFeeHeadIds.length})
                            </Typography>
                            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                              {(policyDetails.applicableFeeHeadIds as string[]).map((headId, i) => (
                                <Chip
                                  key={i}
                                  label={headId}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                  sx={{ height: 22, fontSize: '0.72rem' }}
                                />
                              ))}
                            </Stack>
                          </Box>
                        )}
                    </DetailSection>

                    {/* Calculation & Ceilings */}
                    <DetailSection
                      title="Refund Calculation & Ceilings"
                      icon="solar:calculator-minimalistic-bold-duotone"
                    >
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <DetailField
                            label="Amount Calculation Mode"
                            value={
                              policyDetails.amountMode === 'RemainingPaidAmount'
                                ? 'Entire Remaining Paid Amount (100%)'
                                : policyDetails.amountMode === 'ManualUpToEligible'
                                  ? 'Manual (Up to eligible balance)'
                                  : policyDetails.amountMode === 'Percentage'
                                    ? 'Percentage of Eligible Amount'
                                    : 'Fixed Amount'
                            }
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <DetailField
                            label="Configured Value / Rate"
                            value={
                              policyDetails.amountMode === 'Percentage'
                                ? `${policyDetails.percentageValue ?? 0}%`
                                : policyDetails.amountMode === 'FixedAmount'
                                  ? `₹${policyDetails.fixedAmount ?? 0}`
                                  : '100% Eligible Balance'
                            }
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <DetailField
                            label="Maximum Cap per Single Request"
                            value={
                              policyDetails.maximumPerRequest != null
                                ? `₹${policyDetails.maximumPerRequest.toLocaleString('en-IN')}`
                                : 'No per-request cap'
                            }
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <DetailField
                            label="Maximum Cap per Student / Year"
                            value={
                              policyDetails.maximumPerStudentYear != null
                                ? `₹${policyDetails.maximumPerStudentYear.toLocaleString('en-IN')}`
                                : 'No cumulative student cap'
                            }
                            secondary="Enforced across all processed and reserved refunds"
                          />
                        </Grid>
                      </Grid>
                    </DetailSection>

                    {/* Deductions & Payout Methods */}
                    <DetailSection
                      title="Deductions & Allowed Disbursement"
                      icon="solar:tag-price-bold-duotone"
                    >
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <DetailField
                            label="Administrative Deduction Rule"
                            value={
                              policyDetails.deductionType === 'None' || !policyDetails.deductionType
                                ? 'No Deductions (0%)'
                                : policyDetails.deductionType === 'Percentage'
                                  ? `${policyDetails.deductionValue}% Deduction`
                                  : `₹${policyDetails.deductionValue} Fixed Deduction`
                            }
                          />
                        </Grid>
                        {policyDetails.deductionType && policyDetails.deductionType !== 'None' && (
                          <>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <DetailField
                                label="Maximum Deduction Ceiling"
                                value={
                                  policyDetails.maximumDeduction != null
                                    ? `₹${policyDetails.maximumDeduction.toLocaleString('en-IN')}`
                                    : 'No deduction ceiling'
                                }
                              />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                              <DetailField
                                label="Deduction Justification"
                                value={
                                  policyDetails.deductionExplanation ||
                                  'Standard administrative fee'
                                }
                              />
                            </Grid>
                          </>
                        )}
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <DetailField
                            label="Operational Processing SLA"
                            value={
                              policyDetails.processingTargetDays != null
                                ? `${policyDetails.processingTargetDays} days turnaround`
                                : '—'
                            }
                          />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Box sx={{ mb: 0.5 }}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              display="block"
                              sx={{ fontSize: '0.72rem', mb: 0.5 }}
                            >
                              Permitted Payout Channels
                            </Typography>
                            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                              {(policyDetails.allowedPayoutMethods ?? ['Cash']).map(
                                (method: string, i: number) => (
                                  <Chip
                                    key={i}
                                    label={method}
                                    size="small"
                                    color="info"
                                    variant="outlined"
                                    sx={{ height: 24, fontSize: '0.75rem', fontWeight: 600 }}
                                  />
                                )
                              )}
                            </Stack>
                          </Box>
                        </Grid>
                      </Grid>
                    </DetailSection>

                    {/* Guarantees & Settlement Callout */}
                    <DetailSection
                      title="Settlement Guarantees & Constraints"
                      icon="solar:shield-check-bold"
                    >
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }}>
                          <Paper
                            variant="outlined"
                            sx={{
                              p: 1.5,
                              bgcolor: (theme) => alpha(theme.palette.info.main, 0.04),
                              borderColor: (theme) => alpha(theme.palette.info.main, 0.2),
                              borderRadius: 1.25,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1.25,
                            }}
                          >
                            <Iconify
                              icon="solar:shield-check-bold"
                              width={20}
                              height={20}
                              sx={{ color: 'info.main', flexShrink: 0 }}
                            />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ fontSize: '0.74rem' }}
                            >
                              <strong>Settled Money Only Invariant:</strong> Refunds can only be
                              created from verified settled money. Prior processed refunds and
                              active reservations are permanently subtracted from the eligible base
                              before calculating payout amounts.
                            </Typography>
                          </Paper>
                        </Grid>
                      </Grid>
                    </DetailSection>

                    {/* Audit Metadata */}
                    <DetailSection title="Version & Audit Trail" icon="solar:history-bold-duotone">
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <DetailField
                            label="Active Policy Version"
                            value={`Version ${policy.version || policyDetails.version || 1}`}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <DetailField
                            label="Downstream Fee Structure Attachment"
                            value={
                              policy.isUsedInDownstream || policyDetails.isUsedInDownstream ? (
                                <Label color="info" sx={{ height: 22 }}>
                                  Attached to Fee Structures
                                </Label>
                              ) : (
                                <Label color="default" sx={{ height: 22 }}>
                                  Not Attached
                                </Label>
                              )
                            }
                          />
                        </Grid>
                        {(policy.updatedAt ||
                          policy.lastModificationTime ||
                          (policyDetails as any)?.lastModificationTime) && (
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <DetailField
                              label="Last Modified"
                              value={dayjs(
                                policy.updatedAt ||
                                  policy.lastModificationTime ||
                                  (policyDetails as any)?.lastModificationTime
                              ).format('DD-MM-YYYY hh:mm A')}
                              secondary={
                                policy.updatedBy || (policyDetails as any)?.lastModifierName
                                  ? `By: ${policy.updatedBy || (policyDetails as any)?.lastModifierName}`
                                  : undefined
                              }
                            />
                          </Grid>
                        )}
                        {(policy.creationTime || (policyDetails as any)?.creationTime) && (
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <DetailField
                              label="Created Date"
                              value={dayjs(
                                policy.creationTime || (policyDetails as any)?.creationTime
                              ).format('DD-MM-YYYY hh:mm A')}
                              secondary={
                                (policyDetails as any)?.creatorName ||
                                (policyDetails as any)?.createdBy
                                  ? `By: ${(policyDetails as any)?.creatorName || (policyDetails as any)?.createdBy}`
                                  : undefined
                              }
                            />
                          </Grid>
                        )}
                      </Grid>
                    </DetailSection>
                  </>
                )}

                {/* ── Proration Policy Details (Enhanced) ── */}
                {type === 'proration' && (
                  <>
                    {/* Strategy & Overview */}
                    <DetailSection
                      title="Proration Strategy & Scope"
                      icon="solar:calculator-bold-duotone"
                    >
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <DetailField
                            label="Default Academic Policy"
                            value={
                              <Label
                                color={
                                  policyDetails.isDefault || policy.isDefault
                                    ? 'primary'
                                    : 'default'
                                }
                                sx={{ height: 22 }}
                              >
                                {policyDetails.isDefault || policy.isDefault
                                  ? 'Default Policy'
                                  : 'Standard Policy'}
                              </Label>
                            }
                            secondary="Assigned to new fee structures by default"
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <DetailField
                            label="Downstream Attachment"
                            value={
                              policy.isUsedInDownstream || policyDetails.isUsedInDownstream ? (
                                <Label color="info" sx={{ height: 22 }}>
                                  Attached to Fee Structures
                                </Label>
                              ) : (
                                <Label color="default" sx={{ height: 22 }}>
                                  Not Attached
                                </Label>
                              )
                            }
                            secondary={
                              policy.isUsedInDownstream
                                ? 'Active in student demand calculations'
                                : undefined
                            }
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <DetailField
                            label="Total Fee Heads"
                            value={`${(policyDetails.feeHeadRules ?? []).length} fee heads`}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <DetailField
                            label="Active Proration Rules"
                            value={
                              <Label color="primary" sx={{ height: 22 }}>
                                {
                                  (
                                    (policyDetails.feeHeadRules ?? []) as IProrationPolicyRule[]
                                  ).filter(hasActiveProration).length
                                }{' '}
                                Prorated Fee Head(s)
                              </Label>
                            }
                          />
                        </Grid>
                      </Grid>
                    </DetailSection>

                    {/* Fee Head Rules Table */}
                    <DetailSection
                      title="Fee Head Proration Rules"
                      icon="solar:widget-bold-duotone"
                    >
                      {(policyDetails.feeHeadRules ?? []).length === 0 ? (
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 3,
                            textAlign: 'center',
                            borderRadius: 1.5,
                            borderStyle: 'dashed',
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            No fee head rules configured in this proration policy.
                          </Typography>
                        </Paper>
                      ) : (
                        <TableContainer
                          component={Paper}
                          variant="outlined"
                          sx={{ borderRadius: 1.5 }}
                        >
                          <Table size="small" sx={{ minWidth: 620 }}>
                            <TableHead>
                              <TableRow>
                                {['Fee Head', 'Admission', 'Early Withdrawal'].map((label) => (
                                  <TableCell key={label} sx={{ fontWeight: 700 }}>
                                    {label}
                                  </TableCell>
                                ))}
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {(policyDetails.feeHeadRules as IProrationPolicyRule[]).map(
                                (rule) => (
                                  <TableRow key={rule.feeHeadId}>
                                    <TableCell sx={{ fontWeight: 600 }}>
                                      {rule.feeHeadName || rule.feeHeadId}
                                    </TableCell>
                                    <TableCell>
                                      <ProrationEventDetail rule={rule} />
                                    </TableCell>
                                    <TableCell>
                                      <ProrationEventDetail rule={rule} withdrawal />
                                    </TableCell>
                                  </TableRow>
                                )
                              )}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )}
                    </DetailSection>

                    {/* Zero Refund & Demand Guarantee Callout */}
                    <DetailSection
                      title="Application Guarantees & Constraints"
                      icon="solar:shield-check-bold"
                    >
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }}>
                          <Paper
                            variant="outlined"
                            sx={{
                              p: 1.5,
                              bgcolor: (theme) => alpha(theme.palette.info.main, 0.04),
                              borderColor: (theme) => alpha(theme.palette.info.main, 0.2),
                              borderRadius: 1.25,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1.25,
                            }}
                          >
                            <Iconify
                              icon="solar:shield-check-bold"
                              width={20}
                              height={20}
                              sx={{ color: 'info.main', flexShrink: 0 }}
                            />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ fontSize: '0.74rem' }}
                            >
                              <strong>Demand Generation Only:</strong> Proration policies strictly
                              compute initial demand amounts using admission and available
                              withdrawal dates. They never adjust historical ledger entries,
                              existing receipts, or posted student transactions.
                            </Typography>
                          </Paper>
                        </Grid>
                      </Grid>
                    </DetailSection>

                    {/* Audit Metadata */}
                    <DetailSection title="Version & Audit Trail" icon="solar:history-bold-duotone">
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <DetailField
                            label="Active Policy Version"
                            value={`Version ${policy.version || policyDetails.version || 1}`}
                          />
                        </Grid>
                        {(policy.updatedAt ||
                          policy.lastModificationTime ||
                          (policyDetails as any)?.lastModificationTime) && (
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <DetailField
                              label="Last Modified"
                              value={dayjs(
                                policy.updatedAt ||
                                  policy.lastModificationTime ||
                                  (policyDetails as any)?.lastModificationTime
                              ).format('DD-MM-YYYY hh:mm A')}
                              secondary={
                                policy.updatedBy || (policyDetails as any)?.lastModifierName
                                  ? `By: ${policy.updatedBy || (policyDetails as any)?.lastModifierName}`
                                  : undefined
                              }
                            />
                          </Grid>
                        )}
                        {(policy.creationTime || (policyDetails as any)?.creationTime) && (
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <DetailField
                              label="Created Date"
                              value={dayjs(
                                policy.creationTime || (policyDetails as any)?.creationTime
                              ).format('DD-MM-YYYY hh:mm A')}
                              secondary={
                                (policyDetails as any)?.creatorName ||
                                (policyDetails as any)?.createdBy
                                  ? `By: ${(policyDetails as any)?.creatorName || (policyDetails as any)?.createdBy}`
                                  : undefined
                              }
                            />
                          </Grid>
                        )}
                      </Grid>
                    </DetailSection>
                  </>
                )}
              </>
            )}
          </Box>
        </Scrollbar>

        {/* Footer */}
        <Box
          sx={{
            px: { xs: 2, sm: 3 },
            py: 1.5,
            bgcolor: 'background.paper',
            borderTop: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'flex-end',
            flexShrink: 0,
          }}
        >
          <Button
            variant="outlined"
            size="small"
            color="inherit"
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
