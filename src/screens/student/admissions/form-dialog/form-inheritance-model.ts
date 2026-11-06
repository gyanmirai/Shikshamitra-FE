import type {
  AdmissionFormField,
  CreateUpdateAdmissionForm,
  AdmissionFormInheritanceSource,
  AdmissionFormSystemFieldMetadata,
} from 'src/redux/student/admissions/admission-forms-api';

import { getAdmissionFormStepGroups } from './form-step-groups';
import { isClassInterestQuestion } from '../admission-class-question';
import { mergeInquiryContextSections } from '../inquiry-context-presentation';
import { parseRuntimeOptionsSource } from '../application-detail/application-runtime-options';

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

export function setInheritedStepName(
  form: CreateUpdateAdmissionForm,
  sourceId: string,
  stepCode: string,
  name: string
) {
  return updateSource(form, sourceId, (source) => ({
    ...source,
    stepNames: { ...source.stepNames, [stepCode]: name },
  }));
}

/** Apply live title edits while a fresh server composition is pending. */
export function applyInheritedStepNames(
  form: CreateUpdateAdmissionForm,
  sections: CreateUpdateAdmissionForm['sections']
) {
  const titles = new Map(
    getAdmissionFormStepGroups(sections).map((step) => {
      const sourceId = step.sections
        .flatMap((item) => item.section.fields)
        .find((field) => field.inheritedFrom)?.inheritedFrom?.inquiryFormDefinitionId;
      const policy = form.inheritance?.sources.find(
        (source) => source.inquiryFormDefinitionId === sourceId
      );
      return [step.id, policy?.stepNames?.[step.code]];
    })
  );
  return sections.map((section) => {
    const name = titles.get(section.stepId ?? section.id);
    return name === undefined ? section : { ...section, stepName: name };
  });
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
  effective?: ComposedForm | null,
  contextSections: CreateUpdateAdmissionForm['sections'] = []
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
        sections: applyInheritedStepNames(
          form,
          mergeInquiryContextSections(effective.sections, contextSections)
        ).map((section) => ({
          ...section,
          fieldsPerRow: form.fieldsPerRow,
        })),
      }
    : form;
}

/** Keep a pending preview's source structure without restoring an older base draft. */
export function getInheritanceBuilderValues(
  form: CreateUpdateAdmissionForm,
  effective?: ComposedForm | null,
  previewBaseSectionIds: readonly string[] = form.sections.map((section) => section.id),
  contextSections: CreateUpdateAdmissionForm['sections'] = []
): CreateUpdateAdmissionForm {
  if (!effective) return form;
  effective = {
    ...effective,
    sections: mergeInquiryContextSections(effective.sections, contextSections).map((section) => ({
      ...section,
      fieldsPerRow: form.fieldsPerRow,
    })),
  };
  const snapshotBaseIds = new Set(previewBaseSectionIds);
  const inherited = getInheritedFields(effective);
  const suppressedAcademicParents = getSuppressedAcademicParents(form, effective, inherited);
  const sourceSections = effective.sections
    .filter((section) => !snapshotBaseIds.has(section.id))
    .sort((left, right) => left.displayOrder - right.displayOrder);
  const baseSections = [...form.sections]
    .sort((left, right) => left.displayOrder - right.displayOrder)
    .flatMap((base) => {
      const section = effective.sections.find((item) => item.id === base.id);
      const editableFields = base.fields.filter(
        (field) =>
          !suppressedAcademicParents.has(field.id) &&
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

/** Keep server-suppressed companions hidden without losing new shared dependents during preview refresh. */
function getSuppressedAcademicParents(
  form: CreateUpdateAdmissionForm,
  effective: FormSections,
  inherited: AdmissionFormField[]
) {
  const local = form.sections.flatMap((section) => section.fields);
  const effectiveIds = new Set(
    effective.sections.flatMap((section) => section.fields.map((field) => field.id))
  );
  const candidates = new Map<string, AdmissionFormField>();
  const replacedClasses = new Set<string>();
  local.forEach((standard) => {
    const source = parseRuntimeOptionsSource(standard.optionsJson);
    if (
      standard.fieldType !== 6 ||
      source?.source !== 'StandardsByMedium' ||
      !inherited.some(
        (field) =>
          field.id === standard.id &&
          parseRuntimeOptionsSource(field.optionsJson)?.source === 'Standards'
      )
    )
      return;
    const medium = local.find(
      (field) =>
        field.code === source.parentField &&
        field.fieldType === 6 &&
        parseRuntimeOptionsSource(field.optionsJson)?.source === 'EducationMediums'
    );
    const mediumSource = parseRuntimeOptionsSource(medium?.optionsJson);
    const board = local.find(
      (field) =>
        field.code === mediumSource?.parentField &&
        field.fieldType === 6 &&
        parseRuntimeOptionsSource(field.optionsJson)?.source === 'EducationBoards'
    );
    if (!medium || !board || parseRuntimeOptionsSource(board.optionsJson)?.parentField) return;
    replacedClasses.add(standard.id);
    [medium, board]
      .filter((field) => !effectiveIds.has(field.id))
      .forEach((field) => candidates.set(field.id, field));
  });
  const suppressed = new Set<string>();
  [...candidates.values()]
    .sort(
      (left, right) =>
        Number(parseRuntimeOptionsSource(left.optionsJson)?.source === 'EducationBoards') -
        Number(parseRuntimeOptionsSource(right.optionsJson)?.source === 'EducationBoards')
    )
    .forEach((parent) => {
      const referenced =
        local.some(
          (field) =>
            field.id !== parent.id &&
            !replacedClasses.has(field.id) &&
            !suppressed.has(field.id) &&
            [
              field.optionsJson,
              field.validationJson,
              field.visibilityRuleJson,
              field.requiredRuleJson,
            ].some((json) => referencesField(json, parent.code))
        ) ||
        form.sections.some((section) =>
          [
            section.visibilityRuleJson,
            section.requiredRuleJson,
            section.stepVisibilityRuleJson,
          ].some((json) => referencesField(json, parent.code))
        );
      if (!referenced) suppressed.add(parent.id);
    });
  return suppressed;
}

function referencesField(json: string | null | undefined, code: string): boolean {
  if (!json?.trim()) return false;
  const containsCode = (value: unknown): boolean =>
    typeof value === 'string'
      ? value.toLowerCase() === code.toLowerCase()
      : Array.isArray(value)
        ? value.some(containsCode)
        : Boolean(value && typeof value === 'object' && Object.values(value).some(containsCode));
  try {
    return containsCode(JSON.parse(json));
  } catch {
    return false;
  }
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
