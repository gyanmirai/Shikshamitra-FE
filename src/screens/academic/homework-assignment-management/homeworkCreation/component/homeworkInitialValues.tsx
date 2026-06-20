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
  class: (editData as any)?.standardId || editData?.class || classes || '',
  classId: (editData as any)?.standardId || editData?.classId || '',

  divisions:
    editData?.divisionSchedules?.map((div: any) => ({
      divisionId: div.divisionId,
      divisionName: div.divisionName,
      createdAt: div.createdAt ? dayjs(div.createdAt) : null,
      publishDate: div.publishAt
        ? dayjs(div.publishAt)
        : div.publishDate
          ? dayjs(div.publishDate)
          : dayjs(),
      dueDate: div.dueAt ? dayjs(div.dueAt) : div.dueDate ? dayjs(div.dueDate) : dayjs(),
      status: div.status ?? 0,
    })) || [],
  subject: editData?.subject || '',
  subjectId: editData?.subjectId || '',
  chapter: (editData as any)?.chapterName || editData?.chapter || '',
  homeworkTypeId: editData?.homeworkTypeId || '',
  homeworkType: editData?.homeworkType || '',
  submissionType: editData?.submissionType ?? 0,
  attachments: editData?.attachments ?? [],
  createdBy: editData?.createdBy || ({} as TeacherProfile),
  content: editData?.content || '',
  submission: editData?.submission || '',
  chapterId: (editData as any)?.chapterId || undefined,
  chapterIds:
    (editData as any)?.chapterIds ||
    ((editData as any)?.chapterId ? [(editData as any).chapterId] : []),
  homeworkId: undefined,
  standardId: (editData as any)?.standardId || '',
});
