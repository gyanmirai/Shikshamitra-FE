import type { FormikErrors } from 'formik';
import type {
  EsiConfigurationDraft,
  EsiConfigurationSettings,
} from 'src/redux/hr/esi-configuration-api';

export function configurationValues(settings: EsiConfigurationSettings): EsiConfigurationDraft {
  if (!settings.current) throw new Error('ESIC configuration is unavailable.');
  const selected =
    settings.history.find(
      (item) => !item.isCancelled && item.effectiveMonth <= settings.suggestedEffectiveMonth
    ) ?? settings.current;
  return {
    effectiveMonth: settings.suggestedEffectiveMonth,
    calculationSettings: {
      eligibilityBasis: 'CLASSIFIED_EARNINGS',
      calculationBasis: 'CLASSIFIED_EARNINGS',
    },
    concurrencyStamp: selected.concurrencyStamp,
    enabled: selected.enabled,
    registrationNumber: selected.registrationNumber ?? '',
    coveredSince: selected.coveredSince?.slice(0, 10) ?? '',
    treatments: [],
  };
}
export function validateConfiguration(
  values: EsiConfigurationDraft
): FormikErrors<EsiConfigurationDraft> {
  const errors: FormikErrors<EsiConfigurationDraft> = {};
  if (values.registrationNumber.length > 100)
    errors.registrationNumber = 'Use 100 characters or fewer.';
  if (!values.effectiveMonth || !/^\d{4}-(0[1-9]|1[0-2])$/.test(values.effectiveMonth))
    errors.effectiveMonth = 'Choose an effective month.';
  return errors;
}
export function configurationPayload(values: EsiConfigurationDraft): EsiConfigurationDraft {
  return {
    ...values,
    calculationSettings: {
      eligibilityBasis: 'CLASSIFIED_EARNINGS',
      calculationBasis: 'CLASSIFIED_EARNINGS',
    },
    registrationNumber: values.registrationNumber.trim(),
    coveredSince: values.coveredSince || null,
  };
}
