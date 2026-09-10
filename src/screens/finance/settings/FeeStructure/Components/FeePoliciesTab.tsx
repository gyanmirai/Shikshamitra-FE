import type { RootState } from 'src/redux/store';

import React from 'react';
import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { alpha, useTheme } from '@mui/material/styles';
import CustomSelect from 'src/components/custom-select';
import { hasGrantedPermission } from 'src/utils/permissions';
import { financePermissions } from 'src/constants/finance-menu';
import { useGetRefundPoliciesQuery } from 'src/redux/finance/refundPolicy';
import { Box, Chip, Grid, Alert, Stack, Divider, Typography } from '@mui/material';
import { useGetCollectionPoliciesQuery } from 'src/redux/finance/collectionPolicy';
import { useGetActiveFeeHeadsQuery } from 'src/redux/feeHeadManage/feeHeadManageApi';
import { useValidateCollectionPolicyAttachmentMutation } from 'src/redux/finance/financeFeeStructure';
import {
  type FinancePolicyType,
  useGetFinancePoliciesQuery,
} from 'src/redux/finance/financePolicy';
import {
  useGetProrationPoliciesQuery,
  useGetProrationAttachmentImpactMutation,
} from 'src/redux/finance/prorationPolicy';

// ── types ────────────────────────────────────────────────────────────────────

export interface PolicyValues {
  paymentPolicyId: string;
  collectionPolicyId: string;
  refundPolicyId: string;
  prorationPolicyId: string;
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
  feeStructureId?: string;
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
  {
    key: 'prorationPolicyId',
    type: 'proration',
    label: 'Proration Policy',
    icon: 'solar:calendar-mark-bold-duotone',
    color: 'info',
    required: false,
    description: 'Sets proration rules for mid-session admissions',
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
  description,
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
  const isProrationPolicy = policyType === 'proration';

  const { data: genericPolicyData, isLoading: isGenericLoading } = useGetFinancePoliciesQuery(
    { policyType, academicYearId, status: 'Active' },
    {
      skip: !academicYearId || isCollectionPolicy || isRefundPolicy || isProrationPolicy,
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
  const { data: prorationPolicyData, isLoading: isProrationLoading } = useGetProrationPoliciesQuery(
    { academicYearId: academicYearId as string, status: 'Active', page: 1, pageSize: 100 },
    { skip: !academicYearId || !isProrationPolicy }
  );

  const isLoading = isCollectionPolicy
    ? isCollectionLoading
    : isRefundPolicy
      ? isRefundLoading
      : isProrationPolicy
        ? isProrationLoading
        : isGenericLoading;
  const policyData = isCollectionPolicy
    ? collectionPolicyData
    : isRefundPolicy
      ? refundPolicyData
      : isProrationPolicy
        ? prorationPolicyData
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
        <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 1 }}>
          {description}
        </Typography>

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
  feeStructureId,
}) => {
  const theme = useTheme();
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canManageProrationAttachment = hasGrantedPermission(
    permissions,
    financePermissions.policies.prorationPolicyActions.manageAttachment
  );
  const { data: collectionPolicyData } = useGetCollectionPoliciesQuery(
    { academicYearId: currentYear?.id as string, status: 'Active' },
    { skip: !currentYear?.id || !values.collectionPolicyId }
  );
  const selectedCollectionPolicy = (collectionPolicyData?.items ?? []).find(
    (p: any) => p.id === values.collectionPolicyId
  );
  const defaultCollectionPolicy = (collectionPolicyData?.items ?? []).find(
    (policy: any) => policy.isDefault
  );
  const { data: prorationPolicyData } = useGetProrationPoliciesQuery(
    { academicYearId: currentYear?.id as string, status: 'Active', page: 1, pageSize: 100 },
    { skip: !currentYear?.id }
  );
  const defaultProrationPolicy = (prorationPolicyData?.items ?? []).find(
    (policy) => policy.isDefault
  );
  const selectedProrationPolicy = (prorationPolicyData?.items ?? []).find(
    (policy) => policy.id === values.prorationPolicyId
  );

  React.useEffect(() => {
    if (isEditing && !values.collectionPolicyId && defaultCollectionPolicy?.id) {
      onChange('collectionPolicyId', defaultCollectionPolicy.id);
    }
  }, [defaultCollectionPolicy?.id, isEditing, onChange, values.collectionPolicyId]);

  React.useEffect(() => {
    if (
      isEditing &&
      canManageProrationAttachment &&
      !values.prorationPolicyId &&
      defaultProrationPolicy?.id
    ) {
      onChange('prorationPolicyId', defaultProrationPolicy.id);
    }
  }, [
    canManageProrationAttachment,
    defaultProrationPolicy?.id,
    isEditing,
    onChange,
    values.prorationPolicyId,
  ]);

  const [validateAttachment, { data: attachmentImpact, isLoading: impactLoading }] =
    useValidateCollectionPolicyAttachmentMutation();
  const [getProrationImpact, { data: prorationImpact, isLoading: prorationImpactLoading }] =
    useGetProrationAttachmentImpactMutation();
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

  React.useEffect(() => {
    if (!feeStructureId || !values.prorationPolicyId) return;
    getProrationImpact({ id: values.prorationPolicyId, feeStructureId });
  }, [feeStructureId, getProrationImpact, values.prorationPolicyId]);
  const { data: feeHeadData } = useGetActiveFeeHeadsQuery(currentYear?.id as string, {
    skip: !currentYear?.id,
  });
  const structureFeeHeadIds = new Set(feeHeads.map((x) => x.feeHeadId));
  const lateFeePolicyHeadIds = new Set<string>(
    selectedCollectionPolicy?.enableLateFee
      ? (selectedCollectionPolicy.lateFeeApplyOnFeeHeads ?? [])
      : []
  );
  const waiverPolicyHeadIds = new Set<string>(
    selectedCollectionPolicy?.enableWaiver
      ? (selectedCollectionPolicy.waiverApplyOnFeeHeads ?? [])
      : []
  );
  const applicablePolicyHeadIds = new Set([...lateFeePolicyHeadIds, ...waiverPolicyHeadIds]);
  const lateFeeCovered = feeHeads.filter((x) => lateFeePolicyHeadIds.has(x.feeHeadId));
  const waiverCovered = feeHeads.filter((x) => waiverPolicyHeadIds.has(x.feeHeadId));
  const headsWithoutLateFee = feeHeads.filter((x) => !lateFeePolicyHeadIds.has(x.feeHeadId));
  const headsWithoutWaiver = feeHeads.filter((x) => !waiverPolicyHeadIds.has(x.feeHeadId));
  const policyOnlyHeads = (feeHeadData ?? []).filter(
    (x) => applicablePolicyHeadIds.has(x.id) && !structureFeeHeadIds.has(x.id)
  );
  const nonFullProrationHeadIds = new Set(
    (selectedProrationPolicy?.feeHeadRules ?? [])
      .filter((rule) => rule.ruleType !== 'FullCharge')
      .map((rule) => rule.feeHeadId)
  );
  const invalidOneTimeProrationHeads = feeHeads.filter(
    (head) => head.isOneTime && nonFullProrationHeadIds.has(head.feeHeadId)
  );

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
              isLocked={isLocked || (cfg.type === 'proration' && !canManageProrationAttachment)}
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
              <Chip
                size="small"
                color={
                  selectedCollectionPolicy?.enableWaiver && waiverCovered.length === 0
                    ? 'warning'
                    : 'info'
                }
                label={`Waiver: ${waiverCovered.length}/${feeHeads.length} heads`}
              />
            </Stack>

            {attachmentImpact?.isAttachable === false && (
              <Alert severity="error" sx={{ mb: 1 }}>
                This policy cannot be attached to the selected fee structure.
              </Alert>
            )}

            {selectedCollectionPolicy?.enableLateFee && lateFeeCovered.length === 0 && (
              <Alert severity="warning" sx={{ mb: 1 }}>
                None of this structure&apos;s Fee Heads are in the policy&apos;s late-fee scope. The
                policy can still be attached, but it will not charge a late fee here.
              </Alert>
            )}

            {selectedCollectionPolicy?.enableWaiver && waiverCovered.length === 0 && (
              <Alert severity="warning" sx={{ mb: 1 }}>
                None of this structure&apos;s Fee Heads are in the policy&apos;s waiver scope. The
                policy can still be attached, but waivers will not be available here.
              </Alert>
            )}

            {selectedCollectionPolicy?.enableLateFee && headsWithoutLateFee.length > 0 && (
              <Alert severity="warning" sx={{ mb: 1 }}>
                Late fee will not apply to:{' '}
                {headsWithoutLateFee.map((x) => x.feeHeadName || x.feeHeadId).join(', ')}.
              </Alert>
            )}

            {selectedCollectionPolicy?.enableWaiver && headsWithoutWaiver.length > 0 && (
              <Alert severity="warning" sx={{ mb: 1 }}>
                Waiver will not apply to:{' '}
                {headsWithoutWaiver.map((x) => x.feeHeadName || x.feeHeadId).join(', ')}.
              </Alert>
            )}

            {policyOnlyHeads.length > 0 && (
              <Alert severity="info">
                Policy heads not present in this structure are ignored:{' '}
                {policyOnlyHeads.map((x) => x.name).join(', ')}.
              </Alert>
            )}

            {(attachmentImpact?.warnings ?? []).map((warning: string) => (
              <Typography
                key={warning}
                variant="caption"
                color="text.secondary"
                display="block"
                mt={0.75}
              >
                {warning}
              </Typography>
            ))}
          </Box>
        </>
      )}

      {values.prorationPolicyId && feeHeads.length > 0 && (
        <>
          <Divider sx={{ my: 2, borderColor: alpha(theme.palette.grey[500], 0.1) }} />
          <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}>
            <Typography variant="body2" fontWeight={700}>
              Proration Policy Impact
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
              {selectedProrationPolicy?.policyName} · version{' '}
              {prorationImpact?.policyVersion ?? selectedProrationPolicy?.version ?? 'current'}
              {prorationImpactLoading ? ' · checking…' : ''}
            </Typography>

            {invalidOneTimeProrationHeads.length > 0 && (
              <Alert severity="error" sx={{ mb: 1 }}>
                These legacy fee lines require Full charge proration:{' '}
                {invalidOneTimeProrationHeads
                  .map((head) => head.feeHeadName || head.feeHeadId)
                  .join(', ')}
                .
              </Alert>
            )}

            {(prorationImpact?.warnings ?? []).map((warning) => (
              <Alert severity="warning" sx={{ mb: 1 }} key={warning}>
                {warning}
              </Alert>
            ))}

            {invalidOneTimeProrationHeads.length === 0 &&
              (prorationImpact?.warnings.length ?? 0) === 0 && (
                <Alert severity="success">
                  The selected policy is compatible with this Fee Structure. The current policy
                  version will be pinned when saved.
                </Alert>
              )}
          </Box>
        </>
      )}
    </Box>
  );
};

export default FeePoliciesTab;
