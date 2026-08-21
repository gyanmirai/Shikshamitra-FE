import { parseFieldConfiguration } from './form-dialog/form-field-presets';

type Field = { code: string; validationJson?: string | null };

export function getDependentAdmissionFieldCodes(fields: Field[], changedCode: string) {
  const result = new Set<string>();
  const pending = [changedCode];
  while (pending.length) {
    const parent = pending.shift();
    fields.forEach((field) => {
      const configuration = parseFieldConfiguration(field.validationJson);
      if (
        !result.has(field.code) &&
        (configuration.countryField === parent || configuration.stateField === parent)
      ) {
        result.add(field.code);
        pending.push(field.code);
      }
    });
  }
  return [...result];
}
