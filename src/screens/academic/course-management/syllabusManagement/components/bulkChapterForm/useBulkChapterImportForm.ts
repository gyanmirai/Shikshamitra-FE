'use client';

import type { RootState } from 'src/redux/store';

import { useFormik } from 'formik';
import { uuidv4 } from 'src/utils/uuidv4';
import { useSelector } from 'react-redux';
import { shikshaMitraToast } from 'src/components/toast';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { datePickerToDateTimeOffset } from 'src/utils/dateConvertor';
import { useAddChapterMutation } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/Chapter-management-api';

import { getBulkChapterValidationSchema } from './validationSchema';

import type { ChapterImportDraft } from './chapterImport';
import type { IBulkChapterEntry, IBulkChapterFormProps } from './type';

type Props = Pick<IBulkChapterFormProps, 'classId' | 'subjectId' | 'existingChapters' | 'onClose'>;

const createEntry = (entry: ChapterImportDraft): IBulkChapterEntry => ({
  ...entry,
  uid: uuidv4(),
  chapterId: undefined,
});

export function useBulkChapterImportForm({
  classId,
  subjectId,
  existingChapters = [],
  onClose,
}: Props) {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const [addChapter, { isLoading: isAddLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddChapterMutation,
  });

  const formik = useFormik<{ chapters: IBulkChapterEntry[] }>({
    initialValues: { chapters: [] },
    validationSchema: getBulkChapterValidationSchema(currentYear),
    onSubmit: async (values) => {
      if (!classId || !subjectId) {
        shikshaMitraToast.error({
          message: 'Class and Subject must be selected before saving chapters.',
        });
        return;
      }

      const chapterNumbers = values.chapters.map((chapter) => Number(chapter.chapterNo));
      if (new Set(chapterNumbers).size !== chapterNumbers.length) {
        shikshaMitraToast.error({
          message: 'Each imported chapter must have a unique chapter number.',
        });
        return;
      }

      const existingNumbers = new Set(existingChapters.map((chapter) => chapter.chapterNumber));
      const conflicts = chapterNumbers.filter((chapterNumber) =>
        existingNumbers.has(chapterNumber)
      );
      if (conflicts.length > 0) {
        shikshaMitraToast.error({
          message: `Chapter number(s) ${conflicts.join(', ')} already exist for this subject.`,
        });
        return;
      }

      try {
        const chaptersList = values.chapters.map((entry) => {
          const startDate = datePickerToDateTimeOffset(entry.startDate);
          const endDate = datePickerToDateTimeOffset(entry.endDate);

          if (!startDate || !endDate) throw new Error('Chapter dates are required.');

          return {
            assignedSubjectId: subjectId,
            chapterNo: Number(entry.chapterNo),
            chapterName: entry.chapterName.trim(),
            startDate,
            endDate,
            description: entry.description,
            documents: [],
            publishStatus: 'Draft',
            reviewStatus: 'Not Submitted',
            coverageStatus: 'Not Started',
            resourceStatus: 'Missing',
            lessonPlanStatus: 'Not Mapped',
            homeworkStatus: 'Not Mapped',
            assessmentStatus: 'Not Mapped',
            visibility: 'Teacher',
            difficultyLevel: 'Medium',
            bloomLevel: 'Understand',
            healthScore: 20,
            questionCount: 0,
            versionLabel: 'v1',
          };
        });

        await addChapter({ standardId: classId, subjectId, body: chaptersList }).unwrap();
        shikshaMitraToast.success({
          message: `${values.chapters.length} chapter${values.chapters.length === 1 ? '' : 's'} assigned successfully.`,
        });
        onClose(null, true);
      } catch {
        shikshaMitraToast.error({ message: 'Failed to save chapters. Please try again.' });
      }
    },
  });

  const handleImport = (entries: ChapterImportDraft[]) => {
    formik.setFieldValue('chapters', entries.map(createEntry), true);
  };

  return {
    formik,
    currentYear,
    handleImport,
    isSaving: isAddLoading || formik.isSubmitting,
    reservedChapterNumbers: existingChapters.map((chapter) => chapter.chapterNumber),
  };
}
