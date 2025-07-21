import type { ISubjectFormValues } from './type';

export const getSubjectInitialValues = (
  editData: ISubjectFormValues | null,
  selectedClass: string
) => {
  // Base initial values with empty fields
  const initialValues = {
    subjectName: '',
    className: selectedClass,
    status: 1,
    subjects: [],
    subjectType: 0,
  };

  // If no edit data, return default values
  if (!editData) {
    return initialValues;
  }

  // Determine subject type
  const subjectType = editData.subjectType || 0;

  if (subjectType === 0) {
    // For core subjects, populate all fields from edit data
    return {
      subjectName: editData.subjectName || '',
      className: editData.className || '',
      status: editData.status || 0,
      subjectType: 0,
      // For core, we typically don't use the subjects array
      subjects: editData.subjects || [],
    };
  }
  // For Elective subjects, ONLY populate className and subjectName,
  // with all other details being empty/default
  return {
    className: editData.className || '',
    subjectName: editData.subjectName || '',
    // Preserve status
    status: editData.status || 1,
    // Mark as Elective type
    subjectType: 1,
    // For Electives, subjects array contains all the detailed information
    subjects: editData.subjects || [],
  };
};
