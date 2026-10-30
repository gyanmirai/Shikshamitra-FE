import type {
  AdmissionFormField,
  CreateUpdateAdmissionForm,
  AdmissionFormInheritanceSource,
  AdmissionFormSystemFieldMetadata,
} from 'src/redux/student/admissions/admission-forms-api';

type FormSections = Pick<CreateUpdateAdmissionForm, 'sections'>;

export function getInheritedFields(form?: FormSections | null): AdmissionFormField[] {
  return (
    form?.sections.flatMap((section) => section.fields.filter((field) => field.inheritedFrom)) ?? []
  );
}

export function approveInquirySource(
  form: CreateUpdateAdmissionForm,
  sourceId: string
): CreateUpdateAdmissionForm {
  const sources = form.inheritance?.sources ?? [];
  return {
    ...form,
    inheritance: {
      enabled: true,
      sources: sources.some((source) => source.inquiryFormDefinitionId === sourceId)
        ? sources
        : [
            ...sources,
            {
              inquiryFormDefinitionId: sourceId,
              requiredFieldIdentities: [],
              fieldMappings: [],
              layouts: [],
            },
          ],
    },
  };
}

export function resetInheritedSourceOverrides(
  form: CreateUpdateAdmissionForm,
  sourceId: string
): CreateUpdateAdmissionForm {
  if (!form.inheritance?.sources.some((source) => source.inquiryFormDefinitionId === sourceId))
    return form;
  return {
    ...form,
    inheritance: {
      ...form.inheritance,
      sources: form.inheritance.sources.map((source) =>
        source.inquiryFormDefinitionId === sourceId
          ? { ...source, requiredFieldIdentities: [], fieldMappings: [], layouts: [] }
          : source
      ),
    },
  };
}

function updateSource(
  form: CreateUpdateAdmissionForm,
  sourceId: string,
  update: (source: AdmissionFormInheritanceSource) => AdmissionFormInheritanceSource
) {
  const next = approveInquirySource(form, sourceId);
  return {
    ...next,
    inheritance: {
      ...next.inheritance!,
      sources: next.inheritance!.sources.map((source) =>
        source.inquiryFormDefinitionId === sourceId ? update(source) : source
      ),
    },
  };
}

export function setInheritedFieldRequired(
  form: CreateUpdateAdmissionForm,
  sourceId: string,
  identity: string,
  required: boolean
) {
  return updateSource(form, sourceId, (source) => ({
    ...source,
    requiredFieldIdentities: required
      ? [...new Set([...source.requiredFieldIdentities, identity])]
      : source.requiredFieldIdentities.filter((key) => key !== identity),
  }));
}

export function setInheritedFieldLayout(
  form: CreateUpdateAdmissionForm,
  sourceId: string,
  identity: string,
  layout: { targetSectionCode?: string; displayOrder?: number }
) {
  return updateSource(form, sourceId, (source) => ({
    ...source,
    layouts: [
      ...source.layouts.filter((item) => item.fieldIdentity !== identity),
      { fieldIdentity: identity, ...layout },
    ],
  }));
}

export function setInheritedFieldMapping(
  form: CreateUpdateAdmissionForm,
  sourceId: string,
  sourceFieldCode: string,
  registrationFieldCode?: string,
  sourceFieldIdentity?: string
) {
  const fields = form.sections.flatMap((section) => section.fields);
  return updateSource(form, sourceId, (source) => {
    const previous = source.fieldMappings.find(
      (mapping) => mapping.sourceFieldCode === sourceFieldCode
    );
    const oldIdentity =
      fields.find((field) => field.code === previous?.registrationFieldCode)?.fieldIdentity ??
      sourceFieldIdentity;
    const nextIdentity =
      fields.find((field) => field.code === registrationFieldCode)?.fieldIdentity ??
      sourceFieldIdentity;
    const migrate = (identity: string) =>
      oldIdentity && nextIdentity && identity === oldIdentity ? nextIdentity : identity;
    return {
      ...source,
      fieldMappings: [
        ...source.fieldMappings.filter((mapping) => mapping.sourceFieldCode !== sourceFieldCode),
        ...(registrationFieldCode ? [{ sourceFieldCode, registrationFieldCode }] : []),
      ],
      requiredFieldIdentities: [...new Set(source.requiredFieldIdentities.map(migrate))],
      layouts: [
        ...new Map(
          source.layouts.map((layout) => {
            const next = { ...layout, fieldIdentity: migrate(layout.fieldIdentity) };
            return [next.fieldIdentity, next] as const;
          })
        ).values(),
      ],
    };
  });
}

export function getInheritancePreviewValues(
  form: CreateUpdateAdmissionForm,
  effective?: FormSections | null
): CreateUpdateAdmissionForm {
  return effective ? { ...form, ...effective, sections: effective.sections } : form;
}

function sameIdentity(field: AdmissionFormField, inherited: AdmissionFormField) {
  if (
    field.bindingType === 0 &&
    inherited.bindingType === 0 &&
    field.bindingKey &&
    inherited.bindingKey
  )
    return field.bindingKey.toLowerCase() === inherited.bindingKey.toLowerCase();
  return Boolean(
    field.fieldIdentity &&
    inherited.fieldIdentity &&
    field.fieldIdentity === inherited.fieldIdentity
  );
}

/** Decorate a builder view only: computed source fields never become base draft data. */
export function markInheritedRegistrationFields(
  form: CreateUpdateAdmissionForm,
  effective?: FormSections | null
): CreateUpdateAdmissionForm {
  const inherited = getInheritedFields(effective);
  if (!inherited.length) return form;
  return {
    ...form,
    sections: form.sections.map((section) => ({
      ...section,
      fields: section.fields.map((field) => {
        const source = inherited.find((candidate) => sameIdentity(field, candidate));
        return source
          ? { ...field, label: source.label, inheritedFrom: source.inheritedFrom }
          : field;
      }),
    })),
  };
}

const STUDENT_ALIASES: Record<string, readonly string[]> = {
  'applicant.firstname': ['fname', 'first_name', 'given name'],
  'applicant.lastname': ['lname', 'last_name', 'surname', 'family name'],
  'applicant.dateofbirth': ['dob', 'birth date', 'birthdate', 'date_of_birth'],
};

export function findExistingStudentFieldAlias(
  label: string,
  fields: readonly AdmissionFormSystemFieldMetadata[]
) {
  const name = label.trim().toLowerCase();
  return fields.find(
    (field) =>
      STUDENT_ALIASES[field.key.toLowerCase()] &&
      (STUDENT_ALIASES[field.key.toLowerCase()].includes(name) ||
        field.displayName.trim().toLowerCase() === name)
  );
}
