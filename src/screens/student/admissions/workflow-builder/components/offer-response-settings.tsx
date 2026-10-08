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
        title="Validity and response"
        descriptionTooltip="Define when offers expire, required acceptance evidence and outcomes that may complete this stage. Saved response and authorization rules remain in effect."
      >
        <Stack spacing={1.5}>
          <OfferValiditySettings policy={policy} disabled={disabled} onChange={onChange} />
          <FormControlLabel
            label="Require confirmation that terms were accepted"
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
              label="Require confirmation that offer conditions were satisfied"
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
            label="Require a reason when an offer is declined"
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
            label="Outcomes that may complete this stage"
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
            label="Continue automatically after acceptance"
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
        title="Advanced settings"
        descriptionTooltip="Configure authorized expiry overrides, extensions and reissues. Existing limits are preserved when the section is collapsed."
      >
        <CustomAccordion
          title="Expiry, extensions and reissue"
          expanded={exceptions.value || invalidExtensions || invalidReissues}
          onChange={exceptions.onToggle}
          content={
            <Stack spacing={1.5}>
              <FormControlLabel
                label="Allow staff to override the expiry date"
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
                  label="Allow expiry extension"
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
                    label="Maximum extensions"
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
                  label="Allow reissue"
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
                    label="Maximum reissues"
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
