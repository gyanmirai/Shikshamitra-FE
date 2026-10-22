import type { RootState } from 'src/redux/store';

import React from 'react';
import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { alpha, useTheme } from '@mui/material/styles';
import CustomSelect from 'src/components/custom-select';
import { useGetRefundPoliciesQuery } from 'src/redux/finance/refundPolicy';
import { Box, Chip, Grid, Alert, Stack, Divider, Typography } from '@mui/material';
import { useGetCollectionPoliciesQuery } from 'src/redux/finance/collectionPolicy';

import { useValidateCollectionPolicyAttachmentMutation } from 'src/redux/finance/financeFeeStructure';
import {
  type FinancePolicyType,
  useGetFinancePoliciesQuery,
} from 'src/redux/finance/financePolicy';

// ── types ────────────────────────────────────────────────────────────────────

export interface PolicyValues {
  paymentPolicyId: string;
  collectionPolicyId: string;
  refundPolicyId: string;
  concessionPolicyId: string;
  concessionFeeHeadScope: 'EntireFeeStructure' | 'SelectedFeeHeads';
  concessionApplicableFeeHeadIds: string[];
}

type PolicyIdKey = Exclude<
  keyof PolicyValues,
  'concessionFeeHeadScope' | 'concessionApplicableFeeHeadIds'
>;

interface FeePoliciesTabProps {
  values: PolicyValues;
  onChange: (field: keyof PolicyValues, value: PolicyValues[keyof PolicyValues]) => void;
  isEditing: boolean;
  isLocked: boolean;
  feeHeads?: Array<{ feeHeadId: string; feeHeadName?: string; isOneTime?: boolean }>;
  feeStructureMetadataId: string;
}

// ── helper ───────────────────────────────────────────────────────────────────

const POLICY_CONFIG: Array<{
  key: PolicyIdKey;
  type: FinancePolicyType;
  label: string;
  icon: string;
  color: 'primary' | 'success' | 'warning' | 'info';
  required: boolean;
  description: string;
}> = [
  {
    key: 'paymentPolicyId',
    type: 'payment',
    label: 'Payment Policy',
    icon: 'solar:card-bold-duotone',
    color: 'primary',
    required: true,
    description: 'Controls payment behaviour, partial payments, and allocation',
  },
  {
    key: 'collectionPolicyId',
    type: 'collection',
    label: 'Collection Policy',
    icon: 'solar:hand-money-bold-duotone',
    color: 'success',
    required: true,
    description: 'Defines versioned late-fee and waiver rules for the selected fee heads',
  },
  {
    key: 'refundPolicyId',
    type: 'refund',
    label: 'Refund Policy',
    icon: 'solar:arrow-left-up-bold-duotone',
    color: 'warning',
    required: false,
    description: 'Defines eligible paid amounts, caps, deductions, and allowed payout methods',
  },
];

// ── sub-component: one policy row ────────────────────────────────────────────

interface PolicyRowProps {
  policyKey: keyof PolicyValues;
  policyType: FinancePolicyType;
  label: string;
  icon: string;
  color: 'primary' | 'success' | 'warning' | 'info';
  required: boolean;
  description: string;
  value: string;
  onChange: (value: string) => void;
  isEditing: boolean;
  isLocked: boolean;
  academicYearId?: string;
}

const PolicyRow: React.FC<PolicyRowProps> = ({
  policyKey,
  policyType,
  label,
  icon,
  color,
  required,
  value,
  onChange,
  isEditing,
  isLocked,
  academicYearId,
}) => {
  const theme = useTheme();

  // Versioned policies use their typed endpoints. The remaining
  // policy types still use the legacy generic client until their backend slices are migrated.
  const isCollectionPolicy = policyType === 'collection';
  const isRefundPolicy = policyType === 'refund';

  const { data: genericPolicyData, isLoading: isGenericLoading } = useGetFinancePoliciesQuery(
    { policyType, academicYearId, status: 'Active' },
    {
      skip: !academicYearId || isCollectionPolicy || isRefundPolicy,
    }
  );

  const { data: collectionPolicyData, isLoading: isCollectionLoading } =
    useGetCollectionPoliciesQuery(
      { academicYearId: academicYearId as string, status: 'Active' },
      { skip: !academicYearId || !isCollectionPolicy }
    );
  const { data: refundPolicyData, isLoading: isRefundLoading } = useGetRefundPoliciesQuery(
    { academicYearId: academicYearId as string, status: 'Active', page: 1, pageSize: 100 },
    { skip: !academicYearId || !isRefundPolicy }
  );

  const isLoading = isCollectionPolicy
    ? isCollectionLoading
    : isRefundPolicy
      ? isRefundLoading
      : isGenericLoading;
  const policyData = isCollectionPolicy
    ? collectionPolicyData
    : isRefundPolicy
      ? refundPolicyData
      : genericPolicyData;

  const options = (policyData?.data ?? policyData?.items ?? policyData ?? []).map((p: any) => ({
    label: p.policyName,
    value: p.id,
    code: p.policyCode,
  }));

  const selectedOption = options.find((o: any) => o.value === value);

  const colorMap = {
    primary: theme.palette.primary,
    success: theme.palette.success,
    warning: theme.palette.warning,
    info: theme.palette.info,
  } as const;
  const palette = colorMap[color];

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 2,
        p: 2,
        borderRadius: 1.5,
        border: `1px solid ${alpha(palette.main, 0.12)}`,
        bgcolor: alpha(palette.main, 0.03),
        transition: 'all 0.18s',
        '&:hover': {
          borderColor: alpha(palette.main, 0.25),
          bgcolor: alpha(palette.main, 0.05),
        },
      }}
    >
      {/* Icon badge */}
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 1.5,
          bgcolor: alpha(palette.main, 0.12),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          mt: 0.5,
        }}
      >
        <Iconify icon={icon} width={22} sx={{ color: palette.main }} />
      </Box>

      {/* Content */}
      <Box flex={1} minWidth={0}>
        <Box display="flex" alignItems="center" gap={0.75} mb={0.5}>
          <Typography variant="body2" fontWeight={700} color="text.primary">
            {label}
          </Typography>
          {required && (
            <Typography variant="caption" color="error.main" fontWeight={700}>
              *
            </Typography>
          )}
          {!isEditing && selectedOption && (
            <Chip
              label={selectedOption.code ?? selectedOption.label}
              size="small"
              variant="outlined"
              color={color}
              sx={{ fontSize: 10, height: 18, fontWeight: 600, borderRadius: 0.75 }}
            />
          )}
        </Box>

        <CustomSelect
          label={`Select ${label}`}
          options={options}
          isLoading={isLoading}
          labelKey="label"
          valueKey="value"
          value={value || ''}
          disabled={!isEditing || isLocked}
          onChange={(val) => onChange(val as string)}
          size="small"
          formControlProps={{ sx: { width: '100%' } }}
        />
      </Box>
    </Box>
  );
};

// ── main component ────────────────────────────────────────────────────────────

const FeePoliciesTab: React.FC<FeePoliciesTabProps> = ({
  values,
  onChange,
  isEditing,
  isLocked,
  feeHeads = [],
  feeStructureMetadataId,
}) => {
  const theme = useTheme();
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const { data: collectionPolicyData } = useGetCollectionPoliciesQuery(
    { academicYearId: currentYear?.id as string, status: 'Active' },
    { skip: !currentYear?.id }
  );
  const selectedCollectionPolicy = (collectionPolicyData?.items ?? []).find(
    (p: any) => p.id === values.collectionPolicyId
  );

  const [validateAttachment, { data: attachmentImpact, isLoading: impactLoading }] =
    useValidateCollectionPolicyAttachmentMutation();
  const feeHeadIdsKey = feeHeads
    .map((item) => item.feeHeadId)
    .sort()
    .join(',');

  React.useEffect(() => {
    if (!feeStructureMetadataId || !values.collectionPolicyId || !feeHeadIdsKey) return;
    validateAttachment({
      feeStructureMetadataId,
      collectionPolicyId: values.collectionPolicyId,
      feeHeadIds: feeHeadIdsKey.split(','),
    });
  }, [feeStructureMetadataId, values.collectionPolicyId, feeHeadIdsKey, validateAttachment]);

  const lateFeePolicyHeadIds = new Set<string>(
    selectedCollectionPolicy?.enableLateFee
      ? (selectedCollectionPolicy.lateFeeApplyOnFeeHeads ?? [])
      : []
  );

  const lateFeeCovered = feeHeads.filter((x) => lateFeePolicyHeadIds.has(x.feeHeadId));

  return (
    <Box sx={{ p: 2 }}>
      {/* Policy rows */}
      {/* Helper text */}
      <Box
        display="flex"
        alignItems="flex-start"
        gap={1}
        sx={{
          p: 1.5,
          borderRadius: 1.5,
          bgcolor: alpha(theme.palette.info.main, 0.04),
          border: `1px solid ${alpha(theme.palette.info.main, 0.15)}`,
        }}
      >
        <Iconify
          icon="solar:info-circle-bold"
          width={16}
          sx={{ color: theme.palette.info.main, flexShrink: 0, mt: 0.1 }}
        />
        <Typography variant="caption" color="info.main" fontWeight={500}>
          Collection rules apply only where the selected policy and this structure share the same
          Fee Head. The policy is version-pinned when the structure is saved, so future policy edits
          do not silently change existing student assignments.
        </Typography>
      </Box>
      <Divider sx={{ my: 2, borderColor: alpha(theme.palette.grey[500], 0.1) }} />

      <Grid container spacing={2}>
        {POLICY_CONFIG.map((cfg) => (
          <Grid size={{ xs: 12, sm: 6 }} key={cfg.key}>
            <PolicyRow
              key={cfg.key}
              policyKey={cfg.key}
              policyType={cfg.type}
              label={cfg.label}
              icon={cfg.icon}
              color={cfg.color}
              required={cfg.required}
              description={cfg.description}
              value={values[cfg.key] ?? ''}
              onChange={(val) => onChange(cfg.key, val)}
              isEditing={isEditing}
              isLocked={isLocked}
              academicYearId={currentYear?.id}
            />
          </Grid>
        ))}
      </Grid>

      {/* ── Read-only Collection Policy coverage ─────────────────────────── */}
      {values.collectionPolicyId && feeHeads.length > 0 && (
        <>
          <Divider sx={{ my: 2, borderColor: alpha(theme.palette.grey[500], 0.1) }} />
          <Box
            sx={{
              p: 2,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1.5,
            }}
          >
            <Typography variant="body2" fontWeight={700}>
              Collection Policy Impact
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
              {selectedCollectionPolicy?.policyName} · version{' '}
              {selectedCollectionPolicy?.version ?? 'current'}
              {impactLoading ? ' · checking…' : ''}
            </Typography>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap mb={1.5}>
              <Chip
                size="small"
                color={
                  selectedCollectionPolicy?.enableLateFee && lateFeeCovered.length === 0
                    ? 'warning'
                    : 'success'
                }
                label={`Late fee: ${lateFeeCovered.length}/${feeHeads.length} heads`}
              />
            </Stack>

            {attachmentImpact?.isAttachable === false && (
              <Alert severity="error" sx={{ mb: 1 }}>
                This policy cannot be attached to the selected fee structure.
              </Alert>
            )}
          </Box>
        </>
      )}
    </Box>
  );
};

export default FeePoliciesTab;
