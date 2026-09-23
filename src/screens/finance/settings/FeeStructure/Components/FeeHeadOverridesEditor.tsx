import { LoadingButton } from '@mui/lab';
import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import React, { useMemo, useState, useEffect } from 'react';
import {
  useGetCollectionPolicyByIdQuery,
  useUpdateCollectionPolicyMutation,
} from 'src/redux/finance/collectionPolicy';
import {
  Box,
  Stack,
  Table,
  Button,
  Divider,
  TableRow,
  TextField,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  IconButton,
  TableContainer,
  CircularProgress,
} from '@mui/material';

// ── types ────────────────────────────────────────────────────────────────────

type OverrideMode = 'Inherit' | 'NoLateFee' | 'CustomRule';

interface LateFeeRuleOverrideValue {
  lateFeeType: string;
  flatAmount: number | null;
  percentage: number | null;
  percentageBase: string;
  amountPerDay: number | null;
  amountPerWeek: number | null;
  amountPerMonth: number | null;
  compoundFrequency: string;
  escalationRules: any[];
  roundingMethod: string;
  maximumLateFeeAmount: number | null;
  maximumChargingDays: number | null;
}

interface FeeHeadOverrideRow {
  feeHeadId: string;
  overrideMode: OverrideMode;
  lateFeeRule: LateFeeRuleOverrideValue | null;
}

const DEFAULT_RULE: LateFeeRuleOverrideValue = {
  lateFeeType: 'Flat',
  flatAmount: null,
  percentage: null,
  percentageBase: 'OutstandingAmount',
  amountPerDay: null,
  amountPerWeek: null,
  amountPerMonth: null,
  compoundFrequency: 'Daily',
  escalationRules: [],
  roundingMethod: 'None',
  maximumLateFeeAmount: null,
  maximumChargingDays: null,
};

const OVERRIDE_MODE_OPTIONS = [
  { label: 'Inherit policy rule', value: 'Inherit' },
  { label: 'No late fee', value: 'NoLateFee' },
  { label: 'Custom rule', value: 'CustomRule' },
];

// Slab isn't editable here — the interactive slab builder lives in the Collection
// Policy screen's own form; keeping this per-fee-head editor to the calculation types
// that map to a single set of scalar fields keeps the dialog simple and self-contained.
const LATE_FEE_TYPE_OPTIONS = [
  { label: 'Flat Amount', value: 'Flat' },
  { label: 'Percentage', value: 'Percentage' },
  { label: 'Per Day', value: 'PerDay' },
  { label: 'Per Week', value: 'PerWeek' },
  { label: 'Per Month', value: 'PerMonth' },
  { label: 'Compound', value: 'Compound' },
];

const ROUNDING_METHOD_OPTIONS = [
  { label: 'None', value: 'None' },
  { label: 'Round Up', value: 'RoundUp' },
  { label: 'Round Down', value: 'RoundDown' },
  { label: 'Nearest Rupee', value: 'NearestRupee' },
];

const PERCENTAGE_BASE_OPTIONS = [
  { label: 'Outstanding Amount', value: 'OutstandingAmount' },
  { label: 'Original Fee', value: 'OriginalFee' },
  { label: 'Remaining Balance', value: 'RemainingBalance' },
];

interface FeeHeadOverridesEditorProps {
  open: boolean;
  onClose: () => void;
  collectionPolicyId: string;
  collectionPolicyName?: string;
  feeHeads: Array<{ feeHeadId: string; feeHeadName?: string }>;
}

// ── component ────────────────────────────────────────────────────────────────

const FeeHeadOverridesEditor: React.FC<FeeHeadOverridesEditorProps> = ({
  open,
  onClose,
  collectionPolicyId,
  collectionPolicyName,
  feeHeads,
}) => {
  const { data: policy, isLoading } = useGetCollectionPolicyByIdQuery(collectionPolicyId, {
    skip: !open || !collectionPolicyId,
  });
  const [updatePolicy, { isLoading: isSaving }] = useUpdateCollectionPolicyMutation();

  const [rows, setRows] = useState<Record<string, FeeHeadOverrideRow>>({});
  const [ruleDialogFeeHeadId, setRuleDialogFeeHeadId] = useState<string | null>(null);

  useEffect(() => {
    if (!policy) return;
    const existing: Record<string, FeeHeadOverrideRow> = {};
    (policy.feeHeadOverrides ?? []).forEach((o: any) => {
      existing[o.feeHeadId] = {
        feeHeadId: o.feeHeadId,
        overrideMode: o.overrideMode,
        lateFeeRule: o.lateFeeRule ?? null,
      };
    });
    setRows(existing);
  }, [policy]);

  const setOverrideMode = (feeHeadId: string, mode: OverrideMode) => {
    setRows((prev) => {
      const current = prev[feeHeadId];
      return {
        ...prev,
        [feeHeadId]: {
          feeHeadId,
          overrideMode: mode,
          lateFeeRule: mode === 'CustomRule' ? (current?.lateFeeRule ?? { ...DEFAULT_RULE }) : null,
        },
      };
    });
    if (mode === 'CustomRule') {
      setRuleDialogFeeHeadId(feeHeadId);
    }
  };

  const ruleDialogRow = ruleDialogFeeHeadId ? rows[ruleDialogFeeHeadId] : null;

  const updateRuleField = (field: keyof LateFeeRuleOverrideValue, value: any) => {
    if (!ruleDialogFeeHeadId) return;
    setRows((prev) => ({
      ...prev,
      [ruleDialogFeeHeadId]: {
        ...prev[ruleDialogFeeHeadId],
        lateFeeRule: { ...(prev[ruleDialogFeeHeadId].lateFeeRule ?? DEFAULT_RULE), [field]: value },
      },
    }));
  };

  const hasIncompleteCustomRule = useMemo(
    () =>
      Object.values(rows).some((r) => {
        if (r.overrideMode !== 'CustomRule' || !r.lateFeeRule) return false;
        const rule = r.lateFeeRule;
        switch (rule.lateFeeType) {
          case 'Flat':
            return !rule.flatAmount;
          case 'Percentage':
          case 'Compound':
            return !rule.percentage;
          case 'PerDay':
            return !rule.amountPerDay;
          case 'PerWeek':
            return !rule.amountPerWeek;
          case 'PerMonth':
            return !rule.amountPerMonth;
          default:
            return false;
        }
      }),
    [rows]
  );

  const handleSave = async () => {
    if (!policy) return;
    if (hasIncompleteCustomRule) {
      shikshaMitraToast.error({ message: 'Finish configuring every custom rule before saving' });
      return;
    }

    const feeHeadOverrides = Object.values(rows)
      .filter((r) => r.overrideMode !== 'Inherit')
      .map((r) => ({
        feeHeadId: r.feeHeadId,
        overrideMode: r.overrideMode,
        lateFeeRule: r.overrideMode === 'CustomRule' ? r.lateFeeRule : null,
      }));

    try {
      await updatePolicy({
        id: collectionPolicyId,
        body: {
          academicYearId: policy.academicYearId,
          policyName: policy.policyName,
          policyCode: policy.policyCode,
          description: policy.description,
          status: policy.status,
          isDefault: policy.isDefault,
          effectiveFrom: policy.effectiveFrom,
          effectiveTo: policy.effectiveTo,
          enableLateFee: policy.enableLateFee,
          gracePeriodDays: policy.gracePeriodDays,
          gracePeriodType: policy.gracePeriodType,
          lateFeeApplyOnFeeHeads: policy.lateFeeApplyOnFeeHeads,
          lateFeeType: policy.lateFeeType,
          flatAmount: policy.flatAmount,
          percentage: policy.percentage,
          percentageBase: policy.percentageBase,
          amountPerDay: policy.amountPerDay,
          amountPerWeek: policy.amountPerWeek,
          amountPerMonth: policy.amountPerMonth,
          compoundFrequency: policy.compoundFrequency,
          escalationRules: policy.escalationRules,
          feeHeadOverrides,
          roundingMethod: policy.roundingMethod,
          considerAsIncome: policy.considerAsIncome,
          lateFeeIncomeHeadId: policy.lateFeeIncomeHeadId,
          maximumLateFeeAmount: policy.maximumLateFeeAmount,
          maximumChargingDays: policy.maximumChargingDays,
          enableWaiver: policy.enableWaiver,
          enableChargeWaiver: policy.enableChargeWaiver,
          requiresApproval: policy.requiresApproval,
          approvalRoleIds: policy.approvalRoleIds,
          allowOnlineCollection: policy.allowOnlineCollection,
        },
      }).unwrap();
      shikshaMitraToast.success({ message: 'Fee head overrides saved' });
      onClose();
    } catch {
      // toast handled by the RTK Query error middleware
    }
  };

  return (
    <>
      <CustomDialog
        open={open && !ruleDialogFeeHeadId}
        handleClose={onClose}
        maxWidth="sm"
        title={
          <Box>
            <Typography variant="h5">Fee Head Overrides</Typography>
            {collectionPolicyName && (
              <Typography variant="caption" color="text.secondary">
                Collection Policy: {collectionPolicyName}
              </Typography>
            )}
          </Box>
        }
      >
        <Box sx={{ minWidth: { sm: 560 } }}>
          {isLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mb: 1.5 }}
              >
                Each fee head inherits this Collection Policy&apos;s late fee rule by default. Set
                an override to exempt a fee head from late fees, or give it its own rule.
              </Typography>
              <TableContainer sx={{ maxHeight: 360 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Fee Head</TableCell>
                      <TableCell sx={{ width: 220 }}>Override</TableCell>
                      <TableCell align="right" sx={{ width: 40 }} />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {feeHeads.map((fh) => {
                      const row = rows[fh.feeHeadId];
                      const mode = row?.overrideMode ?? 'Inherit';
                      return (
                        <TableRow key={fh.feeHeadId}>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                              {fh.feeHeadName ?? fh.feeHeadId}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <CustomSelect
                              size="small"
                              options={OVERRIDE_MODE_OPTIONS}
                              labelKey="label"
                              valueKey="value"
                              value={mode}
                              onChange={(val) => setOverrideMode(fh.feeHeadId, val as OverrideMode)}
                              formControlProps={{ sx: { width: '100%' } }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            {mode === 'CustomRule' && (
                              <IconButton
                                size="small"
                                onClick={() => setRuleDialogFeeHeadId(fh.feeHeadId)}
                              >
                                <Iconify icon="solar:pen-2-bold" width={16} />
                              </IconButton>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              <Divider sx={{ my: 2 }} />
              <Stack direction="row" justifyContent="flex-end" gap={1}>
                <Button size="small" onClick={onClose}>
                  Cancel
                </Button>
                <LoadingButton
                  size="small"
                  variant="contained"
                  loading={isSaving}
                  onClick={handleSave}
                >
                  Save Overrides
                </LoadingButton>
              </Stack>
            </>
          )}
        </Box>
      </CustomDialog>

      {/* ── Custom rule sub-dialog ─────────────────────────────────────────── */}
      <CustomDialog
        open={Boolean(ruleDialogFeeHeadId)}
        handleClose={() => setRuleDialogFeeHeadId(null)}
        maxWidth="xs"
        title={
          <Typography variant="h5">
            Custom Rule —{' '}
            {feeHeads.find((f) => f.feeHeadId === ruleDialogFeeHeadId)?.feeHeadName ?? 'Fee Head'}
          </Typography>
        }
      >
        {ruleDialogRow?.lateFeeRule && (
          <Stack spacing={2} sx={{ minWidth: { sm: 420 } }}>
            <CustomSelect
              label="Calculation Type"
              options={LATE_FEE_TYPE_OPTIONS}
              labelKey="label"
              valueKey="value"
              value={ruleDialogRow.lateFeeRule.lateFeeType}
              onChange={(val) => updateRuleField('lateFeeType', val)}
              size="small"
              formControlProps={{ sx: { width: '100%' } }}
            />

            {ruleDialogRow.lateFeeRule.lateFeeType === 'Flat' && (
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Late Fee Amount (₹)"
                value={ruleDialogRow.lateFeeRule.flatAmount ?? ''}
                onChange={(e) =>
                  updateRuleField('flatAmount', e.target.value ? +e.target.value : null)
                }
              />
            )}

            {(ruleDialogRow.lateFeeRule.lateFeeType === 'Percentage' ||
              ruleDialogRow.lateFeeRule.lateFeeType === 'Compound') && (
              <>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Percentage (%)"
                  value={ruleDialogRow.lateFeeRule.percentage ?? ''}
                  onChange={(e) =>
                    updateRuleField('percentage', e.target.value ? +e.target.value : null)
                  }
                />
                <CustomSelect
                  label="Calculation Base"
                  options={PERCENTAGE_BASE_OPTIONS}
                  labelKey="label"
                  valueKey="value"
                  value={ruleDialogRow.lateFeeRule.percentageBase}
                  onChange={(val) => updateRuleField('percentageBase', val)}
                  size="small"
                  formControlProps={{ sx: { width: '100%' } }}
                />
              </>
            )}

            {ruleDialogRow.lateFeeRule.lateFeeType === 'PerDay' && (
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Amount Per Day (₹)"
                value={ruleDialogRow.lateFeeRule.amountPerDay ?? ''}
                onChange={(e) =>
                  updateRuleField('amountPerDay', e.target.value ? +e.target.value : null)
                }
              />
            )}

            {ruleDialogRow.lateFeeRule.lateFeeType === 'PerWeek' && (
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Amount Per Week (₹)"
                value={ruleDialogRow.lateFeeRule.amountPerWeek ?? ''}
                onChange={(e) =>
                  updateRuleField('amountPerWeek', e.target.value ? +e.target.value : null)
                }
              />
            )}

            {ruleDialogRow.lateFeeRule.lateFeeType === 'PerMonth' && (
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Amount Per Month (₹)"
                value={ruleDialogRow.lateFeeRule.amountPerMonth ?? ''}
                onChange={(e) =>
                  updateRuleField('amountPerMonth', e.target.value ? +e.target.value : null)
                }
              />
            )}

            {ruleDialogRow.lateFeeRule.lateFeeType === 'Compound' && (
              <CustomSelect
                label="Compound Frequency"
                options={[
                  { label: 'Daily', value: 'Daily' },
                  { label: 'Weekly', value: 'Weekly' },
                  { label: 'Monthly', value: 'Monthly' },
                ]}
                labelKey="label"
                valueKey="value"
                value={ruleDialogRow.lateFeeRule.compoundFrequency}
                onChange={(val) => updateRuleField('compoundFrequency', val)}
                size="small"
                formControlProps={{ sx: { width: '100%' } }}
              />
            )}

            <CustomSelect
              label="Rounding Method"
              options={ROUNDING_METHOD_OPTIONS}
              labelKey="label"
              valueKey="value"
              value={ruleDialogRow.lateFeeRule.roundingMethod}
              onChange={(val) => updateRuleField('roundingMethod', val)}
              size="small"
              formControlProps={{ sx: { width: '100%' } }}
            />

            <TextField
              fullWidth
              size="small"
              type="number"
              label="Maximum Late Fee Amount (₹) — optional cap"
              value={ruleDialogRow.lateFeeRule.maximumLateFeeAmount ?? ''}
              onChange={(e) =>
                updateRuleField('maximumLateFeeAmount', e.target.value ? +e.target.value : null)
              }
            />

            <TextField
              fullWidth
              size="small"
              type="number"
              label="Maximum Charging Days — optional cutoff"
              value={ruleDialogRow.lateFeeRule.maximumChargingDays ?? ''}
              onChange={(e) =>
                updateRuleField('maximumChargingDays', e.target.value ? +e.target.value : null)
              }
            />

            <Stack direction="row" justifyContent="flex-end" gap={1}>
              <Button size="small" onClick={() => setRuleDialogFeeHeadId(null)}>
                Done
              </Button>
            </Stack>
          </Stack>
        )}
      </CustomDialog>
    </>
  );
};

export default FeeHeadOverridesEditor;
export type { FeeHeadOverrideRow };
