import type { AdmissionOfferingListItem } from 'src/redux/student/admissions/admission-offerings-api';
import type {
  AdmissionForm,
  AdmissionFormField,
} from 'src/redux/student/admissions/admission-forms-api';

import { it, expect, describe } from 'vitest';
import { DEFAULT_INQUIRY_POLICY } from 'src/redux/student/admissions/admission-inquiry-policy';

import {
  validateAdmissionInquiry,
  getAdmissionInquiryFields,
  getAdmissionInquirySections,
  buildAdmissionInquiryPayload,
  readAdmissionInquiryFormValues,
  type AdmissionInquiryFormValues,
  preserveCompatibleInquiryAnswers,
  getAdmissionInquiryAcademicOptions,
  buildAdmissionInquiryDuplicateInput,
  getAdmissionInquiryPreferredClassError,
} from './admission-inquiry-model';

const field = (
  code: string,
  bindingKey: string | undefined,
  fieldType = 0,
  required = false
): AdmissionFormField => ({
  id: code,
  code,
  label: code,
  fieldType: fieldType as AdmissionFormField['fieldType'],
  bindingType: bindingKey ? 0 : 1,
  bindingKey,
  required,
  readOnly: false,
  displayOrder: 0,
});

const fields = [
  field('FIRST_NAME', 'Applicant.FirstName', 0, true),
  field('DOB', 'Applicant.DateOfBirth', 5, true),
  field('GENDER', 'Applicant.Gender', 6, true),
  field('GUARDIAN_NAME', 'Guardian.FirstName', 0, true),
  field('GUARDIAN_MOBILE', 'Guardian.Mobile', 4, true),
  field('LEARNING_NOTES', 'LearningNotes', 1),
];

const values: AdmissionInquiryFormValues = {
  boardId: 'board-1',
  mediumId: 'medium-1',
  standardId: 'standard-1',
  offeringId: 'offering-1',
  source: 0,
  sourceDetail: '',
  sendAcknowledgement: true,
  fields: {
    FIRST_NAME: 'Aanya',
    DOB: '2016-04-12T00:00:00+05:30',
    GENDER: 'Female',
    GUARDIAN_NAME: 'Meera',
    GUARDIAN_MOBILE: '9876543210',
    LEARNING_NOTES: 'Benefits from visual learning prompts',
  },
};

const offering = {
  id: 'offering-1',
  admissionCycleId: 'cycle-1',
  admissionCycleName: '2026-27',
  boardId: 'board-1',
  boardName: 'CBSE',
  mediumId: 'medium-1',
  mediumName: 'English',
  stageId: 'stage-1',
  stageName: 'Primary',
  standardId: 'standard-1',
  standardName: 'Class 1',
  code: 'CBSE-ENG-1',
} as AdmissionOfferingListItem;

describe('admission inquiry model', () => {
  it('checks both saved Father and Mother form contacts without treating student email as a parent', () => {
    const parentFields = [
      ...fields,
      field('DAD_EMAIL', 'Father.Email', 3),
      field('MOM_MOBILE', 'Mother.Mobile', 4),
      field('STUDENT_EMAIL', 'Applicant.Email', 3),
    ];
    const input = buildAdmissionInquiryDuplicateInput(
      {
        ...values,
        fields: {
          ...values.fields,
          DAD_EMAIL: ' DAD@Example.COM ',
          MOM_MOBILE: '9876543211',
          STUDENT_EMAIL: 'student@example.com',
        },
      },
      parentFields,
      offering
    );
    expect(input.parentContacts).toEqual([
      { relationship: 'father', email: 'dad@example.com', mobile: undefined },
      { relationship: 'mother', email: undefined, mobile: '9876543211' },
    ]);
  });
  it('captures an explicitly selected first parent and reuses confirmed sibling contact without mutating entered answers', () => {
    const first = buildAdmissionInquiryPayload(
      { ...values, parentRelationship: 'mother' },
      fields,
      offering
    );
    expect(first.parentRelationship).toBe('mother');
    const parent = {
      sourceApplicantId: 'existing-child',
      relationship: 'father' as const,
      name: 'Rahul Shah',
      firstName: 'Rahul',
      lastName: 'Shah',
      email: 'dad@example.com',
      mobile: '9876543211',
    };
    const sibling = buildAdmissionInquiryPayload(
      values,
      fields,
      offering,
      'family-1',
      false,
      undefined,
      parent
    );
    expect(sibling).toMatchObject({
      existingFamilyId: 'family-1',
      existingParentApplicantId: 'existing-child',
      parentRelationship: 'father',
      guardianEmail: 'dad@example.com',
      guardianPhone: '9876543211',
      guardianFirstName: 'Rahul',
    });
    expect(values.fields.GUARDIAN_NAME).toBe('Meera');
  });
  it('replaces only the confirmed parent and generic contact answers, leaving the other parent untouched', () => {
    const parentFields = [
      ...fields,
      field('DAD', 'Father.Email', 3),
      field('MOM', 'Mother.Email', 3),
      field('PARENT', 'Guardian.Email', 3),
    ];
    const payload = buildAdmissionInquiryPayload(
      {
        ...values,
        fields: {
          ...values.fields,
          DAD: 'typed-dad@example.com',
          MOM: 'mother@example.com',
          PARENT: 'typed-parent@example.com',
        },
      },
      parentFields,
      offering,
      'family-1',
      false,
      undefined,
      {
        sourceApplicantId: 'child-1',
        relationship: 'father',
        name: 'Rahul',
        firstName: 'Rahul',
        email: 'saved-father@example.com',
        mobile: '9876543211',
      }
    );
    expect(payload.formValues).toEqual(
      expect.arrayContaining([
        { fieldCode: 'DAD', valueJson: '"saved-father@example.com"' },
        { fieldCode: 'MOM', valueJson: '"mother@example.com"' },
        { fieldCode: 'PARENT', valueJson: '"saved-father@example.com"' },
      ])
    );
    expect(payload).toMatchObject({ phone: '9876543211', email: 'saved-father@example.com' });
  });
  it('normalizes existing mixed-case guardian and custom email answers at the save boundary', () => {
    const emailFields = [
      ...fields,
      field('GUARDIAN_EMAIL', 'Guardian.Email', 3),
      field('OTHER_EMAIL', undefined, 3),
    ];
    const payload = buildAdmissionInquiryPayload(
      {
        ...values,
        fields: {
          ...values.fields,
          GUARDIAN_EMAIL: ' Parent+Tag@Example.COM ',
          OTHER_EMAIL: 'OTHER@Example.COM',
        },
      },
      emailFields,
      offering
    );
    expect(payload.email).toBe('parent+tag@example.com');
    expect(payload.guardianEmail).toBe('parent+tag@example.com');
    expect(payload.formValues).toContainEqual({
      fieldCode: 'GUARDIAN_EMAIL',
      valueJson: '"parent+tag@example.com"',
    });
    expect(payload.formValues).toContainEqual({
      fieldCode: 'OTHER_EMAIL',
      valueJson: '"other@example.com"',
    });
    expect(buildAdmissionInquiryPayload(values, emailFields, offering).guardianEmail).toBeNull();
  });
  it('rejects an incomplete guardian mobile number before duplicate checking', () => {
    const errors = validateAdmissionInquiry(
      {
        ...values,
        fields: { ...values.fields, GUARDIAN_MOBILE: '123' },
      },
      fields,
      null,
      offering
    );

    expect(errors).toMatchObject({
      fields: {
        GUARDIAN_MOBILE: 'Guardian mobile number must be a valid 10-digit Indian mobile number.',
      },
    });
  });

  it('carries canonical and custom form values into the inquiry request', () => {
    const payload = buildAdmissionInquiryPayload(values, fields, offering);

    expect(payload.applicantFirstName).toBe('Aanya');
    expect(payload.applicantDateOfBirth).toBe('2016-04-12T00:00:00+05:30');
    expect(payload.guardianPhone).toBe('9876543210');
    expect(payload.preferredLanguageCode).toBe('en');
    expect(payload).toMatchObject({
      boardId: 'board-1',
      mediumId: 'medium-1',
      standardId: 'standard-1',
      admissionCycleId: 'cycle-1',
      admissionOfferingId: 'offering-1',
      sourceDetail: null,
    });
    expect(payload.formValues).toEqual(
      expect.arrayContaining([
        { fieldCode: 'GENDER', valueJson: '"Female"' },
        {
          fieldCode: 'LEARNING_NOTES',
          valueJson: '"Benefits from visual learning prompts"',
        },
      ])
    );
  });

  it('reports missing offering and required runtime fields', () => {
    const errors = validateAdmissionInquiry(
      { ...values, offeringId: '', fields: { ...values.fields, GENDER: '' } },
      fields
    );

    expect(errors.offeringId).toBe('Offering is required');
    expect(errors.fields).toEqual({ GENDER: 'GENDER is required' });
  });

  it('requires a preferred class to match the selected offering', () => {
    const preferredClass = field('PREFERRED_CLASS', 'Preference.Class');
    const mismatch = { ...values, fields: { ...values.fields, PREFERRED_CLASS: 'Class 2' } };
    const message =
      'Preferred class must match the selected offering (Class 1). Choose a matching offering or change the preferred class.';

    expect(getAdmissionInquiryPreferredClassError(mismatch, [preferredClass], offering)).toEqual({
      fieldCode: 'PREFERRED_CLASS',
      message,
    });
    expect(validateAdmissionInquiry(mismatch, [preferredClass], null, offering)).toMatchObject({
      fields: { PREFERRED_CLASS: message },
    });
    expect(
      getAdmissionInquiryPreferredClassError(
        { ...mismatch, fields: { ...mismatch.fields, PREFERRED_CLASS: '1' } },
        [preferredClass],
        offering
      )
    ).toBeNull();
  });

  it('sends a trimmed duplicate override only when a separate family is requested', () => {
    const payload = buildAdmissionInquiryPayload(
      values,
      fields,
      offering,
      null,
      true,
      '  Different guardian  '
    );

    expect(payload.createSeparateFamily).toBe(true);
    expect(payload.duplicateOverrideReason).toBe('Different guardian');
  });

  it('adds the guardian name required by the domain when a legacy form omits it', () => {
    const legacyForm = {
      sections: [{ fields: [field('GUARDIAN_MOBILE', 'Guardian.Mobile', 4, true)] }],
    } as AdmissionForm;

    expect(getAdmissionInquiryFields(legacyForm)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'guardianFirstName',
          bindingKey: 'Guardian.FirstName',
          required: true,
        }),
      ])
    );
  });

  it.each([
    ['applicant', fields.filter((item) => item.bindingKey !== 'Applicant.FirstName')],
    ['guardian', fields.filter((item) => !item.bindingKey?.startsWith('Guardian.'))],
    ['all identity', [fields[5]]],
  ])(
    'keeps generated %s identity fields out of published form answers',
    (_name, publishedFields) => {
      const form = { sections: [{ fields: publishedFields }] } as AdmissionForm;
      const runtimeFields = getAdmissionInquiryFields(form);
      const payload = buildAdmissionInquiryPayload(
        {
          ...values,
          fields: {
            ...values.fields,
            applicantFirstName: 'Aanya',
            guardianFirstName: 'Meera',
            guardianPhone: '9876543210',
          },
        },
        runtimeFields,
        offering
      );

      expect(payload).toMatchObject({
        applicantFirstName: 'Aanya',
        guardianFirstName: 'Meera',
        guardianPhone: '9876543210',
        phone: '9876543210',
      });
      expect(payload.formValues?.map((item) => item.fieldCode)).toEqual(
        publishedFields.map((item) => item.code)
      );
    }
  );

  it('keeps published identity fields even when their codes match generated fallback codes', () => {
    const publishedFields = [
      field('applicantFirstName', 'Applicant.FirstName', 0, true),
      field('guardianFirstName', 'Guardian.FirstName', 0, true),
      field('guardianPhone', 'Guardian.Mobile', 4, true),
    ];
    const form = { sections: [{ fields: publishedFields }] } as AdmissionForm;
    const payload = buildAdmissionInquiryPayload(
      {
        ...values,
        fields: {
          applicantFirstName: 'Aanya',
          guardianFirstName: 'Meera',
          guardianPhone: '9876543210',
        },
      },
      getAdmissionInquiryFields(form),
      offering
    );

    expect(payload.formValues).toEqual([
      { fieldCode: 'applicantFirstName', valueJson: '"Aanya"' },
      { fieldCode: 'guardianFirstName', valueJson: '"Meera"' },
      { fieldCode: 'guardianPhone', valueJson: '"9876543210"' },
    ]);
  });

  it('sends identity without synthetic form answers when the offering has no configured form', () => {
    const payload = buildAdmissionInquiryPayload(
      {
        ...values,
        fields: {
          applicantFirstName: 'Aanya',
          guardianFirstName: 'Meera',
          guardianPhone: '9876543210',
        },
      },
      getAdmissionInquiryFields(),
      offering
    );

    expect(payload).toMatchObject({
      applicantFirstName: 'Aanya',
      guardianFirstName: 'Meera',
      guardianPhone: '9876543210',
      formValues: [],
    });
  });

  it('maps legacy Inquiry field codes into the required applicant and guardian identity', () => {
    const legacyFields = [
      field('STUDENT_NAME', undefined, 0, true),
      field('DATE_OF_BIRTH', undefined, 5, true),
      field('GUARDIAN_NAME', undefined, 0, true),
      field('GUARDIAN_MOBILE', undefined, 4, true),
    ];
    const legacyForm = { sections: [{ fields: legacyFields }] } as AdmissionForm;
    const legacyValues: AdmissionInquiryFormValues = {
      ...values,
      fields: {
        STUDENT_NAME: 'raj ',
        DATE_OF_BIRTH: '2016-09-18T00:00:00+05:30',
        GUARDIAN_NAME: 'sanjay ',
        GUARDIAN_MOBILE: '8893303939',
      },
    };

    const runtimeFields = getAdmissionInquiryFields(legacyForm);
    const payload = buildAdmissionInquiryPayload(legacyValues, runtimeFields, offering);

    expect(runtimeFields).toHaveLength(legacyFields.length);
    expect(payload).toMatchObject({
      applicantName: 'raj',
      applicantFirstName: 'raj',
      applicantDateOfBirth: '2016-09-18T00:00:00+05:30',
      guardianFirstName: 'sanjay',
      guardianPhone: '8893303939',
    });
  });

  it('ignores retired source-detail requirements while preserving allowed sources and entered details', () => {
    const policy = {
      ...DEFAULT_INQUIRY_POLICY,
      allowedSources: [0, 3],
      requireSourceDetailFor: [3],
    };

    expect(
      validateAdmissionInquiry({ ...values, source: 3 }, fields, policy, offering)
    ).not.toHaveProperty('sourceDetail');
    expect(
      validateAdmissionInquiry(
        { ...values, source: 3, sourceDetail: 'September open house' },
        fields,
        policy,
        offering
      )
    ).not.toHaveProperty('sourceDetail');
    expect(
      buildAdmissionInquiryPayload(
        { ...values, source: 3, sourceDetail: '  September open house  ' },
        fields,
        offering
      ).sourceDetail
    ).toBe('September open house');
    expect(validateAdmissionInquiry({ ...values, source: 4 }, fields, policy)).toMatchObject({
      source: 'Choose a source allowed by this admission workflow',
    });
  });

  it.each([10, 11] as const)('allows source %s without optional source details', (source) => {
    expect(
      validateAdmissionInquiry({ ...values, source }, fields, null, offering)
    ).not.toHaveProperty('sourceDetail');
  });

  it('filters offerings to the selected board, medium, and class', () => {
    const otherOffering = {
      ...offering,
      id: 'offering-2',
      standardId: 'standard-2',
      standardName: 'Class 2',
      code: 'CBSE-ENG-2',
    };
    const options = getAdmissionInquiryAcademicOptions([offering, otherOffering], values);

    expect(options.boards).toEqual([{ id: 'board-1', name: 'CBSE' }]);
    expect(options.standards).toEqual([
      { id: 'standard-1', name: 'Class 1' },
      { id: 'standard-2', name: 'Class 2' },
    ]);
    expect(options.offerings.map((item) => item.id)).toEqual(['offering-1']);
  });

  it('preserves configured form sections for category-wise rendering', () => {
    const form = {
      sections: [
        {
          id: 'guardian',
          code: 'GUARDIAN',
          name: 'Guardian details',
          displayOrder: 2,
          fields: [fields[3], fields[4]],
        },
        {
          id: 'applicant',
          code: 'APPLICANT',
          name: 'Applicant details',
          displayOrder: 1,
          fields: fields.slice(0, 3),
        },
      ],
    } as AdmissionForm;

    expect(getAdmissionInquirySections(form).map((section) => section.name)).toEqual([
      'Applicant details',
      'Guardian details',
    ]);
  });
});

describe('persisted inquiry form answers', () => {
  it('decodes raw strings and preserves structured values for the original form', () => {
    expect(
      readAdmissionInquiryFormValues([
        { fieldCode: 'NAME', valueJson: '"Aanya"' },
        { fieldCode: 'SIBLINGS', valueJson: '[{"name":"Riya"}]' },
        { fieldCode: 'CHOICES', valueJson: '["A","B"]' },
        { fieldCode: 'LEGACY', valueJson: 'unchanged' },
        { fieldCode: 'EMPTY', valueJson: null },
      ])
    ).toEqual({
      NAME: 'Aanya',
      SIBLINGS: '[{"name":"Riya"}]',
      CHOICES: '["A","B"]',
      LEGACY: 'unchanged',
      EMPTY: '',
    });
  });
  it('keeps offering choices within the selected admission period', () => {
    const alternate = { ...offering, id: 'offering-2', admissionCycleId: 'cycle-2' };
    expect(
      getAdmissionInquiryAcademicOptions([offering, alternate], {
        ...values,
        admissionCycleId: 'cycle-1',
      }).offerings.map((item) => item.id)
    ).toEqual(['offering-1']);
  });
});

it('preserves compatible bindings when changing an offering and drops incompatible answers', () => {
  expect(
    preserveCompatibleInquiryAnswers(
      [field('oldName', 'Applicant.FirstName'), field('shared', undefined, 0)],
      [
        field('newName', 'Applicant.FirstName'),
        field('shared', undefined, 3),
        field('fresh', undefined, 0),
      ],
      { oldName: 'Riya', shared: 'text' }
    )
  ).toEqual({ newName: 'Riya', shared: '', fresh: '' });
});
