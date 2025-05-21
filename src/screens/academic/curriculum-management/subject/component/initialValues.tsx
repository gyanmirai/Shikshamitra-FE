import type { ISubjectFormValues } from './type';

export const getSubjectInitialValues = (editData: ISubjectFormValues | null) => {
  // Base initial values with empty fields
  const initialValues = {
    subjectName: '',
    className: '',
    status: 'Unpublish',
    subjects: [],
    subjectType: 'core',
  };

  // If no edit data, return default values
  if (!editData) {
    return initialValues;
  }

  // Determine subject type
  const subjectType = editData.subjectType || 'core';

  if (subjectType === 'core') {
    // For core subjects, populate all fields from edit data
    return {
      subjectName: editData.subjectName || '',
      className: editData.className || '',
      status: editData.status || 'Unpublish',
      subjectType: 'core',
      // For core, we typically don't use the subjects array
      subjects: editData.subjects || [],
    };
  }
  // For elective subjects, ONLY populate className and subjectName,
  // with all other details being empty/default
  return {
    className: editData.className || '',
    subjectName: editData.subjectName || '',
    // Preserve status
    status: editData.status || 'Unpublish',
    // Mark as elective type
    subjectType: 'elective',
    // For electives, subjects array contains all the detailed information
    subjects: editData.subjects || [],
  };
};
