export type AdmissionParentRelationship = 'father' | 'mother';

export type AdmissionMainContactRelationship = AdmissionParentRelationship | 'guardian';

export type AdmissionFamilyContacts = {
  otherParent?: {
    relationship: AdmissionParentRelationship;
    fullName: string;
    mobile?: string;
    email?: string;
  };
  otherGuardian?: {
    fullName: string;
    relationship: string;
    mobile?: string;
    email?: string;
  };
  mainContactRelationship: AdmissionMainContactRelationship;
};

export type AdmissionParentContact = {
  relationship: AdmissionParentRelationship;
  email?: string | null;
  mobile?: string | null;
};

export type AdmissionFamilyParent = Omit<AdmissionParentContact, 'relationship'> & {
  relationship?: AdmissionParentRelationship | null;
  sourceApplicantId: string;
  name: string;
  firstName: string;
  lastName?: string | null;
};

export type AdmissionSiblingParentSelection = AdmissionFamilyParent & {
  relationship: AdmissionParentRelationship;
};
