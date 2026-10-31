import type {
  AdmissionFormField,
  CreateUpdateAdmissionForm,
  AdmissionFormInheritanceSource,
  AdmissionFormSystemFieldMetadata,
} from 'src/redux/student/admissions/admission-forms-api';

import { getAdmissionFormStepGroups } from './form-step-groups';
import { isClassInterestQuestion } from '../admission-class-question';

type FormSections = Pick<CreateUpdateAdmissionForm, 'sections'>;
type ComposedForm = FormSections &
  Partial<Pick<CreateUpdateAdmissionForm, 'layoutType' | 'supportedLanguages'>>;

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
  effective?: ComposedForm | null
): CreateUpdateAdmissionForm {
  // The composition preserves Inquiry steps and section columns. Keep live
  // Registration grid changes, and immediately reflect a newly added base step.
  return effective
    ? {
        ...form,
        layoutType: form.layoutType === 1 ? 1 : (effective.layoutType ?? form.layoutType),
        supportedLanguages: [
          ...new Set([...form.supportedLanguages, ...(effective.supportedLanguages ?? [])]),
        ],
        sections: effective.sections,
      }
    : form;
}

/** Keep a pending preview's source structure without restoring an older base draft. */
export function getInheritanceBuilderValues(
  form: CreateUpdateAdmissionForm,
  effective?: ComposedForm | null,
  previewBaseSectionIds: readonly string[] = form.sections.map((section) => section.id)
): CreateUpdateAdmissionForm {
  if (!effective) return form;
  const snapshotBaseIds = new Set(previewBaseSectionIds);
  const inherited = getInheritedFields(effective);
  const sourceSections = effective.sections
    .filter((section) => !snapshotBaseIds.has(section.id))
    .sort((left, right) => left.displayOrder - right.displayOrder);
  const baseSections = [...form.sections]
    .sort((left, right) => left.displayOrder - right.displayOrder)
    .flatMap((base) => {
      const section = effective.sections.find((item) => item.id === base.id);
      const editableFields = base.fields.filter(
        (field) =>
          !inherited.some(
            (source) =>
              source.id === field.id ||
              sameIdentity(field, source) ||
              form.inheritance?.sources.some(
                (policy) =>
                  policy.inquiryFormDefinitionId ===
                    source.inheritedFrom?.inquiryFormDefinitionId &&
                  policy.fieldMappings.some(
                    (mapping) =>
                      mapping.sourceFieldCode === source.inheritedFrom?.sourceFieldCode &&
                      mapping.registrationFieldCode === field.code
                  )
              )
          )
      );
      const fields = (section?.fields ?? []).flatMap((field) => {
        if (field.inheritedFrom) return [field];
        const current = editableFields.find((item) => item.id === field.id);
        return current ? [current] : [];
      });
      const displayed = new Set(fields.map((field) => field.id));
      fields.push(...editableFields.filter((field) => !displayed.has(field.id)));
      // Composition deliberately omits duplicate-only sections. Keep them omitted,
      // but show a new Registration question immediately while its preview is pending.
      if (!fields.length && snapshotBaseIds.has(base.id) && (!section || base.fields.length > 0))
        return [];
      return [
        {
          ...section,
          ...base,
          fields: fields.sort((left, right) => left.displayOrder - right.displayOrder),
          stepDisplayOrder: base.stepDisplayOrder ?? section?.stepDisplayOrder,
        },
      ];
    });
  // A single-page Registration stays one group when the selected Inquiry has
  // steps, including base sections added while a fresh composition is pending.
  const basePage =
    form.layoutType === 0 && effective.layoutType === 1
      ? effective.sections.find((section) => snapshotBaseIds.has(section.id))
      : undefined;
  const groupedBase =
    form.layoutType === 0 && effective.layoutType === 1
      ? baseSections.map((section) => ({
          ...section,
          stepId: basePage?.stepId ?? 'registration-page',
          stepCode: basePage?.stepCode ?? 'REGISTRATION_PAGE',
          stepName: basePage?.stepName ?? form.name,
          stepDisplayOrder: 0,
          stepVisibilityRuleJson: undefined,
        }))
      : baseSections;
  const sourceOrders = new Map(
    getAdmissionFormStepGroups(sourceSections).map((step, index) => [step.id, index])
  );
  const baseOrders = new Map(
    getAdmissionFormStepGroups(groupedBase).map((step, index) => [
      step.id,
      sourceOrders.size + index,
    ])
  );
  const stepper = form.layoutType === 1 || effective.layoutType === 1;
  const viewSections = [
    ...sourceSections.map((section) =>
      stepper
        ? { ...section, stepDisplayOrder: sourceOrders.get(section.stepId ?? section.id) }
        : section
    ),
    ...groupedBase.map((section) =>
      stepper
        ? { ...section, stepDisplayOrder: baseOrders.get(section.stepId ?? section.id) }
        : section
    ),
  ].map((section, index) => ({ ...section, displayOrder: index }));
  return getInheritancePreviewValues(form, {
    ...effective,
    sections: viewSections,
  });
}

function sameIdentity(field: AdmissionFormField, inherited: AdmissionFormField) {
  if (isClassInterestQuestion(field) && isClassInterestQuestion(inherited)) return true;
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
        const source = inherited.find(
          (candidate) => candidate.id === field.id || sameIdentity(field, candidate)
        );
        return source
          ? {
              ...field,
              label: source.label,
              required: source.required,
              readOnly: source.readOnly,
              inheritedFrom: source.inheritedFrom,
            }
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
