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
    calculationSettings: selected.calculationSettings ?? {
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
  const config = values.calculationSettings;
  if (
    (config?.eligibilityBasis === 'BASIC_COMPONENT' ||
      config?.calculationBasis === 'BASIC_COMPONENT') &&
    !config.basicComponentId
  )
    errors.calculationSettings = { basicComponentId: 'Choose the Basic salary component.' };
  if (config?.employeePercentage != null || config?.employerPercentage != null) {
    const configurationErrors: Record<string, string> = {};
    (['employeePercentage', 'employerPercentage'] as const).forEach((key) => {
      const value = config[key];
      if (value != null && (!Number.isFinite(value) || value < 0 || value > 100))
        configurationErrors[key] = 'Use a percentage from 0 to 100.';
    });
    if (!config.overrideReason?.trim())
      configurationErrors.overrideReason = 'Explain the rate override.';
    if (!config.evidenceReference?.trim())
      configurationErrors.evidenceReference = 'Add the supporting evidence reference.';
    if ((config.overrideReason?.length ?? 0) > 500)
      configurationErrors.overrideReason = 'Use 500 characters or fewer.';
    if ((config.evidenceReference?.length ?? 0) > 1000)
      configurationErrors.evidenceReference = 'Use 1000 characters or fewer.';
    if (Object.keys(configurationErrors).length)
      errors.calculationSettings = {
        ...(typeof errors.calculationSettings === 'object' ? errors.calculationSettings : {}),
        ...configurationErrors,
      };
  }
  return errors;
}
export function configurationPayload(values: EsiConfigurationDraft): EsiConfigurationDraft {
  return {
    ...values,
    registrationNumber: values.registrationNumber.trim(),
    coveredSince: values.coveredSince || null,
  };
}
