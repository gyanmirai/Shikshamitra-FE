import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

export const conditionForm: AdmissionForm = {
  id: 'form-a',
  name: 'Registration',
  code: 'REGISTRATION',
  version: 2,
  status: 1,
  layoutType: 0,
  sectionCount: 1,
  sections: [],
};
export const conditionFormList = [
  conditionForm,
  { ...conditionForm, id: 'form-b', name: 'Another form' },
];
export const conditionFormDetail: AdmissionForm = {
  ...conditionForm,
  sections: [
    {
      id: 'section-1',
      code: 'DETAILS',
      name: 'Details',
      displayOrder: 0,
      fields: [
        {
          id: 'field-1',
          code: 'PREVIOUS_SCHOOL',
          label: 'Previous school',
          fieldType: 0,
          bindingType: 0,
          bindingKey: 'student.previousSchool',
          required: false,
          readOnly: false,
          displayOrder: 0,
        },
        {
          id: 'field-2',
          code: 'SECTION_TITLE',
          label: 'Information only',
          fieldType: 12,
          bindingType: 1,
          required: false,
          readOnly: true,
          displayOrder: 1,
        },
      ],
    },
  ],
};
