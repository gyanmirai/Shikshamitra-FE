import { describe, expect, it } from 'vitest';

import {
  buildQuestionValidationSchema,
  createAnswerOptions,
  createInitialQuestionValues,
  createNextQuestionValues,
  toQuestionBody,
} from './questionFormModel';

describe('questionFormModel', () => {
  it('preserves the existing create payload transformations', () => {
    const values = {
      ...createInitialQuestionValues('year-1', {
        standardId: 'class-10',
        subjectId: 'science',
      }),
      questionText: 'Which organelle is the powerhouse of the cell?',
      marks: '2',
      negativeMarks: '0.5',
      chapterId: '',
      topicName: '  Cells  ',
      bloomLevel: 0,
      visibility: 3,
      tagsText: ' biology, cells, , class10 ',
      options: [
        { optionText: ' Nucleus ', isCorrect: false, sortOrder: 8 },
        { optionText: ' Mitochondria ', isCorrect: true, sortOrder: 3 },
        { optionText: '   ', isCorrect: false, sortOrder: 2 },
      ],
    };

    expect(toQuestionBody(values)).toMatchObject({
      answerKey: 'Mitochondria',
      chapterId: null,
      topicName: 'Cells',
      bloomLevel: null,
      visibility: 3,
      marks: 2,
      negativeMarks: 0.5,
      tags: ['biology', 'cells', 'class10'],
      options: [
        { optionText: 'Nucleus', isCorrect: false, sortOrder: 1 },
        { optionText: 'Mitochondria', isCorrect: true, sortOrder: 2 },
      ],
    });
  });

  it('creates a clean next question while preserving rapid-entry context', () => {
    const values = {
      ...createInitialQuestionValues('year-1', {
        standardId: 'class-10',
        subjectId: 'science',
        chapterId: 'life-processes',
        topicName: 'Respiration',
      }),
      questionType: 2,
      questionText: 'Old question text',
      answerKey: 'Old answer',
      explanation: 'Old explanation',
      markingScheme: 'Old marking scheme',
      learningOutcome: 'Old outcome',
      tagsText: 'old',
      options: [
        { optionText: 'Old A', isCorrect: true, sortOrder: 1 },
        { optionText: 'Old B', isCorrect: true, sortOrder: 2 },
      ],
    };

    const next = createNextQuestionValues(values);

    expect(next).toMatchObject({
      academicYearId: 'year-1',
      standardId: 'class-10',
      subjectId: 'science',
      chapterId: 'life-processes',
      topicName: 'Respiration',
      questionType: 2,
      questionText: '',
      answerKey: '',
      explanation: '',
      markingScheme: '',
      learningOutcome: '',
      tagsText: '',
    });
    expect(next.options).toEqual(createAnswerOptions(2));
    expect(next.options).not.toBe(values.options);
  });

  it('enforces settings-driven required fields', async () => {
    const values = {
      ...createInitialQuestionValues('year-1', {
        standardId: 'class-10',
        subjectId: 'science',
        chapterId: 'life-processes',
      }),
      questionText: 'A valid question?',
      options: [
        { optionText: 'Option A', isCorrect: true, sortOrder: 1 },
        { optionText: 'Option B', isCorrect: false, sortOrder: 2 },
      ],
      learningOutcome: '',
    };
    const requiredSchema = buildQuestionValidationSchema({ requireLearningOutcome: true });
    const optionalSchema = buildQuestionValidationSchema({ requireLearningOutcome: false });

    await expect(requiredSchema.validate(values)).rejects.toThrow(
      'Enter a Learning Outcome because it is required by Question Bank settings.'
    );
    await expect(optionalSchema.validate(values)).resolves.toBeTruthy();
  });
});
