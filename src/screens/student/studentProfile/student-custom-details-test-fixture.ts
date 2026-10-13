import type { RecordSnapshot } from 'src/redux/student/records/student-record-changes-api';
import type {
  AdmissionFormField,
  AdmissionFormSection,
} from 'src/redux/student/admissions/admission-forms-api';
import type {
  StudentRecordDetails,
  RecordRegistrationSource,
} from 'src/redux/student/records/student-record-details-api';

export const customStudentId = 'ad400001-0000-4000-8000-000000000001';

export function customField(
  code: string,
  fieldType: AdmissionFormField['fieldType'] = 0,
  overrides: Partial<AdmissionFormField> = {}
): AdmissionFormField {
  return {
    id: `field-${code}`,
    code,
    label: code,
    fieldType,
    bindingType: 1,
    required: false,
    readOnly: false,
    displayOrder: 0,
    ...overrides,
  };
}

export function customSection(
  fields: AdmissionFormField[],
  overrides: Partial<AdmissionFormSection> = {}
): AdmissionFormSection {
  return {
    id: 'section-school',
    code: 'SCHOOL',
    name: 'School details',
    displayOrder: 0,
    fields,
    ...overrides,
  };
}

export function customSource(
  sections: AdmissionFormSection[],
  values: Record<string, unknown>,
  overrides: Partial<RecordRegistrationSource> = {}
): RecordRegistrationSource {
  return {
    applicationId: 'application-1',
    applicationNumber: 'APP-001',
    academicYearId: 'year-1',
    formInstanceId: 'instance-1',
    submissionId: 'submission-1',
    submittedAt: '2026-09-01T08:00:00Z',
    finalizedAt: '2026-09-02T08:00:00Z',
    onboardingCaseId: 'case-1',
    onboardingStatus: 'Activated',
    formDefinitionId: 'form-version-1',
    formFamilyId: 'registration-family-1',
    formVersion: 1,
    formName: 'School Registration',
    definition: {
      id: overrides.formDefinitionId ?? 'form-version-1',
      name: overrides.formName ?? 'School Registration',
      code: 'REGISTRATION',
      version: overrides.formVersion ?? 1,
      status: 1,
      layoutType: 0,
      purpose: 1,
      sectionCount: sections.length,
      sections,
    },
    originalValues: structuredClone(values),
    currentValues: structuredClone(values),
    isBaseline: true,
    editableFieldCodes: sections.flatMap((section) => section.fields.map((field) => field.code)),
    capturedFieldCodes: sections.flatMap((section) => section.fields.map((field) => field.code)),
    differences: [],
    ...overrides,
  };
}

export function customDetails(sources: RecordRegistrationSource[]): StudentRecordDetails {
  return {
    studentId: customStudentId,
    recordsAccess: 'Full',
    structuredSections: [],
    customDetailsMasked: false,
    customDetailsEditable: true,
    registrationSources: sources,
  };
}

export function customSnapshot(
  sources: RecordRegistrationSource[],
  snapshot = 'frozen-snapshot-1'
): RecordSnapshot {
  return {
    section: 'custom-details',
    snapshot,
    data: {
      sources: sources.map((source) => ({
        applicationId: source.applicationId,
        formInstanceId: source.formInstanceId,
        submissionId: source.submissionId,
        values: structuredClone(source.currentValues),
      })),
    },
  };
}
