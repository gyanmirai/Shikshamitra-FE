export type AdmissionParentRelationship = 'father' | 'mother';

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
