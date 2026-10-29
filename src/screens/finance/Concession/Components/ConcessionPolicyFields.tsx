import type {
  ConcessionBenefitBlocker,
  ConcessionPolicyOption,
} from 'src/redux/finance/ConcessionManagement/types';

import { useId } from 'react';
import { Stack } from '@mui/material';
import { concessionBenefitBlockerMessage } from 'src/utils/concession-benefit-blocker';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';

type Props = {
  policies: ConcessionPolicyOption[];
  types: { id: string; name: string; benefitBlocker?: ConcessionBenefitBlocker | null }[];
  policyVersionId: string;
  typeId: string;
  onPolicyChange: (policy?: ConcessionPolicyOption) => void;
  onTypeChange: (id: string) => void;
  onPolicyBlur: () => void;
  onTypeBlur: () => void;
  policyError?: boolean;
  policyHelperText?: string;
  typeError?: boolean;
  typeHelperText?: string;
  policyDisabled?: boolean;
  typeDisabled?: boolean;
};

export default function ConcessionPolicyFields({
  policies,
  types,
  policyVersionId,
  typeId,
  onPolicyChange,
  onTypeChange,
  onPolicyBlur,
  onTypeBlur,
  policyError = false,
  policyHelperText,
  typeError = false,
  typeHelperText,
  policyDisabled = false,
  typeDisabled = false,
}: Props) {
  const fieldId = useId();
  const policyHelperId = `${fieldId}-policy-help`;
  const typeHelperId = `${fieldId}-type-help`;
  const selectedTypeBlocker = types.find((type) => type.id === typeId)?.benefitBlocker;
  const typeFeedback = concessionBenefitBlockerMessage(selectedTypeBlocker) || typeHelperText;
  return (
    <Stack
      sx={{
        gap: 2,
        '& > *': { minWidth: 0 },
      }}
    >
      <ShakingTextField error={policyError}>
        <CustomSelect
          required
          size="small"
          fullWidth
          isSearch
          name="concessionPolicyId"
          id={`${fieldId}-policy`}
          labelId={`${fieldId}-policy-label`}
          SelectDisplayProps={{ 'aria-labelledby': `${fieldId}-policy-label` }}
          label="Concession policy"
          labelKey="label"
          valueKey="id"
          options={policies.map((policy) => ({
            id: policy.concessionPolicyVersionId,
            label: `${policy.policyName} (${policy.policyCode}, v${policy.version})`,
          }))}
          value={policyVersionId}
          onChange={(id) =>
            onPolicyChange(policies.find((policy) => policy.concessionPolicyVersionId === id))
          }
          onBlur={onPolicyBlur}
          disabled={policyDisabled}
          error={policyError}
          helperText={policyHelperText}
          helperTextProps={{ id: policyHelperId }}
          aria-describedby={policyHelperText ? policyHelperId : undefined}
          noOptionsMessage="No active concession policy for this academic year."
        />
      </ShakingTextField>
      <ShakingTextField error={typeError || Boolean(selectedTypeBlocker)}>
        <CustomSelect
          required
          size="small"
          fullWidth
          isSearch
          name="concessionTypeId"
          id={`${fieldId}-type`}
          labelId={`${fieldId}-type-label`}
          SelectDisplayProps={{ 'aria-labelledby': `${fieldId}-type-label` }}
          label="Concession type"
          labelKey="name"
          valueKey="id"
          options={types.map((type) => ({
            id: type.id,
            name: type.name,
            unavailableReason: concessionBenefitBlockerMessage(type.benefitBlocker) || '',
          }))}
          disabledValues={types.filter((type) => type.benefitBlocker).map((type) => type.id)}
          disabledReasonKey="unavailableReason"
          disabledLabel="A request or approved benefit already exists for this academic year."
          value={typeId}
          onChange={(id) => onTypeChange(String(id))}
          onBlur={onTypeBlur}
          disabled={typeDisabled}
          error={typeError || Boolean(selectedTypeBlocker)}
          helperText={typeFeedback}
          helperTextProps={{ id: typeHelperId }}
          aria-describedby={typeFeedback ? typeHelperId : undefined}
          noOptionsMessage="No concession types are available for this student."
        />
      </ShakingTextField>
    </Stack>
  );
}
