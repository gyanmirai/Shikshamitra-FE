'use client';

import type { ReactNode } from 'react';

import dayjs from 'dayjs';
import { useId } from 'react';
import { Label } from 'src/components/label';
import { alpha } from '@mui/material/styles';
import { GlobalIcons } from 'src/utils/icons';
import { Scrollbar } from 'src/components/scrollbar';
import { formatNumber } from 'src/utils/formate_number';
import { DefaultIndicator } from 'src/screens/finance/components/DefaultIndicator';
import { DetailGrid, DetailField, DetailSection } from 'src/screens/finance/components/detail-view';
import {
  Box,
  Grid,
  Chip,
  Stack,
  Paper,
  Alert,
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

import FinancePolicySkeleton from './FinancePolicySkeleton';
import FinancePolicyDrawerHeader from './FinancePolicyDrawerHeader';
import { ProrationEventDetail } from './proration/ProrationEventDetail';
import CollectionPolicyDetails from './collection/CollectionPolicyDetails';
import {
  CONCESSION_SCOPES,
  CONCESSION_METHODS,
  concessionValueLabel,
  concessionOptionLabel,
  CONCESSION_VALUE_SOURCES,
} from './concession/concessionPresentation';

import type { IFinancePolicyRow, IProrationPolicyRule } from '../types/finance-policy.types';

type FinancePolicyDetailsProps = {
  policy: IFinancePolicyRow | null;
  policyDetails: any; // Full policy object from API
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  errorMessage?: string;
  savedVersionDetails?: ReactNode;
  showVersionBadge?: boolean;
  presentation?: 'standard' | 'feeStructure';
};

type FinancePolicyDetailsDrawerProps = FinancePolicyDetailsProps & {
  open: boolean;
  onClose: () => void;
};

const BooleanChip = ({ label, value }: { label: string; value?: boolean }) => (
  <DetailField
    label={label}
    value={
      <Label color={value ? 'success' : 'default'} sx={{ height: 22 }}>
        {value ? 'Yes / Enabled' : 'No / Disabled'}
      </Label>
    }
  />
);

const formatEnumValue = (val: string) => {
  if (!val) return '—';
  return val.replace(/([A-Z])/g, ' $1').trim();
};

export default function FinancePolicyDetailsDrawer({
  open,
  onClose,
  ...details
}: FinancePolicyDetailsDrawerProps) {
  const titleId = useId();
  if (!details.policy) return null;

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
        'aria-labelledby': titleId,
        sx: {
          width: { xs: '100%', sm: 'min(760px, 92vw)' },
          maxWidth: '100%',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        },
      }}
    >
      <FinancePolicyDetails
        {...details}
        onClose={onClose}
        drawerTitleId={titleId}
        isRefundPolicyDrawer={details.policy.policyType === 'refund'}
      />
    </Drawer>
  );
}

export function FinancePolicyDetails({
  policy,
  policyDetails,
  isLoading = false,
  isError = false,
  onRetry,
  errorMessage = 'Unable to load this policy. Retry to view its saved configuration.',
  savedVersionDetails,
  showVersionBadge,
  presentation = 'standard',
  isRefundPolicyDrawer = false,
  onClose,
  drawerTitleId,
}: FinancePolicyDetailsProps & {
  onClose?: () => void;
  drawerTitleId?: string;
  isRefundPolicyDrawer?: boolean;
}) {
  const titleId = useId();
  if (!policy) return null;

  const type = policy.policyType;
  const feeStructure = presentation === 'feeStructure';
  const useFormLayout = type === 'collection' || type === 'proration';
  const displayVersion = !feeStructure && !isRefundPolicyDrawer && (showVersionBadge ?? type === 'payment');
  const version =
    type === 'concession'
      ? policy.version || policyDetails?.version || 1
      : (policyDetails?.version ?? policy.version);
  const showVersionInGeneral =
    !feeStructure && !displayVersion && (type === 'concession' || useFormLayout) && policyDetails && version != null;
  const descriptionField = (
    <DetailField
      fullWidth={!feeStructure && type !== 'refund'}
      label="Description"
      value={policyDetails?.description || 'No description provided.'}
    />
  );

  const Content = onClose ? Scrollbar : Box;
  return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: onClose ? '100%' : undefined,
          bgcolor: 'background.paper',
        }}
      >
        <FinancePolicyDrawerHeader
          helpText="Review this policy's saved settings."
          description={`${formatEnumValue(policy.policyType)} policy · ${
            policy.academicYearName || 'Current academic year'
          }`}
          title={policy.policyName}
          titleAdornment={feeStructure && policy.isDefault ? <DefaultIndicator label="Default policy" /> : undefined}
          titleId={drawerTitleId ?? titleId}

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
              {displayVersion && policy.version && (
                <Label color="default">v{policy.version}</Label>
              )}
            </>
          }
        />

        {/* Scrollable Content Body */}
        <Content sx={{ flex: 1, minHeight: 0 }}>
          <Box sx={{ p: 2, pb: 2 }}>
            {isLoading ? (
              <FinancePolicySkeleton label="Loading policy configuration" />
            ) : isError ? (
              <Alert
                severity="error"
                action={
                  onRetry && (
                    <Button color="inherit" size="small" onClick={onRetry}>
                      Retry
                    </Button>
                  )
                }
              >
                {errorMessage}
              </Alert>
            ) : savedVersionDetails != null ? (
              savedVersionDetails
            ) : (
              <>
                {/* ── 1. General Information ── */}
                <DetailSection
                  helpText="The policy name, academic year, and general settings."
                  sx={{ mb: 2 }}
                  title="General Information"

                  icon={GlobalIcons.notebook}
                >
                  <DetailGrid desktopMinWidth={feeStructure ? 440 : undefined}>
                    <DetailField label="Policy name" value={
                      feeStructure ? (
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <span>{policy.policyName}</span>
                          {policy.isDefault && <DefaultIndicator label="Default policy" />}
                        </Stack>
                      ) : policy.policyName
                    } />
                    {type === 'payment' && (
                      <DetailField label="Policy code" value={policy.policyCode || '—'} />
                    )}
                    <DetailField label="Academic year" value={policy.academicYearName || '—'} />
                    {type === 'refund' && descriptionField}
                    {!feeStructure && type !== 'refund' && (
                      <DetailField
                        label="Default selection"
                        value={
                          <Label color={policy.isDefault ? 'primary' : 'default'} sx={{ height: 22 }}>
                            {policy.isDefault ? 'Default Policy' : 'Standard Policy'}
                          </Label>
                        }
                      />
                    )}
                    {!useFormLayout && policy.effectiveFrom && (
                      <DetailField
                        label="Effective from"
                        value={dayjs(policy.effectiveFrom).format('DD-MM-YYYY')}
                      />
                    )}
                    {!useFormLayout && policy.effectiveTo && (
                      <DetailField
                        label="Effective to"
                        value={dayjs(policy.effectiveTo).format('DD-MM-YYYY')}
                      />
                    )}
                    {showVersionInGeneral ? (
                      <Box sx={{ gridColumn: '1 / -1' }}>
                        <DetailGrid>
                          <DetailField
                            label={
                              type === 'concession' || policy.status === 'Active'
                                ? 'Active version'
                                : 'Version'
                            }
                            value={`Version ${version}`}
                          />
                          <Box sx={{ '@container (min-width: 440px)': { gridColumn: '2 / -1' } }}>
                            {descriptionField}
                          </Box>
                        </DetailGrid>
                      </Box>
                    ) : (
                      type !== 'refund' && descriptionField
                    )}
                  </DetailGrid>
                </DetailSection>

                {/* Loading Indicator */}
                {isLoading ? (
                  <FinancePolicySkeleton label="Loading policy configuration" />
                ) : !policyDetails ? (
                  <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', borderRadius: 1.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      No detailed configuration found for this policy.
                    </Typography>
                  </Paper>
                ) : (
                  <>
                    {/* ── Collection Policy Specific Details ── */}
                    {type === 'collection' && <CollectionPolicyDetails policy={policyDetails} presentation={presentation} />}

                    {/* ── Payment Policy Details ── */}
                    {type === 'payment' && (
                      <DetailSection
                        helpText="Allowed payment methods and any minimum payment requirements."
                        sx={{ mb: 2 }}
                        title="Payment Behaviour & Modes"

                        icon="mdi:cash-register"
                      >
                        <Grid container spacing={1.5}>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <BooleanChip
                              label="Allow partial payment"
                              value={policyDetails.allowPartialPayment}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <DetailField
                              label="Allocation method"
                              value={formatEnumValue(policyDetails.allocationMethod)}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <DetailField
                              label="Minimum payment type"
                              value={formatEnumValue(policyDetails.minimumPaymentType)}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <DetailField
                              label="Minimum payment value"
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
                        <DetailSection
                          helpText="The source of the concession value and the method used to calculate it."
                          sx={{ mb: 2 }}
                          title="Calculation Rules"

                          icon="solar:tag-price-bold"
                        >
                          <Grid container spacing={1.5}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <DetailField
                                label="Value source"
                                value={concessionOptionLabel(
                                  CONCESSION_VALUE_SOURCES,
                                  policyDetails.valueSource
                                )}
                              />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <DetailField
                                label="Calculation method"
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
                        <DetailSection
                          helpText="The installments covered by this policy and how refunds are initiated for paid concessions."
                          sx={{ mb: 2 }}
                          title="Application Scope"

                          icon="solar:shield-check-bold"
                        >
                          <Grid container spacing={1.5}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <DetailField
                                label="Apply concession on"
                                value={concessionOptionLabel(
                                  CONCESSION_SCOPES,
                                  policyDetails.applyOn
                                )}
                              />
                            </Grid>
                            {policyDetails.applyOn === 'AllFees' && (
                              <Grid size={{ xs: 12, sm: 6 }}>
                                <BooleanChip
                                  label="Automatically create refund requests on concession approval"
                                  value={policyDetails.autoCreateRefund ?? true}
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
                          helpText="Which fee heads, paid charges, and late fees can be included in a refund."
                          sx={{ mb: 2 }}
                          title="Refund Scope & Eligibility"

                          icon="solar:shield-check-bold-duotone"
                        >
                          <Grid container spacing={1.5}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <DetailField
                                label="Fee head scope"
                                value={
                                  policyDetails.feeHeadScope === 'AllFeeHeads'
                                    ? 'All Fee Heads Included'
                                    : `${(policyDetails.applicableFeeHeadIds ?? []).length} Selected Fee Heads`
                                }
                              />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <BooleanChip
                                label="Include paid incidental charges"
                                value={policyDetails.includePaidCharges}
                              />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <BooleanChip
                                label="Include paid late fees"
                                value={policyDetails.includePaidLateFee}
                              />
                            </Grid>
                          </Grid>

                          {/* Fee Heads chip list if applicable */}
                          {policyDetails.feeHeadScope === 'SelectedFeeHeads' &&
                            (policyDetails.applicableFeeHeadIds ?? []).length > 0 && (
                              <Box
                                sx={{
                                  mt: 2,
                                  pt: 1.5,
                                  borderTop: '1px dashed',
                                  borderColor: 'divider',
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  display="block"
                                  sx={{ mb: 1 }}
                                >
                                  Applicable fee heads ({policyDetails.applicableFeeHeadIds.length})
                                </Typography>
                                <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                                  {(policyDetails.applicableFeeHeadIds as string[]).map(
                                    (headId) => (
                                      <Chip
                                        key={headId}
                                        label={`${policyDetails.feeHeadNames?.[headId] || 'Fee head name unavailable'}${
                                          policyDetails.feeHeadStatuses?.[headId] &&
                                          policyDetails.feeHeadStatuses[headId] !== 'Active'
                                            ? ` (${policyDetails.feeHeadStatuses[headId]})`
                                            : ''
                                        }`}
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                        sx={{ height: 22, fontSize: '0.72rem' }}
                                      />
                                    )
                                  )}
                                </Stack>
                              </Box>
                            )}
                        </DetailSection>

                        {!isRefundPolicyDrawer && (
                          <DetailSection
                            helpText="The saved method for calculating the eligible refund amount."
                            sx={{ mb: 2 }}
                            title="Refund Calculation"
                            icon="solar:calculator-minimalistic-bold-duotone"
                          >
                            <Grid container spacing={1.5}>
                              <Grid size={{ xs: 12, sm: 6 }}>
                                <DetailField
                                  label="Amount calculation mode"
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
                              {policyDetails.amountMode === 'Percentage' && (
                                <Grid size={{ xs: 12, sm: 6 }}>
                                  <DetailField
                                    label="Configured refund percentage"
                                    value={
                                      policyDetails.percentageValue != null
                                        ? `${policyDetails.percentageValue}%`
                                        : '—'
                                    }
                                  />
                                </Grid>
                              )}
                              {policyDetails.amountMode === 'FixedAmount' && (
                                <Grid size={{ xs: 12, sm: 6 }}>
                                  <DetailField
                                    label="Configured refund amount"
                                    value={
                                      policyDetails.fixedAmount != null
                                        ? formatNumber(policyDetails.fixedAmount, 'INR')
                                        : '—'
                                    }
                                  />
                                </Grid>
                              )}
                            </Grid>
                          </DetailSection>
                        )}

                        {/* Payout Methods */}
                        <DetailSection
                          helpText="The permitted payout channels, expense category, and default paying bank account."
                          sx={{ mb: 2 }}
                          title="Deductions & Allowed Disbursement"

                          icon="solar:tag-price-bold-duotone"
                        >
                          <DetailGrid desktopColumns={2} desktopMinWidth={680}>
                            <DetailField
                              label="Permitted payout channels"
                              value={
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
                              }
                            />
                            {policyDetails.expenseCategoryId && (
                              <DetailField
                                label="Expense category"
                                value={policyDetails.expenseCategoryName || 'Name unavailable'}
                              />
                            )}
                            {policyDetails.defaultPayingBankAccountId && (
                              <DetailField
                                label="Default paying bank account"
                                value={
                                  policyDetails.defaultPayingBankAccountName || 'Name unavailable'
                                }
                              />
                            )}
                          </DetailGrid>
                        </DetailSection>
                      </>
                    )}

                    {/* ── Proration Policy Details (Enhanced) ── */}
                    {type === 'proration' && (
                      <>
                        {/* Fee Head Rules Table */}
                        <DetailSection
                          helpText="Admission and early withdrawal proration rules for each fee head."
                          title="Fee Head Configuration"

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
                              <Table
                                size="small"
                                aria-label="Fee head configuration"
                                sx={{ minWidth: 440 }}
                              >
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
                                        <TableCell component="th" scope="row" sx={{ fontWeight: 600 }}>
                                          {rule.feeHeadName || 'Fee head name unavailable'}
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
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </Box>
        </Content>
      </Box>
  );
}
