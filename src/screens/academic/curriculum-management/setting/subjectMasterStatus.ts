export type SubjectMasterStatusLabel = 'Active' | 'Inactive' | 'Archived';

type SubjectMasterStatusValue = SubjectMasterStatusLabel | number | string | null | undefined;

/**
 * Mirrors the backend SubjectMasterStatus enum:
 * Active = 0, Inactive = 1, Archived = 2.
 */
export const getSubjectMasterStatusLabel = (
  status: SubjectMasterStatusValue
): SubjectMasterStatusLabel => {
  if (status === 2 || status === '2' || status === 'Archived') return 'Archived';
  if (status === 1 || status === '1' || status === 'Inactive') return 'Inactive';
  return 'Active';
};
