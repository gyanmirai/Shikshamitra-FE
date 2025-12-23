import * as Yup from 'yup';

import type { ISubjectAssignmentSubject, ISubjectAssignmentFormValues } from './type';

export const validationSchema = Yup.object().shape({
  classId: Yup.string().required('Class is required'),
  status: Yup.number().required('Status is required'),
  subjectName: Yup.string().required('Subject selection is required'),

  subjects: Yup.array()
    .of(
      Yup.object().shape({
        subjectCode: Yup.string()
          .required('Subject Code is required')
          .min(3, 'Min 3 characters Required')
          .max(10, 'Max 10 characters Required'),
        subjectName: Yup.string().required('Subject Name is required'),
        // subjectColor is apparently required in the original schema
        subjectColor: Yup.string().required('Subject Color is required'),
      })
    )
    .min(1, 'At least one subject is required'),
});

export const getSubjectAssignmentInitialValues = (
  data: any,
  selectedClass: string,
  classId: string
): ISubjectAssignmentFormValues => {
  if (!data) {
    return {
      classId,
      className: selectedClass,
      status: 1,
      subjects: [],
      subjectName: '',
      subjectType: 0,
    };
  }

  // Flatten the subjects if the data structure is the nested "dummy data" style
  const flattenedSubjects: ISubjectAssignmentSubject[] = [];

  // Used for constructing the comma-separated subjectName for the UI
  const subjectNames: string[] = [];
  let overallSubjectType = 0;

  if (data.subjects && Array.isArray(data.subjects)) {
    data.subjects.forEach((item: any) => {
      if (item.subjectType === 0) {
        // Core subject
        subjectNames.push(item.subjectName);
        flattenedSubjects.push({
          subjectId: item.subjectId,
          subjectType: 0,
          subjectName: item.subjectName,
          subjectCode: item.subjectCode,
          // Map Id to internal field
          primaryTeacher: item.primaryTeacherId || '',
          secondaryTeacher: item.secondaryTeacherIds || [],

          learningGoal: item.learningGoal || '',
          prerequisites: item.prerequisites || '',
          description: item.description || '',
          documents: item.documents || [],
          subjectColor: item.subjectColor || '#DEB887',
          subjectNo: item.subjectId || Date.now() + Math.random(),
          isSubjectOpen: false,
        });
      } else if (item.subjectType === 1) {
        // Elective GROUP or Subject
        // If it has 'subjects' array, it's a group
        overallSubjectType = 1;

        if (item.subjects && Array.isArray(item.subjects)) {
          // It's a group
          subjectNames.push(item.electiveGroupName || item.electiveGroupId);

          item.subjects.forEach((sub: any) => {
            flattenedSubjects.push({
              subjectId: sub.subjectId,
              subjectType: 1,
              electiveGroupId: item.electiveGroupId,
              subjectName: sub.subjectName,
              subjectCode: sub.subjectCode,
              primaryTeacher: sub.primaryTeacherId || '',
              secondaryTeacher: sub.secondaryTeacherIds || [],
              learningGoal: sub.learningGoal || '',
              prerequisites: sub.prerequisites || '',
              description: sub.description || '',
              documents: sub.documents || [],
              subjectColor: sub.subjectColor || '#4169E1',
              subjectNo: sub.subjectId || Date.now() + Math.random(),
              isSubjectOpen: false,
            });
          });
        } else {
          // It's a direct elective subject (fallback if payload structure varies)
          subjectNames.push(item.subjectName);
          flattenedSubjects.push({
            subjectId: item.subjectId,
            subjectType: 1,
            electiveGroupId: item.electiveGroupId, // Might be undefined
            subjectName: item.subjectName,
            subjectCode: item.subjectCode,
            primaryTeacher: item.primaryTeacherId || '',
            secondaryTeacher: item.secondaryTeacherIds || [],
            learningGoal: item.learningGoal || '',
            prerequisites: item.prerequisites || '',
            description: item.description || '',
            documents: item.documents || [],
            subjectColor: item.subjectColor || '#4169E1',
            subjectNo: item.subjectId || Date.now() + Math.random(),
            isSubjectOpen: false,
          });
        }
      }
    });
  }

  return {
    classId: data.classId || classId,
    className: selectedClass, // This might need to be derived or passed
    status: data.status !== undefined ? data.status : 1,
    subjectType: overallSubjectType,
    subjectName: subjectNames.join(', '),
    subjects: flattenedSubjects,
  };
};
