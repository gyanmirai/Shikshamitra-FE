import type {
  ConcessionBenefitBlocker,
  ConcessionPolicyOption,
} from 'src/redux/finance/ConcessionManagement/types';

import { useId, useState } from 'react';
import { Stack, IconButton, InputAdornment } from '@mui/material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import { concessionBenefitBlockerMessage } from 'src/utils/concession-benefit-blocker';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';

import ConcessionRequestPolicyDialog from './ConcessionRequestPolicyDialog';

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
  const [viewPolicy, setViewPolicy] = useState(false);
  const selectedPolicy = policies.find(
    (policy) => policy.concessionPolicyVersionId === policyVersionId
  );
  const policyHelperId = `${fieldId}-policy-help`;
  const typeHelperId = `${fieldId}-type-help`;
  const selectedTypeBlocker = types.find((type) => type.id === typeId)?.benefitBlocker;
  const typeFeedback = concessionBenefitBlockerMessage(selectedTypeBlocker) || typeHelperText;
  return (
    <Stack
      sx={{
        gap: 1.5,
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
          endAdornment={
            selectedPolicy ? (
              <InputAdornment position="end" sx={{ mr: 2.5 }}>
                <CustomTooltip title="View selected concession policy" placement="right">
                  <IconButton
                    size="small"
                    aria-label="View selected concession policy"
                    disabled={policyDisabled}
                    onMouseDown={(event) => event.stopPropagation()}
                    onClick={(event) => {
                      event.stopPropagation();
                      setViewPolicy(true);
                    }}
                    sx={{ color: 'text.secondary' }}
                  >
                    <Iconify icon={GlobalIcons.eye} width={18} />
                  </IconButton>
                </CustomTooltip>
              </InputAdornment>
            ) : undefined
          }
          sx={selectedPolicy ? { '& .MuiSelect-select': { pr: 8 } } : undefined}
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
      {viewPolicy && selectedPolicy && (
        <ConcessionRequestPolicyDialog
          policy={selectedPolicy}
          onClose={() => setViewPolicy(false)}
        />
      )}
    </Stack>
  );
}
