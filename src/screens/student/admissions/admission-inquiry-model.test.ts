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
  getAdmissionInquiryIdentityErrors,
  getAdmissionInquiryVisibleSections,
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
  it.each(['Father', 'Mother'] as const)(
    'preserves a partial explicitly bound %s mobile without inventing a parent name',
    (role) => {
      const configured = [field('CHILD', 'Applicant.Name'), field('PHONE', `${role}.Mobile`, 4)];
      const draft = { ...values, fields: { CHILD: 'Riya Shah', PHONE: '9876543210' } };
      const payload = buildAdmissionInquiryPayload(draft, configured, offering);
      expect(payload).toMatchObject({
        applicantName: 'Riya Shah',
        guardianPhone: '9876543210',
        guardianFirstName: '',
        parentRelationship: role.toLowerCase(),
      });
      expect(getAdmissionInquiryIdentityErrors(payload, configured, draft)).toEqual({
        fieldErrors: {},
        message:
          'This inquiry form is missing linked fields: Parent / Guardian name. Update its field mappings in Admissions Settings.',
      });
    }
  );

  it('does not reinterpret an unmapped FIELD_1 labelled Full Name and explains the missing connection', () => {
    const configured = [
      { ...field('FIELD_1', 'FIELD_1', 0, true), bindingType: 1 as const, label: 'Full Name' },
      field('PHONE', 'Father.Mobile', 4),
    ];
    const draft = { ...values, fields: { FIELD_1: 'Riya Shah', PHONE: '9876543210' } };
    const payload = buildAdmissionInquiryPayload(draft, configured, offering);
    expect(payload.applicantName).toBe('');
    expect(payload.formValues).toContainEqual({ fieldCode: 'FIELD_1', valueJson: '"Riya Shah"' });
    expect(getAdmissionInquiryIdentityErrors(payload, configured, draft).message).toBe(
      'This inquiry form is missing linked fields: Student name, Parent / Guardian name. Update its field mappings in Admissions Settings.'
    );
  });

  it('maps a custom-code question once it is explicitly connected to Applicant.Name', () => {
    const configured = [
      field('FIELD_1', 'Applicant.Name', 0, true),
      field('DAD', 'Father.Name'),
      field('PHONE', 'Father.Mobile', 4),
    ];
    const draft = {
      ...values,
      fields: { FIELD_1: 'Riya Shah', DAD: 'Amit Shah', PHONE: '9876543210' },
    };
    const payload = buildAdmissionInquiryPayload(draft, configured, offering);
    expect(payload.applicantFirstName).toBe('Riya Shah');
    expect(getAdmissionInquiryIdentityErrors(payload, configured, draft)).toEqual({
      fieldErrors: {},
      message: '',
    });
  });

  it('attaches missing actual optional identity values to their configured fields without changing required flags', () => {
    const configured = [
      field('CHILD', 'Applicant.Name'),
      field('ADULT', 'Guardian.FirstName'),
      field('PHONE', 'Guardian.Mobile', 4),
    ];
    const draft = { ...values, fields: { CHILD: '', ADULT: '', PHONE: '' } };
    expect(
      getAdmissionInquiryIdentityErrors(
        buildAdmissionInquiryPayload(draft, configured, offering),
        configured,
        draft
      )
    ).toEqual({
      fieldErrors: {
        CHILD: 'CHILD is required to create an inquiry.',
        ADULT: 'ADULT is required to create an inquiry.',
        PHONE: 'PHONE is required to create an inquiry.',
      },
      message: '',
    });
    expect(configured.every((item) => !item.required)).toBe(true);
  });

  it('never joins an explicitly selected partial mother contact with father name or mobile', () => {
    const configured = [
      field('CHILD', 'Applicant.Name'),
      field('DAD', 'Father.Name'),
      field('DAD_PHONE', 'Father.Mobile', 4),
      field('MOM_PHONE', 'Mother.Mobile', 4),
      field('PRIMARY', 'Inquiry.ParentRelationship', 6),
    ];
    const draft = {
      ...values,
      fields: {
        CHILD: 'Riya',
        DAD: 'Amit',
        DAD_PHONE: '9876543210',
        MOM_PHONE: '9876543211',
        PRIMARY: 'mother',
      },
    };
    const payload = buildAdmissionInquiryPayload(draft, configured, offering);
    expect(payload.guardianPhone).toBe('9876543211');
    expect(payload.guardianFirstName).toBe('');
  });

  it('uses configured split names instead of a stale full-name answer and preserves both raw answers', () => {
    const configured = [
      ...fields,
      field('FULL', 'Applicant.Name'),
      field('MIDDLE', 'Applicant.MiddleName'),
      field('LAST', 'Applicant.LastName'),
    ];
    const payload = buildAdmissionInquiryPayload(
      {
        ...values,
        fields: {
          ...values.fields,
          FIRST_NAME: 'Riya',
          MIDDLE: 'Kumar',
          LAST: 'Shah',
          FULL: 'Old copied name',
        },
      },
      configured,
      offering
    );
    expect(payload).toMatchObject({
      applicantName: 'Riya Kumar Shah',
      applicantFirstName: 'Riya',
      applicantLastName: 'Shah',
    });
    expect(payload.formValues).toContainEqual({
      fieldCode: 'FULL',
      valueJson: '"Old copied name"',
    });
    expect(
      buildAdmissionInquiryPayload(
        {
          ...values,
          fields: { ...values.fields, FIRST_NAME: '', LAST: 'Shah', FULL: 'Riya Shah' },
        },
        configured,
        offering
      )
    ).toMatchObject({
      applicantName: 'Riya Shah',
      applicantFirstName: 'Riya Shah',
      applicantLastName: null,
    });
  });

  it.each(['Father', 'Mother'])(
    'uses an explicitly configured generic primary email for a single %s contact',
    (role) => {
      const configured = [
        field('CHILD', 'Applicant.Name', 0, true),
        field('PARENT', `${role}.Name`, 0, true),
        field('PHONE', `${role}.Mobile`, 4, true),
        field('PRIMARY_EMAIL', 'Guardian.Email', 3),
      ];
      const draft = {
        ...values,
        fields: {
          CHILD: 'Riya',
          PARENT: 'Parent',
          PHONE: '9876543210',
          PRIMARY_EMAIL: 'Primary@Example.COM',
        },
      };
      expect(buildAdmissionInquiryPayload(draft, configured, offering).guardianEmail).toBe(
        'primary@example.com'
      );
      expect(
        buildAdmissionInquiryPayload(
          { ...draft, fields: { ...draft.fields, OWN_EMAIL: '' } },
          [...configured, field('OWN_EMAIL', `${role}.Email`, 3)],
          offering
        ).guardianEmail
      ).toBeNull();
    }
  );

  it.each(['', 'en', 'gu', 'en-IN', 'zh-Hans-CN'])(
    'accepts blank optional or formatted configured language %s',
    (language) => {
      const configured = [...fields, field('LANGUAGE', 'Inquiry.PreferredLanguageCode', 6)];
      expect(
        validateAdmissionInquiry(
          { ...values, fields: { ...values.fields, LANGUAGE: language } },
          configured,
          null,
          offering
        )
      ).toEqual({});
    }
  );
  it.each(['x', 'bad code', 'en_India', 'abcdefghijklmnooo'])(
    'validates malformed configured communication language %s at its owning field',
    (language) => {
      const configured = [...fields, field('LANGUAGE', 'Inquiry.PreferredLanguageCode', 6)];
      expect(
        validateAdmissionInquiry(
          { ...values, fields: { ...values.fields, LANGUAGE: language } },
          configured,
          null,
          offering
        )
      ).toMatchObject({
        fields: { LANGUAGE: 'Enter a valid language code of 2 to 16 characters.' },
      });
    }
  );

  it('hides and excludes validation from configured conditional steps', () => {
    const form = {
      sections: [
        {
          id: 'conditional',
          code: 'CONDITIONAL',
          name: 'Conditional questions',
          displayOrder: 0,
          stepVisibilityRuleJson: JSON.stringify({
            field: 'SHOW',
            operator: 'Equals',
            value: 'yes',
          }),
          fields: [field('STEP_REQUIRED', 'Custom.Step', 0, true)],
        },
      ],
    } as AdmissionForm;
    const hidden = { ...values, fields: { ...values.fields, SHOW: 'no', STEP_REQUIRED: '' } };
    const sections = getAdmissionInquirySections(form);
    expect(getAdmissionInquiryVisibleSections(sections, hidden)).toEqual([]);
    expect(
      validateAdmissionInquiry(hidden, getAdmissionInquiryFields(form), null, offering)
    ).toEqual({});
    const visible = { ...hidden, fields: { ...hidden.fields, SHOW: 'yes' } };
    expect(getAdmissionInquiryVisibleSections(sections, visible)).toHaveLength(1);
    expect(
      validateAdmissionInquiry(visible, getAdmissionInquiryFields(form), null, offering)
    ).toMatchObject({ fields: { STEP_REQUIRED: 'STEP_REQUIRED is required' } });
  });

  it('preserves the saved primary contact when another parent is the only configured complete pair in an old form', () => {
    const configured = [
      field('CHILD', 'Applicant.Name', 0, true),
      field('DAD', 'Father.Name', 0, true),
      field('DAD_PHONE', 'Father.Mobile', 4, true),
    ];
    const draft = {
      ...values,
      capturedParentRelationship: 'mother' as const,
      parentRelationship: 'mother' as const,
      fields: { CHILD: 'Riya', DAD: 'Amit', DAD_PHONE: '9876543212' },
    };
    const payload = buildAdmissionInquiryPayload(draft, configured, offering);
    expect(payload.parentRelationship).toBe('mother');
    expect(payload.guardianPhone).toBe('');
    expect(payload.guardianFirstName).toBe('');
  });

  it('maps configured source zero and language without inserting operational controls', () => {
    const configured = [
      ...fields,
      field('ORIGIN', 'Inquiry.Source', 6),
      field('DETAIL', 'Inquiry.SourceDetail'),
      field('LANGUAGE', 'Inquiry.PreferredLanguageCode', 6),
    ];
    const payload = buildAdmissionInquiryPayload(
      {
        ...values,
        source: 8,
        sourceDetail: 'Saved context',
        preferredLanguageCode: 'en',
        fields: { ...values.fields, ORIGIN: '0', DETAIL: '', LANGUAGE: 'hi' },
      },
      configured,
      offering
    );
    expect(payload).toMatchObject({ source: 0, sourceDetail: null, preferredLanguageCode: 'hi' });
    expect(
      buildAdmissionInquiryPayload(
        { ...values, source: 8, sourceDetail: 'Saved context', preferredLanguageCode: 'gu' },
        fields,
        offering
      )
    ).toMatchObject({ source: 8, sourceDetail: 'Saved context', preferredLanguageCode: 'gu' });
  });

  it('keeps configured primary-parent contact values together', () => {
    const selector = {
      ...field('PRIMARY', 'Inquiry.ParentRelationship', 6, true),
      optionsJson: '[{"value":"father","label":"Father"},{"value":"mother","label":"Mother"}]',
    };
    const configured = [
      field('CHILD', 'Applicant.Name', 0, true),
      field('DAD', 'Father.Name', 0, true),
      field('DAD_PHONE', 'Father.Mobile', 4, true),
      field('DAD_MAIL', 'Father.Email', 3),
      field('MOM', 'Mother.Name', 0, true),
      field('MOM_PHONE', 'Mother.Mobile', 4, true),
      field('MOM_MAIL', 'Mother.Email', 3),
      selector,
    ];
    const payload = buildAdmissionInquiryPayload(
      {
        ...values,
        fields: {
          CHILD: 'Riya',
          DAD: 'Amit',
          DAD_PHONE: '9876543210',
          DAD_MAIL: 'father@example.com',
          MOM: 'Meera',
          MOM_PHONE: '9876543211',
          MOM_MAIL: '',
          PRIMARY: 'mother',
        },
      },
      configured,
      offering
    );
    expect(payload).toMatchObject({
      guardianFirstName: 'Meera',
      guardianPhone: '9876543211',
      guardianEmail: null,
      parentRelationship: 'mother',
    });
  });

  it('renders only the published sections and keeps configured requiredness unchanged', () => {
    const configured = field('SCHOOL_NOTE', 'Custom.Note', 0);
    const form = {
      sections: [
        { id: 'own', code: 'OWN', name: 'School questions', displayOrder: 0, fields: [configured] },
      ],
    } as AdmissionForm;
    const runtime = getAdmissionInquirySections(form);
    expect(runtime).toHaveLength(1);
    expect(runtime[0].fields).toEqual([
      expect.objectContaining({ code: 'SCHOOL_NOTE', required: false }),
    ]);
    expect(getAdmissionInquiryFields()).toEqual([]);
    const mobileForm = {
      sections: [{ fields: [field('PHONE', 'Guardian.Mobile', 4)] }],
    } as AdmissionForm;
    expect(getAdmissionInquiryFields(mobileForm)[0].required).toBe(false);
  });

  it.each(['Father', 'Mother'])(
    'maps one configured %s contact without adding generic inputs',
    (role) => {
      const configured = [
        field('CHILD', 'Applicant.Name', 0, true),
        field('ADULT', `${role}.Name`, 0, true),
        field('CONTACT', `${role}.Mobile`, 4, true),
        field('MAIL', `${role}.Email`, 3),
      ];
      const draft = {
        ...values,
        parentRelationship: undefined,
        fields: {
          CHILD: 'Riya Shah',
          ADULT: 'Amit Shah',
          CONTACT: '9876543210',
          MAIL: 'amit@example.com',
        },
      };
      const payload = buildAdmissionInquiryPayload(draft, configured, offering);
      expect(payload).toMatchObject({
        applicantName: 'Riya Shah',
        guardianFirstName: 'Amit Shah',
        guardianPhone: '9876543210',
        guardianEmail: 'amit@example.com',
        parentRelationship: role.toLowerCase(),
      });
      expect(payload.formValues).toHaveLength(configured.length);
    }
  );

  it.each(['father', 'mother'] as const)(
    'reuses the selected %s mobile for capture and duplicate checking',
    (relationship) => {
      const prefix = relationship === 'father' ? 'Father' : 'Mother';
      const parentFields = [
        ...fields.filter((item) => !item.bindingKey?.startsWith('Guardian.')),
        field('PARENT_NAME', `${prefix}.Name`, 0, true),
        field('PARENT_PHONE', `${prefix}.Mobile`, 4, true),
      ];
      const draft = {
        ...values,
        parentRelationship: relationship,
        fields: {
          ...values.fields,
          GUARDIAN_MOBILE: '',
          PARENT_NAME: 'QA parent',
          PARENT_PHONE: '9876543211',
        },
      };
      const form = { sections: [{ fields: parentFields }] } as AdmissionForm;
      const sections = getAdmissionInquirySections(form, draft);
      const runtimeFields = sections.flatMap((section) => section.fields);
      const visible = getAdmissionInquiryVisibleSections(sections, draft).flatMap(
        (section) => section.fields
      );
      expect(visible.find((item) => item.code === 'PARENT_PHONE')?.required).toBe(true);
      expect(visible.some((item) => item.bindingKey === 'Guardian.Mobile')).toBe(false);
      expect(validateAdmissionInquiry(draft, runtimeFields, null, offering)).toEqual({});
      expect(
        buildAdmissionInquiryDuplicateInput(draft, runtimeFields, offering).guardianPhone
      ).toBe('9876543211');
      const payload = buildAdmissionInquiryPayload(draft, runtimeFields, offering);
      expect(payload).toMatchObject({ guardianPhone: '9876543211', phone: '9876543211' });
      expect(payload.formValues).toContainEqual({
        fieldCode: 'PARENT_PHONE',
        valueJson: '"9876543211"',
      });
      expect(draft.fields.GUARDIAN_MOBILE).toBe('');
    }
  );

  it('uses the selected parent field instead of generating another mobile input', () => {
    const form = {
      sections: [{ fields: [field('DAD_PHONE', 'Father.Mobile', 4)] }],
    } as AdmissionForm;
    const runtimeFields = getAdmissionInquiryFields(form, {
      ...values,
      parentRelationship: 'father',
    });
    expect(runtimeFields.some((item) => item.id === 'inquiry-guardian-phone')).toBe(false);
    expect(runtimeFields.find((item) => item.code === 'DAD_PHONE')?.required).toBe(false);
  });

  it('keeps the visible mobile when the selected parent section is hidden', () => {
    const draft = { ...values, parentRelationship: 'father' as const };
    const form = {
      sections: [
        { fields },
        {
          visibilityRuleJson: JSON.stringify({
            field: 'SHOW_PARENT',
            operator: 'Equals',
            value: 'yes',
          }),
          fields: [field('DAD_PHONE', 'Father.Mobile', 4)],
        },
      ],
    } as AdmissionForm;
    const runtimeFields = getAdmissionInquiryFields(form, draft);
    expect(validateAdmissionInquiry(draft, runtimeFields, null, offering)).toEqual({});
    expect(buildAdmissionInquiryPayload(draft, runtimeFields, offering).guardianPhone).toBe(
      '9876543210'
    );
  });

  it('keeps each published mobile validation on its own configured field', () => {
    const runtimeFields = [
      field('DAD_PHONE', 'Father.Mobile', 4),
      {
        ...field('SHARED_PHONE', 'Guardian.Mobile', 4, true),
        validationJson: JSON.stringify({
          pattern: '^9',
          message: 'Use the configured contact format.',
        }),
      },
    ];
    const draft = {
      ...values,
      parentRelationship: 'father' as const,
      fields: { DAD_PHONE: '9876543210', SHARED_PHONE: '8765432109' },
    };
    expect(validateAdmissionInquiry(draft, runtimeFields, null, offering)).toMatchObject({
      fields: { SHARED_PHONE: 'Use the configured contact format.' },
    });
  });

  it('preserves a published read-only mobile answer when a parent mobile is edited', () => {
    const runtimeFields = [
      field('DAD_PHONE', 'Father.Mobile', 4),
      { ...field('SHARED_PHONE', 'Guardian.Mobile', 4), readOnly: true },
    ];
    const draft = {
      ...values,
      parentRelationship: 'father' as const,
      fields: { DAD_PHONE: '8765432109', SHARED_PHONE: '9876543210' },
    };
    const payload = buildAdmissionInquiryPayload(draft, runtimeFields, offering);
    expect(payload.guardianPhone).toBe('9876543210');
    expect(payload.formValues).toContainEqual({
      fieldCode: 'SHARED_PHONE',
      valueJson: '"9876543210"',
    });
  });

  it('does not borrow the other parent mobile when the selected parent is missing it', () => {
    const parentFields = [
      ...fields.filter((item) => !item.bindingKey?.startsWith('Guardian.')),
      field('DAD_NAME', 'Father.Name', 0, true),
      field('MOM_NAME', 'Mother.Name', 0, true),
      field('DAD_PHONE', 'Father.Mobile', 4, true),
      field('MOM_PHONE', 'Mother.Mobile', 4, true),
      {
        ...field('PRIMARY', 'Inquiry.ParentRelationship', 6, true),
        optionsJson: '[{"value":"father","label":"Father"},{"value":"mother","label":"Mother"}]',
      },
    ];
    const draft = {
      ...values,
      fields: {
        ...values.fields,
        PRIMARY: 'mother',
        DAD_NAME: 'Father',
        MOM_NAME: 'Mother',
        DAD_PHONE: '9876543211',
        MOM_PHONE: '',
      },
    };
    expect(validateAdmissionInquiry(draft, parentFields, null, offering)).toMatchObject({
      fields: { MOM_PHONE: 'MOM_PHONE is required' },
    });
  });

  it('rejects sibling confirmation that would relabel an entered optional parent', () => {
    expect(() =>
      buildAdmissionInquiryPayload(
        {
          ...values,
          parentRelationship: 'mother',
          familyContacts: {
            addOtherParent: true,
            otherParentFullName: 'Raj Shah',
            otherParentMobile: '',
            otherParentEmail: '',
            addGuardian: false,
            guardianFullName: '',
            guardianRelationship: '',
            guardianMobile: '',
            guardianEmail: '',
            mainContactRelationship: '',
          },
        },
        fields,
        offering,
        'family-1',
        false,
        undefined,
        {
          sourceApplicantId: 'sibling-1',
          relationship: 'father',
          name: 'Raj Shah',
          firstName: 'Raj',
          mobile: '9876543210',
        }
      )
    ).toThrowError(
      'Select the confirmed parent relationship and review the other parent details before linking this family.'
    );
  });

  it('keeps the selected sibling parent proof when a guardian becomes the main contact', () => {
    const payload = buildAdmissionInquiryPayload(
      {
        ...values,
        parentRelationship: 'mother',
        familyContacts: {
          addOtherParent: false,
          otherParentFullName: '',
          otherParentMobile: '',
          otherParentEmail: '',
          addGuardian: true,
          guardianFullName: '  Pooja Shah  ',
          guardianRelationship: ' Aunt ',
          guardianMobile: '9876543211',
          guardianEmail: ' AUNT@Example.COM ',
          mainContactRelationship: 'guardian',
        },
      },
      fields,
      offering,
      'family-1',
      false,
      undefined,
      {
        sourceApplicantId: 'sibling-1',
        relationship: 'mother',
        name: 'Meera',
        firstName: 'Meera',
        email: 'mother@example.com',
        mobile: '9876543210',
      }
    );
    expect(payload).toMatchObject({
      existingFamilyId: 'family-1',
      existingParentApplicantId: 'sibling-1',
      parentRelationship: 'mother',
      guardianFirstName: 'Meera',
      guardianEmail: 'mother@example.com',
      guardianPhone: '9876543210',
      familyContacts: {
        mainContactRelationship: 'guardian',
        otherGuardian: {
          fullName: 'Pooja Shah',
          relationship: 'Aunt',
          mobile: '9876543211',
          email: 'aunt@example.com',
        },
      },
    });
  });

  it('defaults the main contact to the captured parent without requiring another adult', () => {
    expect(
      buildAdmissionInquiryPayload({ ...values, parentRelationship: 'mother' }, fields, offering)
    ).toMatchObject({ familyContacts: { mainContactRelationship: 'mother' } });
  });

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
        GUARDIAN_MOBILE: 'Parent mobile number must be a valid 10-digit Indian mobile number.',
      },
    });
  });

  it.each(['', '   '])('preserves optional mobile requiredness at runtime (%j)', (mobile) => {
    const optionalFields = fields.map((item) =>
      item.code === 'GUARDIAN_MOBILE' ? { ...item, label: 'Parent mobile', required: false } : item
    );
    expect(
      validateAdmissionInquiry(
        {
          ...values,
          parentRelationship: 'father',
          fields: { ...values.fields, GUARDIAN_MOBILE: mobile },
        },
        optionalFields,
        null,
        offering
      )
    ).toEqual({});
  });

  it('keeps published optional mobile unchanged during capture', () => {
    const publishedMobile = field('PARENT_MOBILE', 'Guardian.Mobile', 4);
    const form = { sections: [{ fields: [publishedMobile] }] } as AdmissionForm;
    expect(
      getAdmissionInquiryFields(form).find((item) => item.code === 'PARENT_MOBILE')?.required
    ).toBe(false);
    expect(publishedMobile.required).toBe(false);
  });

  it('reuses a populated legacy mobile alias with an unknown historic binding', () => {
    const form = {
      sections: [{ fields: [field('PARENT_PHONE', 'Legacy.ParentPhone', 4)] }],
    } as AdmissionForm;
    const draft = {
      ...values,
      parentRelationship: 'father' as const,
      fields: { ...values.fields, PARENT_PHONE: '9876543211' },
    };
    const runtimeFields = getAdmissionInquiryFields(form, draft);
    expect(runtimeFields.some((item) => item.id === 'inquiry-guardian-phone')).toBe(false);
    expect(validateAdmissionInquiry(draft, runtimeFields, null, offering)).not.toHaveProperty(
      'fields.PARENT_PHONE'
    );
    expect(buildAdmissionInquiryPayload(draft, runtimeFields, offering).guardianPhone).toBe(
      '9876543211'
    );
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

  it('does not add a guardian name when the published legacy form omits it', () => {
    const mobile = field('GUARDIAN_MOBILE', 'Guardian.Mobile', 4, true);
    const legacyForm = { sections: [{ fields: [mobile] }] } as AdmissionForm;
    expect(getAdmissionInquiryFields(legacyForm)).toEqual([
      expect.objectContaining({ code: mobile.code }),
    ]);
  });

  it.each([
    ['applicant', fields.filter((item) => item.bindingKey !== 'Applicant.FirstName')],
    ['guardian', fields.filter((item) => !item.bindingKey?.startsWith('Guardian.'))],
    ['all identity', [fields[5]]],
  ])(
    'ignores unconfigured %s identity answers rather than generating fields',
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

      expect(payload.applicantFirstName).toBe(
        publishedFields.some((item) => item.bindingKey === 'Applicant.FirstName') ? 'Aanya' : ''
      );
      expect(payload.guardianFirstName).toBe(
        publishedFields.some((item) => item.bindingKey === 'Guardian.FirstName') ? 'Meera' : ''
      );
      expect(payload.guardianPhone).toBe(
        publishedFields.some((item) => item.bindingKey === 'Guardian.Mobile') ? '9876543210' : ''
      );
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

  it('does not read unconfigured identity answers when no form exists', () => {
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
      applicantFirstName: '',
      guardianFirstName: '',
      guardianPhone: '',
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
