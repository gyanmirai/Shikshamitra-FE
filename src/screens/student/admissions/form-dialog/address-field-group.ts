import type {
  AdmissionFormField,
  CreateUpdateAdmissionForm,
  AdmissionFormSystemFieldMetadata,
} from 'src/redux/student/admissions/admission-forms-api';

import { newField, nextFieldOrder } from './form-dialog-model';
import { placeLinkedFormFields } from './place-linked-form-fields';
import { getAddressLocationField } from './form-address-dependencies';
import { configureStudentField } from './student-field-configuration';
import { CUSTOM_FIELD_PRESETS, parseFieldConfiguration } from './form-field-presets';

const addressNames = ['Country', 'State', 'City'] as const;
type AddressName = (typeof addressNames)[number];
type AddressKind = Lowercase<AddressName>;
type AddressGroup = 'Address' | 'PermanentAddress';

export function getAddressGroupChoice(binding?: string, preset?: string) {
  const [prefix, suffix] = binding?.toLowerCase().split('.') ?? [];
  const name = addressNames.find((item) => item.toLowerCase() === (binding ? suffix : preset));
  if (!name) return undefined;
  let group: AddressGroup | undefined;
  if (prefix === 'address') group = 'Address';
  if (prefix === 'permanentaddress') group = 'PermanentAddress';
  return !binding || group ? { name, group } : undefined;
}

export function addAddressFieldGroup(
  form: CreateUpdateAdmissionForm,
  selectedSectionId: string | null,
  choice: NonNullable<ReturnType<typeof getAddressGroupChoice>>,
  metadata: AdmissionFormSystemFieldMetadata[],
  inheritedFields: AdmissionFormField[]
) {
  const { group, name } = choice;
  const section = form.sections.find(
    (item) => item.id === selectedSectionId && (!group || !item.isRepeatable)
  ) ??
    form.sections.find((item) => !group || !item.isRepeatable) ?? {
      id: crypto.randomUUID(),
      code: `ADDRESS_${form.sections.length + 1}`,
      name: 'Address',
      displayOrder: form.sections.length,
      fields: [],
      isRepeatable: false,
      minEntries: 1,
      maxEntries: 1,
    };
  const local = form.sections.flatMap((item) => item.fields);
  const usedCodes = new Set(
    [...local, ...inheritedFields].map((field) => field.code.toUpperCase())
  );
  const inherited = group
    ? addressNames.map((part) =>
        inheritedFields.find(
          (field) =>
            field.bindingType === 0 &&
            field.bindingKey?.toLowerCase() === `${group}.${part}`.toLowerCase()
        )
      )
    : [];
  // Inquiry sections precede local Registration fields. Their definitions belong to the source.
  if (inherited.some(Boolean) && !inherited.every(Boolean))
    return { sections: form.sections, incompatibleSource: true };

  const groupFields: AdmissionFormField[] = [];
  addressNames.forEach((part, index) => {
    const kind = part.toLowerCase() as AddressKind;
    const binding = group ? `${group}.${part}` : undefined;
    const inheritedField = inherited[index];
    if (inheritedField) {
      groupFields.push(inheritedField);
      return;
    }

    const existing = binding
      ? local.find(
          (field) =>
            field.bindingType === 0 && field.bindingKey?.toLowerCase() === binding.toLowerCase()
        )
      : section.fields.find(
          (field) => field.bindingType === 1 && getAddressLocationField(field)?.kind === kind
        );
    const preset = CUSTOM_FIELD_PRESETS.find((item) => item.key === kind)!;
    const definition = metadata.find((item) => item.key === binding);
    let field =
      existing ??
      newField(
        section.id,
        nextFieldOrder(form.sections) + index,
        definition?.fieldType ?? preset.fieldType,
        preset
      );
    if (!existing) {
      const baseCode = (binding ?? part).replace('.', '_').toUpperCase();
      let code = baseCode;
      for (let suffix = 2; usedCodes.has(code); suffix += 1) code = `${baseCode}_${suffix}`;
      usedCodes.add(code);
      field = {
        ...field,
        code,
        bindingKey: code,
        label:
          definition?.displayName ??
          (group === 'PermanentAddress' ? `Permanent address ${kind}` : part),
      };
    }
    if (binding && (definition || !existing)) {
      const configured = configureStudentField(
        field,
        definition ?? {
          key: binding,
          displayName: field.label,
          description: '',
          fieldType: field.fieldType,
          readOnly: false,
        }
      );
      field = existing ? { ...existing, fieldType: configured.fieldType } : configured;
    }
    const configuration = parseFieldConfiguration(field.validationJson);
    groupFields.push({
      ...field,
      validationJson: JSON.stringify({
        ...configuration,
        format: kind,
        ...(index > 0 ? { countryField: groupFields[0].code } : {}),
        ...(index === 2 ? { stateField: groupFields[1].code } : {}),
      }),
    });
  });

  const selected = groupFields[addressNames.indexOf(name)];
  const editable = groupFields.filter((field) => !inherited.includes(field));
  const sections = editable.length ? placeLinkedFormFields(form, section, editable) : form.sections;
  return {
    sections,
    selected,
    inheritedField: inherited.includes(selected) ? selected : undefined,
  };
}
