import type { TeacherProfile } from 'src/screens/academic/curriculum-management/subjectAssignment/component/type';

import dayjs from 'dayjs';

import type { IHomework } from '../type';

export const getHomeworkInitialValues = (
  editData?: Partial<IHomework | null>,
  classes?: string
): IHomework => ({
  id: editData?.id || '',
  title: editData?.title || '',
  description: editData?.description || '',
  class: editData?.class || classes || '',
  classId: editData?.classId || '',

  divisions:
    editData?.divisions?.map((div) => ({
      divisionId: div.divisionId,
      divisionName: div.divisionName,
      createdAt: div.createdAt ? dayjs(div.createdAt) : null,
      publishDate: div.publishDate ? dayjs(div.publishDate) : dayjs(),
      dueDate: div.dueDate ? dayjs(div.dueDate) : dayjs(),
      status: div.status ?? 0,
    })) || [],
  subject: editData?.subject || '',
  subjectId: editData?.subjectId || '',
  chapter: editData?.chapter || '', // updated
  homeworkTypeId: editData?.homeworkTypeId || '',
  homeworkType: editData?.homeworkType || '',
  submissionType: editData?.submissionType ?? 0,
  attachments: editData?.attachments ?? [],
  createdBy: editData?.createdBy || ({} as TeacherProfile),
  content: editData?.content || '',
  submission: editData?.submission || '',
  chapterId: undefined,
  homeworkId: undefined,
});
