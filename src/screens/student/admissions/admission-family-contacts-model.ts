import type {
  AdmissionFamilyContacts,
  AdmissionParentRelationship,
  AdmissionMainContactRelationship,
} from 'src/redux/student/admissions/admission-parent-family-types';

import * as Yup from 'yup';
import { normalizeEmail } from 'src/utils/input-format';

export type AdmissionFamilyContactsFormValues = {
  addOtherParent: boolean;
  otherParentFullName: string;
  otherParentMobile: string;
  otherParentEmail: string;
  addGuardian: boolean;
  guardianFullName: string;
  guardianRelationship: string;
  guardianMobile: string;
  guardianEmail: string;
  mainContactRelationship: '' | AdmissionMainContactRelationship;
};

export const initialAdmissionFamilyContacts: AdmissionFamilyContactsFormValues = {
  addOtherParent: false,
  otherParentFullName: '',
  otherParentMobile: '',
  otherParentEmail: '',
  addGuardian: false,
  guardianFullName: '',
  guardianRelationship: '',
  guardianMobile: '',
  guardianEmail: '',
  mainContactRelationship: '',
};

const optionalMobile = () =>
  Yup.string()
    .trim()
    .matches(/^[6-9]\d{9}$/, {
      message: 'Enter a valid 10-digit mobile number.',
      excludeEmptyString: true,
    });
const optionalEmail = () => Yup.string().trim().email('Enter a valid email address.').max(256);

export const admissionFamilyContactsSchema = Yup.object({
  addOtherParent: Yup.boolean(),
  addGuardian: Yup.boolean(),
  otherParentFullName: Yup.string().when('addOtherParent', {
    is: true,
    then: (value) => value.trim().required('Other parent full name is required.').max(256),
  }),
  otherParentMobile: Yup.string().when('addOtherParent', { is: true, then: optionalMobile }),
  otherParentEmail: Yup.string().when('addOtherParent', { is: true, then: optionalEmail }),
  guardianFullName: Yup.string().when('addGuardian', {
    is: true,
    then: (value) => value.trim().required('Guardian full name is required.').max(256),
  }),
  guardianRelationship: Yup.string().when('addGuardian', {
    is: true,
    then: (value) => value.trim().required('Guardian relationship is required.').max(128),
  }),
  guardianMobile: Yup.string().when('addGuardian', {
    is: true,
    then: () =>
      optionalMobile().test(
        'main-guardian-contact',
        'Enter a mobile number or email for the main school contact.',
        (value, context) => {
          const draft = context.parent as AdmissionFamilyContactsFormValues;
          return (
            draft.mainContactRelationship !== 'guardian' ||
            Boolean(value?.trim() || draft.guardianEmail?.trim())
          );
        }
      ),
  }),
  guardianEmail: Yup.string().when('addGuardian', { is: true, then: optionalEmail }),
  mainContactRelationship: Yup.string().oneOf(['', 'father', 'mother', 'guardian']),
}).default(undefined);

export function getAdmissionSiblingParentReviewError(
  draft: AdmissionFamilyContactsFormValues | undefined,
  capturedParent: '' | AdmissionParentRelationship | undefined,
  confirmedParent: AdmissionParentRelationship
) {
  return draft?.addOtherParent && capturedParent !== confirmedParent
    ? 'Select the confirmed parent relationship and review the other parent details before linking this family.'
    : undefined;
}

export function buildAdmissionFamilyContacts(
  draft: AdmissionFamilyContactsFormValues | undefined,
  parentRelationship: AdmissionParentRelationship
): AdmissionFamilyContacts {
  const values = draft ?? initialAdmissionFamilyContacts;
  const otherRelationship = parentRelationship === 'father' ? 'mother' : 'father';
  const contact = (fullName: string, mobile: string, email: string) => ({
    fullName: fullName.trim(),
    ...(mobile.trim() ? { mobile: mobile.trim() } : {}),
    ...(normalizeEmail(email) ? { email: normalizeEmail(email) } : {}),
  });
  const available = [
    parentRelationship,
    ...(values.addOtherParent ? [otherRelationship] : []),
    ...(values.addGuardian ? ['guardian'] : []),
  ];
  const mainContactRelationship = available.includes(values.mainContactRelationship)
    ? (values.mainContactRelationship as AdmissionMainContactRelationship)
    : parentRelationship;
  return {
    ...(values.addOtherParent
      ? {
          otherParent: {
            relationship: otherRelationship,
            ...contact(
              values.otherParentFullName,
              values.otherParentMobile,
              values.otherParentEmail
            ),
          },
        }
      : {}),
    ...(values.addGuardian
      ? {
          otherGuardian: {
            ...contact(values.guardianFullName, values.guardianMobile, values.guardianEmail),
            relationship: values.guardianRelationship.trim(),
          },
        }
      : {}),
    mainContactRelationship,
  };
}
