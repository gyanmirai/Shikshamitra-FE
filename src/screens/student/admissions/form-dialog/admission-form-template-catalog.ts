import type {
  AdmissionForm,
  AdmissionFormField,
  AdmissionFormSection,
  CreateUpdateAdmissionForm,
} from 'src/redux/student/admissions/admission-forms-api';

import { lockNewInquiryStarter } from './inquiry-default-fields';
import { templateStudentBinding } from './template-student-fields';
import { getRegistrationFormTemplate } from './registration-form-template';
import { ensureAdmissionCustomFieldIdentities } from './form-field-identity';
import { configureStudentField, connectStudentAddressFields } from './student-field-configuration';

export type AdmissionFormTemplateCategory =
  | 'Admissions'
  | 'Student information'
  | 'Services'
  | 'Finance'
  | 'Documents and consent'
  | 'Surveys';

export type SystemAdmissionFormTemplateId =
  | 'admission-inquiry'
  | 'admission-application'
  | 'student-registration'
  | 'document-collection'
  | 'medical-information'
  | 'transport-request'
  | 'hostel-application'
  | 'scholarship-request'
  | 'consent-declaration'
  | 'feedback-survey';

export type AdmissionFormTemplateSummary = {
  id: SystemAdmissionFormTemplateId;
  title: string;
  description: string;
  bestFor: string;
  category: AdmissionFormTemplateCategory;
  icon: string;
  sectionCount: number;
  fieldCount: number;
  estimatedMinutes: number;
  recommended?: boolean;
};

type FieldInput = {
  code: string;
  label: string;
  fieldType?: AdmissionFormField['fieldType'];
  required?: boolean;
  bindingKey?: string;
  placeholder?: string;
  helpText?: string;
  optionsJson?: string;
  validationJson?: string;
  defaultValue?: string;
};

type SectionInput = {
  code: string;
  name: string;
  stepCode: string;
  stepName: string;
  fields: FieldInput[];
  repeatable?: boolean;
  entryLabel?: string;
};

type TemplateDefinition = AdmissionFormTemplateSummary & {
  create: () => CreateUpdateAdmissionForm;
};

const choices = (values: string[]) =>
  JSON.stringify(values.map((value) => ({ value, label: value })));

const yesNo = choices(['Yes', 'No']);
const classChoices = JSON.stringify({ source: 'Standards' });
const phoneValidation = JSON.stringify({ format: 'phone', phone: true });
const emailValidation = JSON.stringify({ format: 'email' });
const pincodeValidation = JSON.stringify({
  format: 'pincode',
  minLength: 6,
  maxLength: 6,
  regex: '^[0-9]{6}$',
});

function createField(
  sectionId: string,
  displayOrder: number,
  input: FieldInput
): AdmissionFormField {
  const linked = input.bindingKey ? undefined : templateStudentBinding(input.code);
  const bindingKey = input.bindingKey ?? linked?.bindingKey;
  const bindingType = bindingKey ? 0 : 1;
  const field: AdmissionFormField = {
    id: crypto.randomUUID(),
    sectionId,
    code: input.code,
    label: input.label,
    fieldType: linked?.fieldType ?? input.fieldType ?? 0,
    bindingType,
    bindingKey: bindingKey ?? input.code,
    required: input.required ?? false,
    readOnly: false,
    displayOrder,
    placeholder: input.placeholder,
    helpText: input.helpText,
    optionsJson: linked?.optionsJson ?? input.optionsJson,
    validationJson: input.validationJson,
    defaultValue: input.defaultValue,
  };
  return bindingKey
    ? configureStudentField(field, {
        key: bindingKey,
        displayName: input.label,
        description: '',
        fieldType: field.fieldType,
        readOnly: false,
        optionsJson: field.optionsJson,
        validationJson: field.validationJson,
      })
    : field;
}

function createSections(inputs: SectionInput[]): AdmissionFormSection[] {
  const stepIds = new Map<string, string>();
  const stepOrders = new Map<string, number>();
  return inputs.map((input, sectionOrder) => {
    if (!stepIds.has(input.stepCode)) {
      stepIds.set(input.stepCode, crypto.randomUUID());
      stepOrders.set(input.stepCode, stepOrders.size);
    }
    const id = crypto.randomUUID();
    return {
      id,
      code: input.code,
      name: input.name,
      displayOrder: sectionOrder,
      stepId: stepIds.get(input.stepCode),
      stepCode: input.stepCode,
      stepName: input.stepName,
      stepDisplayOrder: stepOrders.get(input.stepCode),
      isRepeatable: input.repeatable ?? false,
      minEntries: input.repeatable ? 0 : 1,
      maxEntries: input.repeatable ? 10 : 1,
      entryLabel: input.entryLabel,
      fields: connectStudentAddressFields(
        input.fields.map((field, fieldOrder) => createField(id, fieldOrder, field))
      ),
    };
  });
}

function createForm(
  name: string,
  code: string,
  description: string,
  sections: SectionInput[]
): CreateUpdateAdmissionForm {
  return {
    name,
    code,
    description,
    purpose: code.includes('INQUIRY') ? 0 : 1,
    layoutType: 1,
    fieldsPerRow: 2,
    defaultLanguage: 'en',
    supportedLanguages: ['en'],
    sections: createSections(sections),
  };
}

const studentIdentityFields = (): FieldInput[] => [
  {
    code: 'APPLICANT_FIRST_NAME',
    label: 'First name',
    bindingKey: 'Applicant.FirstName',
    required: true,
  },
  {
    code: 'APPLICANT_MIDDLE_NAME',
    label: 'Middle name',
    bindingKey: 'Applicant.MiddleName',
  },
  {
    code: 'APPLICANT_LAST_NAME',
    label: 'Last name',
    bindingKey: 'Applicant.LastName',
    required: true,
  },
  {
    code: 'APPLICANT_DATE_OF_BIRTH',
    label: 'Date of birth',
    fieldType: 5,
    bindingKey: 'Applicant.DateOfBirth',
    required: true,
  },
  {
    code: 'APPLICANT_GENDER',
    label: 'Gender',
    fieldType: 6,
    bindingKey: 'Applicant.Gender',
    optionsJson: choices(['Male', 'Female']),
  },
];

const applicantReferenceFields = (): FieldInput[] => [
  {
    code: 'APPLICANT_FIRST_NAME',
    label: 'Student first name',
    bindingKey: 'Applicant.FirstName',
    required: true,
  },
  {
    code: 'APPLICANT_LAST_NAME',
    label: 'Student last name',
    bindingKey: 'Applicant.LastName',
    required: true,
  },
];

const guardianFields = (): FieldInput[] => [
  { code: 'GUARDIAN_NAME', label: 'Parent or guardian name', required: true },
  { code: 'GUARDIAN_RELATION', label: 'Relationship to student', required: true },
  {
    code: 'GUARDIAN_MOBILE',
    label: 'Mobile number',
    fieldType: 4,
    bindingKey: 'Guardian.Mobile',
    validationJson: phoneValidation,
    required: true,
  },
  {
    code: 'GUARDIAN_EMAIL',
    label: 'Email address',
    fieldType: 3,
    bindingKey: 'Guardian.Email',
    validationJson: emailValidation,
  },
];

const declarationFields = (): FieldInput[] => [
  {
    code: 'DECLARATION_ACCEPTED',
    label: 'I confirm that the information provided is correct',
    fieldType: 9,
    required: true,
  },
  { code: 'DECLARATION_NAME', label: 'Name of parent or guardian', required: true },
];

const DEFINITIONS: TemplateDefinition[] = [
  {
    id: 'admission-inquiry',
    title: 'Admission inquiry',
    description: 'Collect the essential details needed for a counsellor to respond quickly.',
    bestFor: 'Early interest, open-house leads, and enquiry desks',
    category: 'Admissions',
    icon: 'mdi:account-question-outline',
    sectionCount: 2,
    fieldCount: 10,
    estimatedMinutes: 3,
    create: () =>
      createForm(
        'Admission inquiry',
        'ADMISSION_INQUIRY',
        'Short inquiry form for prospective families.',
        [
          {
            code: 'STUDENT_INTEREST',
            name: 'Student and admission interest',
            stepCode: 'STEP_INQUIRY',
            stepName: 'Inquiry',
            fields: [
              { code: 'STUDENT_NAME', label: 'Student name', required: true },
              { code: 'DATE_OF_BIRTH', label: 'Date of birth', fieldType: 5 },
              {
                code: 'CLASS_INTERESTED',
                label: 'Class interested in',
                fieldType: 6,
                optionsJson: classChoices,
                required: true,
              },
              {
                code: 'ACADEMIC_YEAR',
                label: 'Academic year',
                fieldType: 6,
                optionsJson: choices(['2026-2027', '2027-2028']),
                required: true,
              },
              {
                code: 'CAMPUS_PREFERENCE',
                label: 'Campus preference',
                helpText: 'Remove this field if your school has one campus.',
              },
            ],
          },
          {
            code: 'FAMILY_CONTACT',
            name: 'Family contact',
            stepCode: 'STEP_CONTACT',
            stepName: 'Contact',
            fields: [
              ...guardianFields().slice(0, 3),
              {
                code: 'CONTACT_PREFERENCE',
                label: 'Preferred contact method',
                fieldType: 6,
                optionsJson: choices(['Phone', 'WhatsApp', 'Email']),
              },
            ],
          },
        ]
      ),
  },
  {
    id: 'admission-application',
    title: 'Admission application',
    description: 'A balanced application covering student, family, address, and academic history.',
    bestFor: 'Most day schools starting a formal application',
    category: 'Admissions',
    icon: 'mdi:file-document-edit-outline',
    sectionCount: 5,
    fieldCount: 21,
    estimatedMinutes: 10,
    recommended: true,
    create: () =>
      createForm(
        'Admission application',
        'ADMISSION_APPLICATION',
        'Standard admission application for prospective students.',
        [
          {
            code: 'STUDENT_DETAILS',
            name: 'Student details',
            stepCode: 'STEP_STUDENT',
            stepName: 'Student',
            fields: studentIdentityFields(),
          },
          {
            code: 'PARENT_GUARDIAN',
            name: 'Parent or guardian',
            stepCode: 'STEP_FAMILY',
            stepName: 'Family',
            fields: guardianFields(),
          },
          {
            code: 'HOME_ADDRESS',
            name: 'Home address',
            stepCode: 'STEP_ADDRESS',
            stepName: 'Address',
            fields: [
              { code: 'ADDRESS_LINE_1', label: 'Address line 1', required: true },
              { code: 'ADDRESS_LINE_2', label: 'Address line 2' },
              { code: 'COUNTRY', label: 'Country', required: true },
              { code: 'CITY', label: 'City', required: true },
              { code: 'STATE', label: 'State', required: true },
              {
                code: 'PIN_CODE',
                label: 'PIN code',
                validationJson: pincodeValidation,
                required: true,
              },
            ],
          },
          {
            code: 'ACADEMIC_BACKGROUND',
            name: 'Academic background',
            stepCode: 'STEP_ACADEMIC',
            stepName: 'Academic history',
            fields: [
              {
                code: 'CLASS_APPLYING_FOR',
                label: 'Class applying for',
                fieldType: 6,
                optionsJson: classChoices,
                required: true,
              },
              { code: 'PREVIOUS_SCHOOL', label: 'Previous school' },
              {
                code: 'LAST_CLASS_COMPLETED',
                label: 'Last class completed',
                fieldType: 0,
              },
              { code: 'ACADEMIC_NOTES', label: 'Academic notes', fieldType: 1 },
            ],
          },
          {
            code: 'DECLARATION',
            name: 'Declaration',
            stepCode: 'STEP_DECLARATION',
            stepName: 'Declaration',
            fields: declarationFields(),
          },
        ]
      ),
  },
  {
    id: 'student-registration',
    title: 'Student registration',
    description: 'A comprehensive registration form for a confirmed student record.',
    bestFor: 'Detailed post-admission registration and record creation',
    category: 'Student information',
    icon: 'mdi:clipboard-account-outline',
    sectionCount: 15,
    fieldCount: 133,
    estimatedMinutes: 25,
    create: getRegistrationFormTemplate,
  },
  {
    id: 'document-collection',
    title: 'Document collection checklist',
    description: 'Record which admission documents a family has supplied or still owes.',
    bestFor: 'Document desks and pre-verification follow-up',
    category: 'Documents and consent',
    icon: 'mdi:folder-check-outline',
    sectionCount: 3,
    fieldCount: 9,
    estimatedMinutes: 4,
    create: () =>
      createForm(
        'Admission document collection',
        'ADMISSION_DOCUMENT_COLLECTION',
        'Checklist for admission documents and follow-up notes.',
        [
          {
            code: 'APPLICANT_REFERENCE',
            name: 'Student reference',
            stepCode: 'STEP_STUDENT',
            stepName: 'Student',
            fields: applicantReferenceFields(),
          },
          {
            code: 'DOCUMENT_CHECKLIST',
            name: 'Document checklist',
            stepCode: 'STEP_DOCUMENTS',
            stepName: 'Documents',
            fields: [
              { code: 'BIRTH_CERTIFICATE', label: 'Birth certificate supplied', fieldType: 9 },
              { code: 'ADDRESS_PROOF', label: 'Address proof supplied', fieldType: 9 },
              { code: 'IDENTITY_PROOF', label: 'Identity proof supplied', fieldType: 9 },
              { code: 'PREVIOUS_REPORT', label: 'Previous report card supplied', fieldType: 9 },
              {
                code: 'TRANSFER_CERTIFICATE',
                label: 'Transfer certificate supplied',
                fieldType: 9,
              },
            ],
          },
          {
            code: 'DOCUMENT_FOLLOW_UP',
            name: 'Follow-up',
            stepCode: 'STEP_FOLLOW_UP',
            stepName: 'Follow-up',
            fields: [
              { code: 'MISSING_DOCUMENTS', label: 'Missing documents', fieldType: 1 },
              { code: 'DOCUMENT_NOTES', label: 'Verification notes', fieldType: 1 },
            ],
          },
        ]
      ),
  },
  {
    id: 'medical-information',
    title: 'Medical information',
    description: 'Capture health conditions, medication, emergency contacts, and consent.',
    bestFor: 'School clinic, safety planning, and emergency readiness',
    category: 'Student information',
    icon: 'mdi:medical-bag',
    sectionCount: 4,
    fieldCount: 14,
    estimatedMinutes: 7,
    create: () =>
      createForm(
        'Student medical information',
        'STUDENT_MEDICAL_INFORMATION',
        'Student health and emergency information.',
        [
          {
            code: 'APPLICANT_REFERENCE',
            name: 'Student reference',
            stepCode: 'STEP_STUDENT',
            stepName: 'Student',
            fields: applicantReferenceFields(),
          },
          {
            code: 'HEALTH_INFORMATION',
            name: 'Health information',
            stepCode: 'STEP_HEALTH',
            stepName: 'Health',
            fields: [
              {
                code: 'BLOOD_GROUP',
                label: 'Blood group',
                fieldType: 6,
                optionsJson: choices(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
              },
              { code: 'ALLERGIES', label: 'Allergies', fieldType: 1 },
              { code: 'MEDICAL_CONDITIONS', label: 'Medical conditions', fieldType: 1 },
              { code: 'CURRENT_MEDICATION', label: 'Current medication', fieldType: 1 },
              { code: 'DOCTOR_NAME', label: 'Doctor name' },
              {
                code: 'DOCTOR_PHONE',
                label: 'Doctor phone',
                fieldType: 4,
                validationJson: phoneValidation,
              },
            ],
          },
          {
            code: 'EMERGENCY_CONTACT',
            name: 'Emergency contact',
            stepCode: 'STEP_EMERGENCY',
            stepName: 'Emergency contact',
            fields: [
              { code: 'EMERGENCY_NAME', label: 'Contact name', required: true },
              { code: 'EMERGENCY_RELATION', label: 'Relationship', required: true },
              {
                code: 'EMERGENCY_PHONE',
                label: 'Primary phone',
                fieldType: 4,
                validationJson: phoneValidation,
                required: true,
              },
              {
                code: 'EMERGENCY_ALTERNATE_PHONE',
                label: 'Alternate phone',
                fieldType: 4,
                validationJson: phoneValidation,
              },
            ],
          },
          {
            code: 'MEDICAL_CONSENT',
            name: 'Consent',
            stepCode: 'STEP_CONSENT',
            stepName: 'Consent',
            fields: [
              {
                code: 'EMERGENCY_TREATMENT_CONSENT',
                label: 'I authorize emergency medical care when required',
                fieldType: 9,
                required: true,
              },
              { code: 'CONSENT_GUARDIAN_NAME', label: 'Parent or guardian name', required: true },
            ],
          },
        ]
      ),
  },
  {
    id: 'transport-request',
    title: 'Transport request',
    description: 'Collect route, stop, schedule, and authorized pickup information.',
    bestFor: 'School bus registration and route planning',
    category: 'Services',
    icon: 'mdi:bus-school',
    sectionCount: 4,
    fieldCount: 13,
    estimatedMinutes: 6,
    create: () =>
      createForm(
        'Student transport request',
        'STUDENT_TRANSPORT_REQUEST',
        'Request for school transport service.',
        [
          {
            code: 'APPLICANT_REFERENCE',
            name: 'Student reference',
            stepCode: 'STEP_STUDENT',
            stepName: 'Student',
            fields: applicantReferenceFields(),
          },
          {
            code: 'TRANSPORT_NEED',
            name: 'Transport requirement',
            stepCode: 'STEP_TRANSPORT',
            stepName: 'Transport',
            fields: [
              {
                code: 'SERVICE_TYPE',
                label: 'Service required',
                fieldType: 6,
                optionsJson: choices(['Both pickup and drop', 'Pickup only', 'Drop only']),
                required: true,
              },
              { code: 'PREFERRED_ROUTE', label: 'Preferred route or area', required: true },
              { code: 'PICKUP_STOP', label: 'Preferred pickup stop', required: true },
              { code: 'PICKUP_TIME_NOTES', label: 'Timing notes' },
              { code: 'SERVICE_START_DATE', label: 'Requested start date', fieldType: 5 },
            ],
          },
          {
            code: 'PICKUP_CONTACTS',
            name: 'Pickup contacts',
            stepCode: 'STEP_CONTACTS',
            stepName: 'Contacts',
            fields: [
              { code: 'PRIMARY_PICKUP_NAME', label: 'Primary authorized person', required: true },
              {
                code: 'PRIMARY_PICKUP_PHONE',
                label: 'Primary phone',
                fieldType: 4,
                validationJson: phoneValidation,
                required: true,
              },
              { code: 'ALTERNATE_PICKUP_NAME', label: 'Alternate authorized person' },
              {
                code: 'ALTERNATE_PICKUP_PHONE',
                label: 'Alternate phone',
                fieldType: 4,
                validationJson: phoneValidation,
              },
            ],
          },
          {
            code: 'TRANSPORT_DECLARATION',
            name: 'Declaration',
            stepCode: 'STEP_DECLARATION',
            stepName: 'Declaration',
            fields: declarationFields(),
          },
        ]
      ),
  },
  {
    id: 'hostel-application',
    title: 'Hostel application',
    description:
      'Collect accommodation preferences, guardian details, health, and safety information.',
    bestFor: 'Boarding schools and residential programmes',
    category: 'Services',
    icon: 'mdi:home-city-outline',
    sectionCount: 5,
    fieldCount: 16,
    estimatedMinutes: 9,
    create: () =>
      createForm(
        'Student hostel application',
        'STUDENT_HOSTEL_APPLICATION',
        'Application for school hostel accommodation.',
        [
          {
            code: 'APPLICANT_REFERENCE',
            name: 'Student reference',
            stepCode: 'STEP_STUDENT',
            stepName: 'Student',
            fields: applicantReferenceFields(),
          },
          {
            code: 'LOCAL_GUARDIAN',
            name: 'Local guardian',
            stepCode: 'STEP_GUARDIAN',
            stepName: 'Guardian',
            fields: guardianFields(),
          },
          {
            code: 'ACCOMMODATION',
            name: 'Accommodation preference',
            stepCode: 'STEP_ACCOMMODATION',
            stepName: 'Accommodation',
            fields: [
              {
                code: 'HOSTEL_START_DATE',
                label: 'Requested start date',
                fieldType: 5,
                required: true,
              },
              {
                code: 'ROOM_PREFERENCE',
                label: 'Room preference',
                fieldType: 6,
                optionsJson: choices(['No preference', 'Shared room', 'Single room']),
              },
              {
                code: 'DIET_PREFERENCE',
                label: 'Diet preference',
                fieldType: 6,
                optionsJson: choices(['Vegetarian', 'Non-vegetarian', 'Vegan', 'Other']),
              },
              { code: 'ACCOMMODATION_NOTES', label: 'Accommodation notes', fieldType: 1 },
            ],
          },
          {
            code: 'HEALTH_SAFETY',
            name: 'Health and safety',
            stepCode: 'STEP_SAFETY',
            stepName: 'Health and safety',
            fields: [
              { code: 'MEDICAL_CONDITIONS', label: 'Medical conditions', fieldType: 1 },
              { code: 'ALLERGIES', label: 'Allergies', fieldType: 1 },
              { code: 'EMERGENCY_CONTACT', label: 'Emergency contact name', required: true },
              {
                code: 'EMERGENCY_PHONE',
                label: 'Emergency phone',
                fieldType: 4,
                validationJson: phoneValidation,
                required: true,
              },
            ],
          },
          {
            code: 'HOSTEL_DECLARATION',
            name: 'Declaration',
            stepCode: 'STEP_DECLARATION',
            stepName: 'Declaration',
            fields: declarationFields(),
          },
        ]
      ),
  },
  {
    id: 'scholarship-request',
    title: 'Scholarship or fee concession',
    description: 'Capture household context, financial need, and the requested support.',
    bestFor: 'Scholarship committees and fee-support review',
    category: 'Finance',
    icon: 'mdi:hand-coin-outline',
    sectionCount: 4,
    fieldCount: 14,
    estimatedMinutes: 8,
    create: () =>
      createForm(
        'Scholarship or fee concession request',
        'SCHOLARSHIP_REQUEST',
        'Student scholarship or fee concession request.',
        [
          {
            code: 'APPLICANT_REFERENCE',
            name: 'Student reference',
            stepCode: 'STEP_STUDENT',
            stepName: 'Student',
            fields: applicantReferenceFields(),
          },
          {
            code: 'HOUSEHOLD_INFORMATION',
            name: 'Household information',
            stepCode: 'STEP_HOUSEHOLD',
            stepName: 'Household',
            fields: [
              { code: 'PRIMARY_EARNER', label: 'Primary earning member', required: true },
              { code: 'PRIMARY_OCCUPATION', label: 'Occupation' },
              {
                code: 'ANNUAL_HOUSEHOLD_INCOME',
                label: 'Annual household income',
                fieldType: 2,
                required: true,
              },
              { code: 'DEPENDENT_COUNT', label: 'Number of dependants', fieldType: 2 },
              {
                code: 'SIBLINGS_IN_SCHOOL',
                label: 'Siblings studying in this school',
                fieldType: 6,
                optionsJson: yesNo,
              },
            ],
          },
          {
            code: 'SUPPORT_REQUEST',
            name: 'Support requested',
            stepCode: 'STEP_REQUEST',
            stepName: 'Request',
            fields: [
              {
                code: 'SUPPORT_TYPE',
                label: 'Support type',
                fieldType: 6,
                optionsJson: choices([
                  'Merit scholarship',
                  'Need-based scholarship',
                  'Fee concession',
                  'Sibling concession',
                  'Other',
                ]),
                required: true,
              },
              { code: 'REQUESTED_AMOUNT', label: 'Requested amount', fieldType: 2 },
              { code: 'REQUEST_REASON', label: 'Reason for request', fieldType: 1, required: true },
              {
                code: 'ACHIEVEMENTS',
                label: 'Academic or extracurricular achievements',
                fieldType: 1,
              },
              { code: 'SUPPORTING_DOCUMENTS', label: 'Supporting document details', fieldType: 1 },
            ],
          },
          {
            code: 'FINANCIAL_DECLARATION',
            name: 'Declaration',
            stepCode: 'STEP_DECLARATION',
            stepName: 'Declaration',
            fields: declarationFields(),
          },
        ]
      ),
  },
  {
    id: 'consent-declaration',
    title: 'Parent consent and declaration',
    description: 'Collect common permissions with a clear guardian declaration.',
    bestFor: 'Trips, media, emergency contact, and school policy consent',
    category: 'Documents and consent',
    icon: 'mdi:file-sign',
    sectionCount: 3,
    fieldCount: 10,
    estimatedMinutes: 5,
    create: () =>
      createForm(
        'Parent consent and declaration',
        'PARENT_CONSENT_DECLARATION',
        'Parent or guardian permissions and declaration.',
        [
          {
            code: 'APPLICANT_REFERENCE',
            name: 'Student reference',
            stepCode: 'STEP_STUDENT',
            stepName: 'Student',
            fields: applicantReferenceFields(),
          },
          {
            code: 'CONSENT_CHOICES',
            name: 'Consent choices',
            stepCode: 'STEP_CONSENT',
            stepName: 'Permissions',
            fields: [
              {
                code: 'PHOTO_CONSENT',
                label: 'School photography and media consent',
                fieldType: 6,
                optionsJson: yesNo,
                required: true,
              },
              {
                code: 'TRIP_CONSENT',
                label: 'Local educational visits consent',
                fieldType: 6,
                optionsJson: yesNo,
                required: true,
              },
              {
                code: 'EMERGENCY_CARE_CONSENT',
                label: 'Emergency care consent',
                fieldType: 6,
                optionsJson: yesNo,
                required: true,
              },
              {
                code: 'DIGITAL_PLATFORM_CONSENT',
                label: 'School digital platforms consent',
                fieldType: 6,
                optionsJson: yesNo,
                required: true,
              },
              {
                code: 'COMMUNICATION_CONSENT',
                label: 'School communications consent',
                fieldType: 6,
                optionsJson: yesNo,
                required: true,
              },
              { code: 'CONSENT_NOTES', label: 'Restrictions or notes', fieldType: 1 },
            ],
          },
          {
            code: 'CONSENT_DECLARATION',
            name: 'Declaration',
            stepCode: 'STEP_DECLARATION',
            stepName: 'Declaration',
            fields: declarationFields(),
          },
        ]
      ),
  },
  {
    id: 'feedback-survey',
    title: 'Parent feedback survey',
    description: 'Collect a short satisfaction rating and actionable comments.',
    bestFor: 'Admissions follow-up, orientation, and school-service feedback',
    category: 'Surveys',
    icon: 'mdi:comment-quote-outline',
    sectionCount: 3,
    fieldCount: 10,
    estimatedMinutes: 4,
    create: () =>
      createForm(
        'Parent feedback survey',
        'PARENT_FEEDBACK_SURVEY',
        'Short parent or guardian feedback survey.',
        [
          {
            code: 'RESPONDENT',
            name: 'About you',
            stepCode: 'STEP_RESPONDENT',
            stepName: 'About you',
            fields: [
              { code: 'RESPONDENT_NAME', label: 'Your name' },
              { code: 'RELATION_TO_STUDENT', label: 'Relationship to student' },
              {
                code: 'CONTACT_EMAIL',
                label: 'Email address',
                fieldType: 3,
                validationJson: emailValidation,
              },
            ],
          },
          {
            code: 'RATINGS',
            name: 'Your experience',
            stepCode: 'STEP_RATING',
            stepName: 'Rating',
            fields: [
              {
                code: 'OVERALL_RATING',
                label: 'Overall experience',
                fieldType: 6,
                optionsJson: choices(['Excellent', 'Good', 'Average', 'Poor']),
                required: true,
              },
              {
                code: 'COMMUNICATION_RATING',
                label: 'Communication',
                fieldType: 6,
                optionsJson: choices(['Excellent', 'Good', 'Average', 'Poor']),
              },
              {
                code: 'PROCESS_RATING',
                label: 'Ease of the process',
                fieldType: 6,
                optionsJson: choices(['Excellent', 'Good', 'Average', 'Poor']),
              },
              {
                code: 'RECOMMEND_SCHOOL',
                label: 'Would you recommend the school?',
                fieldType: 6,
                optionsJson: yesNo,
              },
            ],
          },
          {
            code: 'COMMENTS',
            name: 'Comments',
            stepCode: 'STEP_COMMENTS',
            stepName: 'Comments',
            fields: [
              { code: 'WHAT_WORKED_WELL', label: 'What worked well?', fieldType: 1 },
              { code: 'WHAT_CAN_IMPROVE', label: 'What could we improve?', fieldType: 1 },
              { code: 'ADDITIONAL_COMMENTS', label: 'Additional comments', fieldType: 1 },
            ],
          },
        ]
      ),
  },
];

export const ADMISSION_FORM_TEMPLATE_CATEGORIES: AdmissionFormTemplateCategory[] = [
  'Admissions',
  'Student information',
  'Services',
  'Finance',
  'Documents and consent',
  'Surveys',
];

export const SYSTEM_ADMISSION_FORM_TEMPLATES: AdmissionFormTemplateSummary[] = DEFINITIONS.filter(
  (definition) => definition.id !== 'consent-declaration'
).map(({ create: _create, ...summary }) => summary);

export function getSystemAdmissionFormTemplate(id: SystemAdmissionFormTemplateId) {
  const definition = DEFINITIONS.find((item) => item.id === id);
  if (!definition) throw new Error(`Unknown admission form template: ${id}`);
  const form = ensureAdmissionCustomFieldIdentities(definition.create());
  return id === 'admission-inquiry' ? lockNewInquiryStarter(form) : form;
}

export function cloneSchoolFormAsStarter(source: AdmissionForm): CreateUpdateAdmissionForm {
  const stepIds = new Map<string, string>();
  const suffix = crypto.randomUUID().replaceAll('-', '').slice(0, 6).toUpperCase();
  const copyCode = `${source.code.slice(0, Math.max(1, 57))}_COPY_${suffix}`.slice(0, 64);
  const sections = source.sections.map((section, sectionIndex) => {
    const oldStepId = section.stepId ?? `step-${sectionIndex}`;
    if (!stepIds.has(oldStepId)) stepIds.set(oldStepId, crypto.randomUUID());
    const sectionId = crypto.randomUUID();
    return {
      ...section,
      id: sectionId,
      stepId: stepIds.get(oldStepId),
      fields: section.fields.map((field, fieldIndex) => ({
        ...field,
        id: crypto.randomUUID(),
        sectionId,
        displayOrder: fieldIndex,
      })),
      displayOrder: sectionIndex,
    };
  });

  return ensureAdmissionCustomFieldIdentities({
    name: `${source.name} copy`,
    code: copyCode,
    description: source.description,
    layoutType: source.layoutType,
    purpose:
      source.purpose ??
      (source.code.includes('INQUIRY') || source.name.toLowerCase().includes('inquiry') ? 0 : 1),
    fieldsPerRow: source.fieldsPerRow ?? 1,
    defaultLanguage: source.defaultLanguage ?? 'en',
    supportedLanguages: source.supportedLanguages?.length ? source.supportedLanguages : ['en'],
    sections,
  });
}
