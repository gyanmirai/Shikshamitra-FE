import * as Yup from 'yup';
import { PublishUnpublishStatusType } from 'src/enums/publishUnpublish-status';

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
      status: PublishUnpublishStatusType.Draft,
      subjects: [],
      subjectType: 0,
    };
  }

  const flattenedSubjects: ISubjectAssignmentSubject[] = [];
  const subjectNames: string[] = [];

  const overallSubjectType = data.subjects?.some((s: any) => s.subjectType === 1) ? 1 : 0;

  data.subjects.forEach((item: any, index: number) => {
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

  return {
    classId: data.classId || classId,
    className: selectedClass,
    status: data.status ?? PublishUnpublishStatusType.Draft,
    subjectType: overallSubjectType,
    subjectName: subjectNames.join(', '),
    subjects: flattenedSubjects,
  };
};
