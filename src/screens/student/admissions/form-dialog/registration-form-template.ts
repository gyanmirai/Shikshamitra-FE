import type {
  AdmissionFormField,
  AdmissionFormSection,
  CreateUpdateAdmissionForm,
} from 'src/redux/student/admissions/admission-forms-api';

import { templateStudentBinding } from './template-student-fields';

type FieldInput = Omit<Partial<AdmissionFormField>, 'fieldType'> & {
  code: string;
  label: string;
  fieldType?: AdmissionFormField['fieldType'];
  bindingKey?: string;
  system?: boolean;
};

const options = (items: string[]) =>
  JSON.stringify(items.map((label) => ({ value: label, label })));

const yesNo = options(['Yes', 'No']);
const gender = options(['Male', 'Female']);
const category = options(['General', 'OBC', 'SC', 'ST', 'EWS', 'Other']);
const classOptions = options([
  'Nursery',
  'LKG',
  'UKG',
  'Class 1',
  'Class 2',
  'Class 3',
  'Class 4',
  'Class 5',
  'Class 6',
  'Class 7',
  'Class 8',
  'Class 9',
  'Class 10',
  'Class 11',
  'Class 12',
]);
const bloodGroups = options(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']);

const validation = {
  phone: JSON.stringify({ format: 'phone', phone: true }),
  aadhaar: JSON.stringify({
    format: 'aadhaar',
    minLength: 12,
    maxLength: 12,
    regex: '^[2-9][0-9]{11}$',
  }),
  pan: JSON.stringify({
    format: 'pan',
    minLength: 10,
    maxLength: 10,
    regex: '^[A-Z]{5}[0-9]{4}[A-Z]$',
  }),
  pincode: JSON.stringify({
    format: 'pincode',
    minLength: 6,
    maxLength: 6,
    regex: '^[0-9]{6}$',
  }),
  ifsc: JSON.stringify({ regex: '^[A-Z]{4}0[A-Z0-9]{6}$' }),
};

function field(sectionId: string, displayOrder: number, input: FieldInput): AdmissionFormField {
  const { system, bindingKey, fieldType = 0, code: inputCode, label: inputLabel, ...rest } = input;
  const code = inputCode.replace(/[^A-Za-z0-9_-]/g, '_').toUpperCase();
  const linked = system ? undefined : templateStudentBinding(code);
  return {
    id: crypto.randomUUID(),
    sectionId,
    code,
    label: inputLabel,
    fieldType: linked?.fieldType ?? fieldType,
    bindingType: system || linked ? 0 : 1,
    bindingKey: bindingKey ?? linked?.bindingKey ?? (system ? inputCode : code),
    required: false,
    readOnly: false,
    displayOrder,
    ...rest,
    ...(linked?.fieldType !== undefined ? { fieldType: linked.fieldType } : {}),
    ...(linked?.optionsJson ? { optionsJson: linked.optionsJson } : {}),
  };
}

function section(
  step: { id: string; code: string; name: string; order: number },
  code: string,
  name: string,
  inputs: FieldInput[],
  order: number
): AdmissionFormSection {
  const id = crypto.randomUUID();
  return {
    id,
    code,
    name,
    displayOrder: order,
    stepId: step.id,
    stepCode: step.code,
    stepName: step.name,
    stepDisplayOrder: step.order,
    isRepeatable: false,
    minEntries: 1,
    maxEntries: 1,
    fields: inputs.map((input, index) => field(id, index, input)),
  };
}

function addressFields(prefix: string, required = false): FieldInput[] {
  const country = `${prefix}_COUNTRY`;
  const state = `${prefix}_STATE`;
  return [
    {
      code: `${prefix}_ADDRESS_LINE_1`,
      label: 'Building No./Flat/House No.',
      required,
      placeholder: 'Building No./Flat/House No.',
    },
    {
      code: `${prefix}_ADDRESS_LINE_2`,
      label: 'Area/Locality/Road Name',
      required,
      placeholder: 'Area/Locality/Road Name',
    },
    { code: `${prefix}_LANDMARK`, label: 'Landmark' },
    {
      code: country,
      label: 'Country',
      fieldType: 0,
      validationJson: JSON.stringify({ format: 'country' }),
      required,
    },
    {
      code: state,
      label: 'State',
      fieldType: 0,
      validationJson: JSON.stringify({ format: 'state', countryField: country }),
      required,
    },
    {
      code: `${prefix}_CITY`,
      label: 'City',
      fieldType: 0,
      validationJson: JSON.stringify({ format: 'city', countryField: country, stateField: state }),
      required,
    },
    { code: `${prefix}_PIN_CODE`, label: 'PIN Code', validationJson: validation.pincode },
  ];
}

function familyFields(prefix: string): FieldInput[] {
  return [
    { code: `${prefix}_FULL_NAME`, label: 'Full Name' },
    { code: `${prefix}_DATE_OF_BIRTH`, label: 'Date of Birth', fieldType: 5 },
    { code: `${prefix}_OCCUPATION`, label: 'Occupation' },
    { code: `${prefix}_EMAIL`, label: 'Email', fieldType: 3 },
    { code: `${prefix}_QUALIFICATION`, label: 'Qualification' },
    { code: `${prefix}_YEAR_OF_PASSING`, label: 'Year of Passing', fieldType: 2 },
    {
      code: `${prefix}_CONTACT_NO`,
      label: 'Contact No.',
      fieldType: 4,
      validationJson: validation.phone,
    },
    {
      code: `${prefix}_OFFICE_NO`,
      label: 'Office No.',
      fieldType: 4,
      validationJson: validation.phone,
    },
    { code: `${prefix}_DESIGNATION`, label: 'Designation' },
    { code: `${prefix}_ORGANIZATION`, label: 'Organization' },
    { code: `${prefix}_AADHAAR_NO`, label: 'Aadhaar No.', validationJson: validation.aadhaar },
    ...addressFields(`${prefix}_OFFICE_ADDRESS`),
    ...addressFields(`${prefix}_LOCAL_ADDRESS`),
  ].filter(
    (item) =>
      prefix !== 'PRIMARY_GUARDIAN' ||
      !['PRIMARY_GUARDIAN_EMAIL', 'PRIMARY_GUARDIAN_CONTACT_NO'].includes(item.code)
  ) as FieldInput[];
}

export function getRegistrationFormTemplate(): CreateUpdateAdmissionForm {
  const steps = [
    ['STEP_GENERAL', 'General'],
    ['STEP_DOCUMENTS', 'Documents'],
    ['STEP_FAMILY', 'Family'],
    ['STEP_COMMUNICATION', 'Communication'],
    ['STEP_ADDITIONAL', 'Additional Details'],
    ['STEP_MEDICAL', 'Medical Records'],
    ['STEP_PREVIOUS_SCHOOL', 'Prev. School Details'],
    ['STEP_BANK', 'Bank Details'],
  ].map(([code, name], order) => ({ id: crypto.randomUUID(), code, name, order }));

  const [general, documents, family, communication, additional, medical, previousSchool, bank] =
    steps;
  const sections: AdmissionFormSection[] = [
    section(
      general,
      'INQUIRY_ADMISSION',
      'Inquiry & Admission',
      [
        { code: 'FORM_NO', label: 'Form No.', required: true },
        {
          code: 'ACADEMIC_YEAR',
          label: 'Academic Year',
          fieldType: 6,
          required: true,
          optionsJson: options(['2026-2027', '2027-2028', '2028-2029']),
        },
        {
          code: 'BOARD',
          label: 'Board',
          fieldType: 6,
          required: true,
          optionsJson: JSON.stringify({ source: 'EducationBoards' }),
        },
        {
          code: 'MEDIUM',
          label: 'Medium',
          fieldType: 6,
          required: true,
          optionsJson: JSON.stringify({ source: 'EducationMediums', parentField: 'BOARD' }),
        },
        { code: 'CLASS', label: 'Class', fieldType: 6, required: true, optionsJson: classOptions },
      ],
      0
    ),
    section(
      general,
      'STUDENT',
      'Student',
      [
        {
          code: 'STUDENT_PHOTO',
          label: 'Student profile photo',
          system: true,
          bindingKey: 'Applicant.ProfilePhoto',
          validationJson: JSON.stringify({ format: 'photo' }),
        },
        {
          code: 'Applicant.FirstName',
          label: 'First Name',
          system: true,
          bindingKey: 'Applicant.FirstName',
          required: true,
        },
        {
          code: 'Applicant.MiddleName',
          label: 'Middle Name',
          system: true,
          bindingKey: 'Applicant.MiddleName',
        },
        {
          code: 'Applicant.LastName',
          label: 'Last Name',
          system: true,
          bindingKey: 'Applicant.LastName',
          required: true,
        },
        {
          code: 'Applicant.DateOfBirth',
          label: 'Date of Birth',
          system: true,
          bindingKey: 'Applicant.DateOfBirth',
          fieldType: 5,
          required: true,
        },
        {
          code: 'Applicant.Gender',
          label: 'Gender',
          system: true,
          bindingKey: 'Applicant.Gender',
          fieldType: 6,
          optionsJson: gender,
          required: true,
        },
      ],
      1
    ),
    section(
      general,
      'CONTACT_DETAILS',
      'Contact Details',
      [
        {
          code: 'Guardian.Mobile',
          label: 'Primary Contact No.',
          system: true,
          bindingKey: 'Guardian.Mobile',
          fieldType: 4,
          validationJson: validation.phone,
          required: true,
        },
        {
          code: 'SECONDARY_CONTACT_NO',
          label: 'Secondary Contact No.',
          fieldType: 4,
          validationJson: validation.phone,
        },
        {
          code: 'Guardian.Email',
          label: 'Primary Email',
          system: true,
          bindingKey: 'Guardian.Email',
          fieldType: 3,
        },
      ],
      2
    ),
    section(
      general,
      'IDENTIFICATION_PERSONAL_DETAILS',
      'Identification & Personal Details',
      [
        { code: 'AADHAAR_NO', label: 'Aadhaar No.', validationJson: validation.aadhaar },
        { code: 'APPAR_ID', label: 'Appar Id' },
        { code: 'PAN_NO', label: 'PAN No.', validationJson: validation.pan },
        { code: 'PEN_NO', label: 'PEN No.' },
        {
          code: 'INQUIRY_PREFERENCE',
          label: 'Inquiry Preference',
          fieldType: 6,
          optionsJson: options(['Phone', 'Email', 'WhatsApp', 'In person']),
        },
        {
          code: 'RELIGION',
          label: 'Religion',
          fieldType: 6,
          optionsJson: options([
            'Hinduism',
            'Islam',
            'Christianity',
            'Sikhism',
            'Buddhism',
            'Jainism',
            'Other',
          ]),
        },
        { code: 'FAMILY_CASTE', label: 'Family Caste' },
        { code: 'CASTE_CATEGORY', label: 'Caste Category', fieldType: 6, optionsJson: category },
        { code: 'NATIONALITY', label: 'Nationality', defaultValue: 'Indian' },
        { code: 'BIRTH_PLACE', label: 'Birth Place' },
        {
          code: 'MOTHER_TONGUE',
          label: 'Mother Tongue',
          fieldType: 6,
          optionsJson: options([
            'Hindi',
            'Gujarati',
            'English',
            'Marathi',
            'Tamil',
            'Telugu',
            'Other',
          ]),
        },
      ],
      3
    ),
    section(
      general,
      'ADDRESS',
      'Address',
      [
        {
          code: 'Address.AddressLine1',
          label: 'Building No./Flat/House No.',
          system: true,
          bindingKey: 'Address.AddressLine1',
          required: true,
        },
        {
          code: 'Address.AddressLine2',
          label: 'Area/Locality/Road Name',
          system: true,
          bindingKey: 'Address.AddressLine2',
          required: true,
        },
        { code: 'ADDRESS_LANDMARK', label: 'Landmark' },
        {
          code: 'Address.Country',
          label: 'Country',
          system: true,
          bindingKey: 'Address.Country',
          validationJson: JSON.stringify({ format: 'country' }),
          required: true,
        },
        {
          code: 'Address.State',
          label: 'State',
          system: true,
          bindingKey: 'Address.State',
          validationJson: JSON.stringify({ format: 'state', countryField: 'ADDRESS_COUNTRY' }),
          required: true,
        },
        {
          code: 'Address.City',
          label: 'City',
          system: true,
          bindingKey: 'Address.City',
          validationJson: JSON.stringify({
            format: 'city',
            countryField: 'ADDRESS_COUNTRY',
            stateField: 'ADDRESS_STATE',
          }),
          required: true,
        },
        {
          code: 'Address.PostalCode',
          label: 'PIN Code',
          system: true,
          bindingKey: 'Address.PostalCode',
          validationJson: validation.pincode,
        },
      ],
      4
    ),
    section(
      documents,
      'DOCUMENTS',
      'Documents',
      [
        {
          code: 'DOCUMENT_NOTES',
          label: 'Document notes',
          fieldType: 1,
          helpText: 'Record document details until file uploads are enabled for admission forms.',
        },
      ],
      5
    ),
    section(family, 'FATHER_DETAILS', 'Father Details', familyFields('FATHER'), 6),
    section(family, 'MOTHER_DETAILS', 'Mother Details', familyFields('MOTHER'), 7),
    section(family, 'GUARDIAN_DETAILS', 'Guardian Details', familyFields('PRIMARY_GUARDIAN'), 8),
    section(
      family,
      'SIBLING_DETAILS',
      'Sibling Details',
      [
        {
          code: 'SIBLING_STUDENT',
          label: 'Student',
          fieldType: 6,
          optionsJson: options(['Select student']),
        },
      ],
      9
    ),
    section(
      communication,
      'COMMUNICATION',
      'Communication',
      [
        {
          code: 'PREFERRED_CONTACT_METHOD',
          label: 'Preferred contact method',
          fieldType: 6,
          optionsJson: options(['Phone', 'Email', 'WhatsApp']),
        },
        {
          code: 'EMERGENCY_CONTACT_NO',
          label: 'Emergency Contact No.',
          fieldType: 4,
          validationJson: validation.phone,
          required: true,
        },
        { code: 'EMERGENCY_RELATIVE_NAME', label: 'Emergency Relative Name', required: true },
        { code: 'EMERGENCY_RELATION', label: 'Emergency Relation', required: true },
        { code: 'SECOND_LANGUAGE', label: 'Second Language' },
      ],
      10
    ),
    section(
      additional,
      'ADDITIONAL_DETAILS',
      'Additional Details',
      [
        {
          code: 'CATEGORY',
          label: 'Category',
          fieldType: 6,
          optionsJson: category,
          required: true,
        },
        { code: 'BPL_STUDENT', label: 'BPL Student', fieldType: 6, optionsJson: yesNo },
        {
          code: 'PERSON_WITH_DISABILITY',
          label: 'Person With Disability',
          fieldType: 6,
          optionsJson: yesNo,
        },
        {
          code: 'SINGLE_PARENT_CHILD',
          label: 'Single Parent Child',
          fieldType: 6,
          optionsJson: yesNo,
        },
        { code: 'SINGLE_CHILD', label: 'Single Child', fieldType: 6, optionsJson: yesNo },
        { code: 'LIBRARY_MEMBER', label: 'Library Member?', fieldType: 9 },
        { code: 'TRANSPORT_MEMBER', label: 'Transport Member?', fieldType: 9 },
      ],
      11
    ),
    section(
      medical,
      'MEDICAL_RECORDS',
      'Medical Records',
      [
        { code: 'BLOOD_GROUP', label: 'Blood Group', fieldType: 6, optionsJson: bloodGroups },
        { code: 'ALLERGIES', label: 'Allergies', fieldType: 1 },
        { code: 'MEDICAL_CONDITIONS', label: 'Medical Conditions', fieldType: 1 },
        { code: 'MEDICAL_NOTES', label: 'Medical Notes', fieldType: 1 },
      ],
      12
    ),
    section(
      previousSchool,
      'PREVIOUS_SCHOOL_DETAILS',
      'Previous School Details',
      [
        { code: 'PREVIOUS_SCHOOL', label: 'Previous School' },
        {
          code: 'LAST_CLASS_PASSED',
          label: 'Last Class Passed',
          fieldType: 6,
          optionsJson: classOptions,
        },
        { code: 'PREVIOUS_SCHOOL_ADDRESS', label: 'Previous School Address', fieldType: 1 },
        { code: 'TRANSFER_CERTIFICATE_NO', label: 'Transfer Certificate No.' },
        { code: 'YEAR_OF_PASSING', label: 'Year of Passing', fieldType: 2 },
      ],
      13
    ),
    section(
      bank,
      'BANK_DETAILS',
      'Bank Details',
      [
        { code: 'BANK_NAME', label: 'Bank Name' },
        { code: 'ACCOUNT_NO', label: 'Account No.' },
        { code: 'IFSC_CODE', label: 'IFSC Code', validationJson: validation.ifsc },
        { code: 'BRANCH_NAME', label: 'Branch Name' },
        { code: 'ACCOUNT_HOLDER_NAME', label: 'Account Holder Name' },
      ],
      14
    ),
  ];

  return {
    name: 'Registration form',
    code: 'REGISTRATION_FORM',
    description:
      'Student registration form covering admission, student, family, communication, documents, medical, school, and bank details.',
    purpose: 1,
    layoutType: 1,
    fieldsPerRow: 4,
    defaultLanguage: 'en',
    supportedLanguages: ['en'],
    sections,
  };
}
