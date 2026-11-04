import type {
  AdmissionOfferPolicy,
  AdmissionOfferOutcome,
} from 'src/redux/student/admissions/admission-offer-policy';

import { useBoolean } from 'src/hooks/use-boolean';
import CustomAccordion from 'src/components/custom-accordian';
import { FormSectionCard } from 'src/components/form-section-card';
import { Stack, Switch, Checkbox, TextField, FormControlLabel } from '@mui/material';

import { WorkflowSettingLabel } from './workflow-setting-label';
import { OfferValiditySettings } from './offer-validity-settings';

type Props = {
  policy: AdmissionOfferPolicy;
  disabled: boolean;
  onChange: (value: Partial<AdmissionOfferPolicy>) => void;
};
const OUTCOMES: { value: AdmissionOfferOutcome; label: string }[] = [
  { value: 'accepted', label: 'Accepted' },
  { value: 'declined', label: 'Declined' },
  { value: 'expired', label: 'Expired' },
  { value: 'withdrawn', label: 'Withdrawn' },
];

export function OfferResponseSettings({ policy, disabled, onChange }: Props) {
  const exceptions = useBoolean();
  const invalidExtensions =
    policy.allowExtension &&
    (!Number.isInteger(policy.maximumExtensions) ||
      policy.maximumExtensions < 0 ||
      policy.maximumExtensions > 20);
  const invalidReissues =
    policy.allowReissue &&
    (!Number.isInteger(policy.maximumReissues) ||
      policy.maximumReissues < 0 ||
      policy.maximumReissues > 10);
  const toggleOutcome = (value: AdmissionOfferOutcome, checked: boolean) =>
    onChange({
      allowedCompletionOutcomes: checked
        ? [...policy.allowedCompletionOutcomes, value]
        : policy.allowedCompletionOutcomes.filter((item) => item !== value),
    });
  return (
    <Stack spacing={2}>
      <FormSectionCard
        icon="mdi:calendar-check-outline"
        title="Validity and Response"
        descriptionTooltip="Define When Offers Expire, Required Acceptance Evidence and Outcomes That May Complete This Stage. Saved Response and Authorization Rules Remain in Effect."
      >
        <Stack spacing={1.5}>
          <OfferValiditySettings policy={policy} disabled={disabled} onChange={onChange} />
          <FormControlLabel
            label="Require Confirmation That Terms Were Accepted"
            control={
              <Switch
                size="small"
                disabled={disabled}
                checked={policy.requireTermsAcceptance}
                onChange={(_, checked) => onChange({ requireTermsAcceptance: checked })}
              />
            }
          />
          {policy.offerType === 'conditional' && (
            <FormControlLabel
              label="Require Confirmation That Offer Conditions Were Satisfied"
              control={
                <Switch
                  size="small"
                  disabled={disabled}
                  checked={policy.requireConditionsConfirmation}
                  onChange={(_, checked) => onChange({ requireConditionsConfirmation: checked })}
                />
              }
            />
          )}
          <FormControlLabel
            label="Require a Reason When an Offer Is Declined"
            control={
              <Switch
                size="small"
                disabled={disabled}
                checked={policy.requireDeclineReason}
                onChange={(_, checked) => onChange({ requireDeclineReason: checked })}
              />
            }
          />
          <WorkflowSettingLabel
            label="Outcomes That May Complete This Stage"
            help="The offer must reach one of these outcomes before this stage can finish. Configure its next-stage paths separately."
          />
          <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1}>
            {OUTCOMES.map((item) => (
              <FormControlLabel
                key={item.value}
                label={item.label}
                control={
                  <Checkbox
                    size="small"
                    disabled={disabled}
                    checked={policy.allowedCompletionOutcomes.includes(item.value)}
                    onChange={(_, checked) => toggleOutcome(item.value, checked)}
                  />
                }
              />
            ))}
          </Stack>
          <FormControlLabel
            label="Continue Automatically After Acceptance"
            control={
              <Switch
                size="small"
                disabled={disabled}
                checked={policy.autoAdvanceOnAcceptance}
                onChange={(_, checked) => onChange({ autoAdvanceOnAcceptance: checked })}
              />
            }
          />
        </Stack>
      </FormSectionCard>
      <FormSectionCard
        icon="mdi:cog-outline"
        title="Advanced Settings"
        descriptionTooltip="Configure Authorized Expiry Overrides, Extensions and Reissues. Existing Limits Are Preserved When the Section Is Collapsed."
      >
        <CustomAccordion
          title="Expiry, Extensions and Reissue"
          expanded={exceptions.value || invalidExtensions || invalidReissues}
          onChange={exceptions.onToggle}
          content={
            <Stack spacing={1.5}>
              <FormControlLabel
                label="Allow Staff to Override the Expiry Date"
                control={
                  <Switch
                    size="small"
                    disabled={disabled}
                    checked={policy.allowExpiryOverride}
                    onChange={(_, checked) =>
                      onChange({
                        allowExpiryOverride: checked,
                        minimumValidityDays: checked
                          ? policy.minimumValidityDays
                          : policy.validityDays,
                        maximumValidityDays: checked
                          ? policy.maximumValidityDays
                          : policy.validityDays,
                      })
                    }
                  />
                }
              />
              <Stack spacing={1.5}>
                <FormControlLabel
                  label="Allow Expiry Extension"
                  control={
                    <Switch
                      size="small"
                      disabled={disabled}
                      checked={policy.allowExtension}
                      onChange={(_, checked) =>
                        onChange({
                          allowExtension: checked,
                          maximumExtensions: checked ? Math.max(1, policy.maximumExtensions) : 0,
                        })
                      }
                    />
                  }
                />
                {policy.allowExtension && (
                  <TextField
                    size="small"
                    type="number"
                    label="Maximum Extensions"
                    error={invalidExtensions}
                    helperText={
                      invalidExtensions ? 'Enter a whole number from 0 to 20.' : undefined
                    }
                    fullWidth
                    value={policy.maximumExtensions}
                    disabled={disabled || !policy.allowExtension}
                    inputProps={{ min: 0, max: 20 }}
                    onChange={(event) =>
                      onChange({ maximumExtensions: Number(event.target.value) })
                    }
                  />
                )}
              </Stack>
              <Stack spacing={1.5}>
                <FormControlLabel
                  label="Allow Reissue"
                  control={
                    <Switch
                      size="small"
                      disabled={disabled}
                      checked={policy.allowReissue}
                      onChange={(_, checked) =>
                        onChange({
                          allowReissue: checked,
                          maximumReissues: checked ? Math.max(1, policy.maximumReissues) : 0,
                        })
                      }
                    />
                  }
                />
                {policy.allowReissue && (
                  <TextField
                    size="small"
                    type="number"
                    label="Maximum Reissues"
                    error={invalidReissues}
                    helperText={invalidReissues ? 'Enter a whole number from 0 to 10.' : undefined}
                    fullWidth
                    value={policy.maximumReissues}
                    disabled={disabled || !policy.allowReissue}
                    inputProps={{ min: 0, max: 10 }}
                    onChange={(event) => onChange({ maximumReissues: Number(event.target.value) })}
                  />
                )}
              </Stack>
            </Stack>
          }
        />
      </FormSectionCard>
    </Stack>
  );
}
