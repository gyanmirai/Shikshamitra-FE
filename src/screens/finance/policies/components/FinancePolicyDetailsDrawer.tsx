'use client';

import React from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Box, Grid, Chip, Stack, Drawer, Button, Divider, Typography } from '@mui/material';

import type { IFinancePolicyRow } from '../types/finance-policy.types';

type FinancePolicyDetailsDrawerProps = {
  open: boolean;
  onClose: () => void;
  policy: IFinancePolicyRow | null;
  policyDetails: any; // Full policy object from API
  isLoading?: boolean;
};

export default function FinancePolicyDetailsDrawer({
  open,
  onClose,
  policy,
  policyDetails,
  isLoading = false,
}: FinancePolicyDetailsDrawerProps) {
  if (!policy) return null;

  const renderSectionHeader = (title: string, icon: string) => (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2, mt: 1 }}>
      <Iconify icon={icon} sx={{ width: 20, height: 20, color: 'primary.main' }} />
      <Typography variant="subtitle2" fontWeight={700} color="text.primary">
        {title}
      </Typography>
    </Stack>
  );

  const renderField = (label: string, value: React.ReactNode) => (
    <Box sx={{ mb: 1.5 }}>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600} color="text.primary">
        {value ?? '-'}
      </Typography>
    </Box>
  );

  const renderBooleanChip = (label: string, value: boolean) => (
    <Box sx={{ mb: 1.5 }}>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
        {label}
      </Typography>
      <Chip
        label={value ? 'Yes' : 'No'}
        size="small"
        color={value ? 'success' : 'default'}
        variant="outlined"
      />
    </Box>
  );

  const formatEnumValue = (val: string) => {
    if (!val) return '-';
    return val.replace(/([A-Z])/g, ' $1').trim();
  };

  // ── Render dynamic fields based on policyType ────────────────────────────────

  const renderPolicySpecificDetails = () => {
    if (!policyDetails) {
      return (
        <Typography variant="body2" color="text.secondary">
          No detailed configurations available.
        </Typography>
      );
    }

    const type = policy.policyType;

    switch (type) {
      case 'payment':
        return (
          <>
            {renderSectionHeader('Payment Behaviour & Modes', 'mdi:cash-register')}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                {renderBooleanChip('Allow Partial Payment', policyDetails.allowPartialPayment)}
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                {renderField(
                  'Minimum Payment Type',
                  formatEnumValue(policyDetails.minimumPaymentType)
                )}
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                {renderField(
                  'Minimum Payment Value',
                  policyDetails.minimumPaymentValue != null
                    ? `₹${policyDetails.minimumPaymentValue}`
                    : '-'
                )}
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                {renderField('Allocation Method', formatEnumValue(policyDetails.allocationMethod))}
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                {renderBooleanChip('Allow Advance Payment', policyDetails.advancePaymentAllowed)}
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                {renderField(
                  'Receipt Generation Mode',
                  formatEnumValue(policyDetails.receiptGeneration)
                )}
              </Grid>
            </Grid>

            <Divider sx={{ my: 2.5 }} />

            {renderSectionHeader('Demand & Reminder Configurations', 'mdi:bell-ring-outline')}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                {renderBooleanChip('Auto Demand Generation', policyDetails.autoDemand)}
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                {renderField(
                  'Demand Generation Days Before',
                  policyDetails.demandGenerationDaysBefore
                    ? `${policyDetails.demandGenerationDaysBefore} days`
                    : '-'
                )}
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                {renderBooleanChip('Demand Auto Approve', policyDetails.demandAutoApprove)}
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                {renderBooleanChip('Auto Reminder', policyDetails.autoReminder)}
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                {renderField(
                  'Reminder Days Before',
                  policyDetails.reminderDaysBefore
                    ? `${policyDetails.reminderDaysBefore} days`
                    : '-'
                )}
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                {renderField(
                  'Reminder Frequency',
                  policyDetails.reminderFrequencyDays
                    ? `Every ${policyDetails.reminderFrequencyDays} days`
                    : '-'
                )}
              </Grid>
            </Grid>
          </>
        );

      case 'late-fee':
        return (
          <>
            {renderSectionHeader('Late Fee Configurations', 'mdi:clock-alert-outline')}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                {renderField(
                  'Late Fee Calculation Type',
                  formatEnumValue(policyDetails.calculationType)
                )}
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                {renderField('Grace Period Days', `${policyDetails.gracePeriodDays ?? 0} days`)}
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                {renderField('Grace Period Type', policyDetails.gracePeriodType || '-')}
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                {renderField(
                  'Max Late Fee Amount',
                  policyDetails.maximumLateFeeAmount
                    ? `₹${policyDetails.maximumLateFeeAmount}`
                    : 'No Limit'
                )}
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                {renderBooleanChip('Compound Late Fee', policyDetails.compoundLateFee)}
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                {renderField(
                  'Round Off Method',
                  formatEnumValue(policyDetails.roundOffMethod || 'None')
                )}
              </Grid>
            </Grid>

            {policyDetails.escalationRules && policyDetails.escalationRules.length > 0 && (
              <>
                <Divider sx={{ my: 2.5 }} />
                {renderSectionHeader('Escalation Rules (Slabs)', 'mdi:trending-up')}
                <Stack spacing={1.5}>
                  {policyDetails.escalationRules.map((rule: any, index: number) => (
                    <Box
                      key={index}
                      sx={{
                        p: 1.5,
                        borderRadius: 1,
                        bgcolor: 'background.neutral',
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Grid container spacing={1}>
                        <Grid size={{ xs: 4 }}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Days Range
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            Day {rule.startDay} to {rule.endDay || '∞'}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 4 }}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Calculation
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {rule.calculationType}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 4 }}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Value
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {rule.calculationType === 'Percentage'
                              ? `${rule.value}%`
                              : `₹${rule.value}`}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                </Stack>
              </>
            )}
          </>
        );

      case 'concession':
        return (
          <>
            {renderSectionHeader('Concession Rules & Discount', 'mdi:percent-outline')}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                {renderField('Eligibility Type', formatEnumValue(policyDetails.eligibilityType))}
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                {renderField('Discount Type', formatEnumValue(policyDetails.discountType))}
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                {renderField(
                  'Discount Value',
                  policyDetails.discountType === 'Percentage'
                    ? `${policyDetails.discountValue}%`
                    : `₹${policyDetails.discountValue}`
                )}
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                {renderField(
                  'Max Discount Amount',
                  policyDetails.maximumDiscountAmount
                    ? `₹${policyDetails.maximumDiscountAmount}`
                    : 'No Limit'
                )}
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                {renderBooleanChip('Allow Stacking', policyDetails.allowStacking)}
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                {renderField('Max Stacking Count', policyDetails.maximumStackingCount ?? '-')}
              </Grid>
            </Grid>

            {policyDetails.discountRules && policyDetails.discountRules.length > 0 && (
              <>
                <Divider sx={{ my: 2.5 }} />
                {renderSectionHeader('Discount Breakdown per Fee Head', 'mdi:format-list-bulleted')}
                <Stack spacing={1.5}>
                  {policyDetails.discountRules.map((rule: any, index: number) => (
                    <Box
                      key={index}
                      sx={{
                        p: 1.5,
                        borderRadius: 1,
                        bgcolor: 'background.neutral',
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Grid container spacing={1}>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Fee Head
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {rule.feeHeadName || rule.feeHeadId || '-'}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Discount
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {rule.discountType === 'Percentage'
                              ? `${rule.discountValue}%`
                              : `₹${rule.discountValue}`}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                </Stack>
              </>
            )}
          </>
        );

      case 'refund':
        return (
          <>
            {renderSectionHeader('Refund Options & Rules', 'mdi:cash-refund')}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                {renderField('Refund Method', formatEnumValue(policyDetails.refundMethod || 'Any'))}
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                {renderField('Processing Days', `${policyDetails.processingDays ?? 0} days`)}
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                {renderBooleanChip('Allow Partial Refund', policyDetails.allowPartialRefund)}
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                {renderBooleanChip('Bank Details Required', policyDetails.bankDetailsRequired)}
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                {renderField(
                  'Max Refund Percentage',
                  policyDetails.maxRefundPercentage ? `${policyDetails.maxRefundPercentage}%` : '-'
                )}
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                {renderField(
                  'Max Refund Amount',
                  policyDetails.maxRefundAmount ? `₹${policyDetails.maxRefundAmount}` : '-'
                )}
              </Grid>
            </Grid>

            {policyDetails.deductionRules && policyDetails.deductionRules.length > 0 && (
              <>
                <Divider sx={{ my: 2.5 }} />
                {renderSectionHeader(
                  'Deduction Rules (Late Cancellations)',
                  'mdi:calculator-variant-outline'
                )}
                <Stack spacing={1.5}>
                  {policyDetails.deductionRules.map((rule: any, index: number) => (
                    <Box
                      key={index}
                      sx={{
                        p: 1.5,
                        borderRadius: 1,
                        bgcolor: 'background.neutral',
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Grid container spacing={1}>
                        <Grid size={{ xs: 4 }}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Canceled After
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {rule.afterDays} days
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 4 }}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Deduction Type
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {rule.deductionType}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 4 }}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Deduction Value
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {rule.deductionType === 'Percentage'
                              ? `${rule.deductionValue}%`
                              : `₹${rule.deductionValue}`}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                </Stack>
              </>
            )}
          </>
        );

      case 'collection':
        return (
          <>
            {renderSectionHeader('Collection & Waiver Configurations', 'mdi:wallet-giftcard')}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                {renderField('Grace Period Days', `${policyDetails.gracePeriodDays ?? 0} days`)}
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                {renderBooleanChip('Allow Online Collection', policyDetails.allowOnlineCollection)}
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                {renderBooleanChip('Enable Late Fee', policyDetails.enableLateFee)}
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                {renderField('Late Fee Type', formatEnumValue(policyDetails.lateFeeType || '-'))}
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                {renderField(
                  'Rounding Method',
                  formatEnumValue(policyDetails.roundingMethod || 'None')
                )}
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                {renderBooleanChip('Consider As Income', policyDetails.considerAsIncome)}
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                {renderBooleanChip('Enable Waiver', policyDetails.enableWaiver)}
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                {renderField(
                  'Max Waiver Percentage',
                  policyDetails.maximumWaiverPercentage
                    ? `${policyDetails.maximumWaiverPercentage}%`
                    : '-'
                )}
              </Grid>
            </Grid>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 'min(600px, 90vw)' },
          maxWidth: '100%',
        },
      }}
    >
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
          <Typography variant="h6" fontWeight={700}>
            Policy Details
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={onClose}
            startIcon={<Iconify icon="mdi:close" />}
          >
            Close
          </Button>
        </Stack>

        <Divider />

        <Box sx={{ flex: 1, overflowY: 'auto', mt: 2.5, pr: 0.5 }}>
          {/* General policy info */}
          {renderSectionHeader('General Information', 'mdi:information-outline')}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>{renderField('Policy Name', policy.policyName)}</Grid>
            <Grid size={{ xs: 12, sm: 6 }}>{renderField('Policy Code', policy.policyCode)}</Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              {renderField('Academic Year', policy.academicYearName)}
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ mb: 1.5 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  sx={{ mb: 0.5 }}
                >
                  Status
                </Typography>
                <Label
                  color={
                    policy.status === 'Active' || policy.status === 'Published'
                      ? 'success'
                      : policy.status === 'Draft'
                        ? 'warning'
                        : policy.status === 'Inactive'
                          ? 'error'
                          : 'default'
                  }
                >
                  {policy.status}
                </Label>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              {renderField(
                'Effective From',
                policy.effectiveFrom
                  ? new Date(policy.effectiveFrom).toLocaleDateString('en-IN')
                  : '-'
              )}
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              {renderField(
                'Effective To',
                policy.effectiveTo ? new Date(policy.effectiveTo).toLocaleDateString('en-IN') : '-'
              )}
            </Grid>
            <Grid size={{ xs: 12 }}>
              {renderField('Description', policyDetails?.description || '-')}
            </Grid>
          </Grid>

          <Divider sx={{ my: 2.5 }} />

          {/* Dynamic properties of the policy */}
          {isLoading ? (
            <Stack alignItems="center" sx={{ py: 5 }}>
              <Iconify
                icon="line-md:loading-twotone-loop"
                sx={{ width: 32, height: 32, color: 'primary.main' }}
              />
            </Stack>
          ) : (
            renderPolicySpecificDetails()
          )}
        </Box>
      </Box>
    </Drawer>
  );
}
