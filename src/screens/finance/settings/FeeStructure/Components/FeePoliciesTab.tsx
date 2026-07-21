import type { RootState } from 'src/redux/store';

import React from 'react';
import { useSelector } from 'react-redux';
import { varAlpha } from 'src/theme/styles';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { Box, Chip, Grid, Divider, Typography } from '@mui/material';
import { useGetCollectionPoliciesQuery } from 'src/redux/finance/collectionPolicy';
import {
  type FinancePolicyType,
  useGetFinancePoliciesQuery,
} from 'src/redux/finance/financePolicy';

import FeeHeadOverridesEditor from './FeeHeadOverridesEditor';

// ── types ────────────────────────────────────────────────────────────────────

export interface PolicyValues {
  paymentPolicyId: string;
  collectionPolicyId: string;
  refundPolicyId: string;
  prorationPolicyId: string;
}

interface FeePoliciesTabProps {
  values: PolicyValues;
  onChange: (field: keyof PolicyValues, value: string) => void;
  isEditing: boolean;
  isLocked: boolean;
  feeHeads?: Array<{ feeHeadId: string; feeHeadName?: string }>;
}

// ── helper ───────────────────────────────────────────────────────────────────

const POLICY_CONFIG: Array<{
  key: keyof PolicyValues;
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
    label: 'Payment Term',
    icon: 'solar:card-bold-duotone',
    color: 'primary',
    required: true,
    description: 'Controls installment schedule and payment behaviour',
  },
  {
    key: 'collectionPolicyId',
    type: 'collection',
    label: 'Collection Policy',
    icon: 'solar:hand-money-bold-duotone',
    color: 'success',
    required: false,
    description: 'Defines late fee and waiver rules for collection',
  },
  {
    key: 'refundPolicyId',
    type: 'refund',
    label: 'Refund Policy',
    icon: 'solar:arrow-left-up-bold-duotone',
    color: 'warning',
    required: false,
    description: 'Governs refund method, deductions and approval',
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

  // Collection Policy has a real backend endpoint (Phase 1) unlike the other policy
  // types here, which still call the generic /finance-policies endpoint that doesn't exist.
  const isCollectionPolicy = policyType === 'collection';

  const { data: genericPolicyData, isLoading: isGenericLoading } = useGetFinancePoliciesQuery(
    { policyType, academicYearId, status: 'Active' },
    { skip: !academicYearId || isCollectionPolicy }
  );

  const { data: collectionPolicyData, isLoading: isCollectionLoading } =
    useGetCollectionPoliciesQuery(
      { academicYearId: academicYearId as string, status: 'Active' },
      { skip: !academicYearId || !isCollectionPolicy }
    );

  const isLoading = isCollectionPolicy ? isCollectionLoading : isGenericLoading;
  const policyData = isCollectionPolicy ? collectionPolicyData : genericPolicyData;

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
        border: `1px solid ${varAlpha(palette.mainChannel as string, 0.12)}`,
        bgcolor: varAlpha(palette.mainChannel as string, 0.03),
        transition: 'all 0.18s',
        '&:hover': {
          borderColor: varAlpha(palette.mainChannel as string, 0.25),
          bgcolor: varAlpha(palette.mainChannel as string, 0.05),
        },
      }}
    >
      {/* Icon badge */}
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 1.5,
          bgcolor: varAlpha(palette.mainChannel as string, 0.12),
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
              variant="soft"
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
}) => {
  const theme = useTheme();
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const [overridesEditorOpen, setOverridesEditorOpen] = React.useState(false);

  const { data: collectionPolicyData } = useGetCollectionPoliciesQuery(
    { academicYearId: currentYear?.id as string, status: 'Active' },
    { skip: !currentYear?.id || !values.collectionPolicyId }
  );
  const selectedCollectionPolicy = (collectionPolicyData?.items ?? []).find(
    (p: any) => p.id === values.collectionPolicyId
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
          bgcolor: varAlpha(theme.palette.info.mainChannel, 0.04),
          border: `1px solid ${varAlpha(theme.palette.info.mainChannel, 0.15)}`,
        }}
      >
        <Iconify
          icon="solar:info-circle-bold"
          width={16}
          sx={{ color: theme.palette.info.main, flexShrink: 0, mt: 0.1 }}
        />
        <Typography variant="caption" color="info.main" fontWeight={500}>
          These policies automatically apply to all Fee Heads in this structure. Individual Fee Head
          overrides for the Collection Policy will take precedence over these settings.
        </Typography>
      </Box>
      <Divider sx={{ my: 2, borderColor: varAlpha(theme.palette.grey['500Channel'], 0.1) }} />

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

      {/* ── Per-fee-head Collection Policy overrides ────────────────────── */}
      {values.collectionPolicyId && feeHeads.length > 0 && (
        <>
          <Divider sx={{ my: 2, borderColor: varAlpha(theme.palette.grey['500Channel'], 0.1) }} />
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
            }}
          >
            <Box>
              <Typography variant="body2" fontWeight={700}>
                Fee Head Overrides
              </Typography>
              <Typography variant="caption" color="text.disabled">
                Exempt a fee head from late fees, or give it its own rule.
              </Typography>
            </Box>
            <Chip
              label="Configure"
              size="small"
              variant="soft"
              color="success"
              onClick={() => setOverridesEditorOpen(true)}
              sx={{ cursor: 'pointer', fontWeight: 600 }}
            />
          </Box>

          {overridesEditorOpen && (
            <FeeHeadOverridesEditor
              open={overridesEditorOpen}
              onClose={() => setOverridesEditorOpen(false)}
              collectionPolicyId={values.collectionPolicyId}
              collectionPolicyName={selectedCollectionPolicy?.policyName}
              feeHeads={feeHeads}
            />
          )}
        </>
      )}
    </Box>
  );
};

export default FeePoliciesTab;
