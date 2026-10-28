import { parseFieldConfiguration } from './form-dialog/form-field-presets';
import { parseRuntimeOptionsSource } from './application-detail/application-runtime-options';
import { academicOptionsJson } from './admission-academic-options';
import { writeRepeatableValue } from './form-repeatable-values';

type Field = {
  code: string;
  fieldType?: number;
  validationJson?: string | null;
  optionsJson?: string | null;
};

export function getDependentAdmissionFieldCodes(fields: Field[], changedCode: string) {
  const result = new Set<string>();
  const pending = [changedCode];
  while (pending.length) {
    const parent = pending.shift();
    fields.forEach((field) => {
      const configuration = parseFieldConfiguration(field.validationJson);
      const source = parseRuntimeOptionsSource(
        academicOptionsJson({ ...field, fieldType: field.fieldType ?? 6 })
      );
      if (
        field.code !== changedCode &&
        !result.has(field.code) &&
        (configuration.countryField === parent ||
          configuration.stateField === parent ||
          source?.parentField === parent)
      ) {
        result.add(field.code);
        pending.push(field.code);
      }
    });
  }
  return [...result];
}

export function dependentAdmissionFieldValues(
  fields: Field[],
  changedCode: string,
  values: Record<string, string>,
  entryIndex?: number,
  repeatedCodes: string[] = []
) {
  return Object.fromEntries(
    getDependentAdmissionFieldCodes(fields, changedCode).map((code) => [
      code,
      entryIndex != null && repeatedCodes.includes(code)
        ? writeRepeatableValue(values[code], entryIndex, '')
        : '',
    ])
  );
}
