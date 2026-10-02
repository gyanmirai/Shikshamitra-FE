import type { FormikErrors } from 'formik';
import type {
  EsiConfigurationDraft,
  EsiConfigurationSettings,
} from 'src/redux/hr/esi-configuration-api';

export function configurationValues(settings: EsiConfigurationSettings): EsiConfigurationDraft {
  if (!settings.current) throw new Error('ESIC configuration is unavailable.');
  return {
    concurrencyStamp: settings.current.concurrencyStamp,
    enabled: settings.current.enabled,
    registrationNumber: settings.current.registrationNumber ?? '',
    coveredSince: settings.current.coveredSince?.slice(0, 10) ?? '',
    treatments: [],
  };
}
export function validateConfiguration(
  values: EsiConfigurationDraft
): FormikErrors<EsiConfigurationDraft> {
  const errors: FormikErrors<EsiConfigurationDraft> = {};
  if (values.registrationNumber.length > 100)
    errors.registrationNumber = 'Use 100 characters or fewer.';
  return errors;
}
export function configurationPayload(values: EsiConfigurationDraft): EsiConfigurationDraft {
  return {
    ...values,
    registrationNumber: values.registrationNumber.trim(),
    coveredSince: values.coveredSince || null,
  };
}
