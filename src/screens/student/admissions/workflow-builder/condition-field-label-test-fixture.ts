import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { conditionForm, conditionFormDetail } from './document-condition-test-fixture';

const nameField = conditionFormDetail.sections[0].fields[0];
export const familyConditionForm: AdmissionForm = {
  ...conditionForm,
  sectionCount: 3,
  sections: ['Student', 'Father', 'Mother'].map((person, index) => ({
    id: `section-${person}`,
    code: `${person.toUpperCase()}_IDENTITY`,
    name: 'Identity',
    stepName: person,
    displayOrder: index,
    fields: [
      {
        ...nameField,
        id: `name-${person}`,
        code: `${person.toUpperCase()}_NAME`,
        label: 'Full Name',
        bindingKey: `${person.toLowerCase()}.fullName`,
      },
      ...(index === 0 ? [nameField] : []),
    ],
  })),
};
