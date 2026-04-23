import * as Yup from 'yup';

import { SubjectType, SubjectAssignmentStatus } from '../../enum/subjectType';

import type { ISubjectAssignmentSubject, ISubjectAssignmentFormValues } from './type';

export const validationSchema = Yup.object().shape({
  classId: Yup.string().required('Class is required'),
  status: Yup.number().required('Status is required'),

  subjects: Yup.array()
    .of(
      Yup.object().shape({
        subjectCode: Yup.string()
          .required('Subject Code is required')
          .min(3, 'Min 3 characters Required')
          .max(10, 'Max 10 characters Required'),
        subjectColor: Yup.string().required('Subject Color is required'),
      })
    )
    .min(1, 'At least one subject is required'),

  selectedSubjects: Yup.array()
    .min(1, 'At least one subject is required')
    .required('Subjects are required'),
});

export const getSubjectAssignmentInitialValues1 = (
  data: any,
  selectedClass: string,
  classId: string
): ISubjectAssignmentFormValues => {
  if (Object.keys(data).length === 0) {
    return {
      classId,
      className: selectedClass,
      status: SubjectAssignmentStatus.Draft,
      subjects: [],
      subjectType: 0,
      selectedSubjects: [],
    };
  }
  const overallSubjectType = data.subjects?.some((s: any) => s.subjectType === 1) ? 1 : 0;
  const flattenedSubjects: ISubjectAssignmentSubject[] = [];
  const subjectNames: string[] = [];
  data.subjects?.forEach((item: any, index: number) => {
    subjectNames.push(item.subjectName);

    flattenedSubjects.push({
      subjectId: item.subjectId,
      subjectType: item.subjectType,
      electiveGroupId: item.electiveGroupId || null,
      subjectName: item.subjectName,
      subjectCode: item.subjectCode,
      primaryTeacher: item.primaryTeacher?.id || '',
      secondaryTeacher: item.secondaryTeachers?.map((t: any) => t.id) || [],
      learningGoal: item.learningGoal || '',
      prerequisites: item.prerequisites || '',
      description: item.description || '',
      documents: item.documents || [],
      subjectColor: item.color || '#4169E1',
      subjectNo: item.subjectId || `${item.subjectName}-${index}`,
      isSubjectOpen: false,
    });
  });

  const preSelectedOptions =
    data?.subjectType === SubjectType.Elective
      ? [{ label: data.electiveGroupName, value: data.electiveGroupId }]
      : [{ label: data.subjects?.[0]?.subjectName, value: data.subjects?.[0]?.subjectId }];

  return {
    classId,
    className: selectedClass,
    status: data.status ?? SubjectAssignmentStatus.Draft,
    subjects: flattenedSubjects || [],
    subjectType: overallSubjectType,
    selectedSubjects: preSelectedOptions,
  };
};
