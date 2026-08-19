import * as Yup from 'yup';

export interface QuestionOptionValue {
  optionText: string;
  isCorrect: boolean;
  sortOrder: number;
}

export interface QuestionFormValues {
  academicYearId: string;
  standardId: string;
  subjectId: string;
  chapterId: string;
  topicName: string;
  questionText: string;
  questionType: number;
  difficultyLevel: number | null;
  bloomLevel: number | null;
  marks: number | string;
  negativeMarks: number | string;
  answerKey: string;
  learningOutcome: string;
  explanation: string;
  markingScheme: string;
  visibility: number;
  tagsText: string;
  options: QuestionOptionValue[];
  file: File | null;
}

export interface QuestionBankFormSettings {
  requireChapter?: boolean;
  requireTopic?: boolean;
  requireDifficulty?: boolean;
  requireBloomLevel?: boolean;
  requireAnswerKey?: boolean;
  requireLearningOutcome?: boolean;
  enableNegativeMarking?: boolean;
}

interface QuestionContextDefaults {
  standardId?: string;
  subjectId?: string;
  chapterId?: string;
  topicName?: string;
}

const OBJECTIVE_QUESTION_TYPES = [1, 2, 3];
const ANSWER_KEY_QUESTION_TYPES = [4, 5, 6];

export function createAnswerOptions(questionType: number): QuestionOptionValue[] {
  if (questionType === 3) {
    return [
      { optionText: 'True', isCorrect: true, sortOrder: 1 },
      { optionText: 'False', isCorrect: false, sortOrder: 2 },
    ];
  }

  if (questionType === 1 || questionType === 2) {
    return [
      { optionText: '', isCorrect: true, sortOrder: 1 },
      { optionText: '', isCorrect: false, sortOrder: 2 },
    ];
  }

  return [];
}

export function createInitialQuestionValues(
  academicYearId = '',
  context: QuestionContextDefaults = {}
): QuestionFormValues {
  return {
    academicYearId,
    standardId: context.standardId || '',
    subjectId: context.subjectId || '',
    chapterId: context.chapterId || '',
    topicName: context.topicName || '',
    questionText: '',
    questionType: 1,
    difficultyLevel: 1,
    bloomLevel: 1,
    marks: 1,
    negativeMarks: '',
    answerKey: '',
    learningOutcome: '',
    explanation: '',
    markingScheme: '',
    visibility: 2,
    tagsText: '',
    options: createAnswerOptions(1),
    file: null,
  };
}

export function createNextQuestionValues(values: QuestionFormValues): QuestionFormValues {
  return {
    ...createInitialQuestionValues(values.academicYearId, {
      standardId: values.standardId,
      subjectId: values.subjectId,
      chapterId: values.chapterId,
      topicName: values.topicName,
    }),
    questionType: values.questionType,
    difficultyLevel: values.difficultyLevel,
    bloomLevel: values.bloomLevel,
    marks: values.marks,
    visibility: values.visibility,
    options: createAnswerOptions(values.questionType),
  };
}

export function normalizeSingleCorrectOptions(options: QuestionOptionValue[]) {
  let correctSeen = false;

  return options.map((option) => {
    if (!option.isCorrect) return option;
    if (correctSeen) return { ...option, isCorrect: false };

    correctSeen = true;
    return option;
  });
}

export function buildQuestionValidationSchema(settings?: QuestionBankFormSettings) {
  return Yup.object({
    standardId: Yup.string().required('Select a Class.'),
    subjectId: Yup.string().required('Select a Subject.'),
    chapterId: settings?.requireChapter
      ? Yup.string().required('Select a Chapter because it is required by Question Bank settings.')
      : Yup.string().nullable(),
    topicName: settings?.requireTopic
      ? Yup.string()
          .trim()
          .required('Enter a Topic because it is required by Question Bank settings.')
      : Yup.string().nullable(),
    questionText: Yup.string()
      .trim()
      .required('Enter the question students will see.')
      .min(5, 'Enter at least 5 characters.'),
    questionType: Yup.number().required('Select a Question Type.'),
    marks: Yup.number()
      .typeError('Enter valid Marks.')
      .required('Enter Marks.')
      .min(0.5, 'Marks must be at least 0.5.')
      .max(100, 'Marks cannot exceed 100.'),
    difficultyLevel: settings?.requireDifficulty
      ? Yup.number()
          .nullable()
          .required('Select Difficulty because it is required by Question Bank settings.')
      : Yup.number().nullable(),
    bloomLevel: settings?.requireBloomLevel
      ? Yup.number()
          .nullable()
          .required("Select a Bloom's Level because it is required by Question Bank settings.")
      : Yup.number().nullable(),
    learningOutcome: settings?.requireLearningOutcome
      ? Yup.string()
          .trim()
          .required('Enter a Learning Outcome because it is required by Question Bank settings.')
      : Yup.string().nullable(),
    answerKey: settings?.requireAnswerKey
      ? Yup.string().when('questionType', {
          is: (type: number) => ANSWER_KEY_QUESTION_TYPES.includes(Number(type)),
          then: (schema) =>
            schema
              .trim()
              .required('Enter an Answer Key because it is required by Question Bank settings.'),
          otherwise: (schema) => schema.notRequired(),
        })
      : Yup.string().nullable(),
    options: Yup.array().when('questionType', {
      is: (type: number) => OBJECTIVE_QUESTION_TYPES.includes(Number(type)),
      then: (schema) =>
        schema
          .of(
            Yup.object({
              optionText: Yup.string().trim().required('Enter this option.'),
              isCorrect: Yup.boolean(),
              sortOrder: Yup.number(),
            })
          )
          .test(
            'has-two-options',
            'Add at least two options.',
            (options) =>
              Array.isArray(options) &&
              options.filter((option) => String(option?.optionText || '').trim()).length >= 2
          )
          .test(
            'has-correct-option',
            'Select the correct answer.',
            (options) => Array.isArray(options) && options.some((option) => option?.isCorrect)
          ),
    }),
  });
}

export function toQuestionBody(values: QuestionFormValues) {
  const options = (values.options || [])
    .map((option, index) => ({
      ...option,
      optionText: String(option.optionText || '').trim(),
      sortOrder: index + 1,
    }))
    .filter((option) => option.optionText);
  const objectiveAnswerKey = OBJECTIVE_QUESTION_TYPES.includes(Number(values.questionType))
    ? options
        .filter((option) => option.isCorrect)
        .map((option) => option.optionText)
        .filter(Boolean)
        .join(', ')
    : '';
  const { tagsText, ...rest } = values;

  return {
    ...rest,
    answerKey: String(values.answerKey || '').trim() || objectiveAnswerKey,
    chapterId: values.chapterId || null,
    topicName: String(values.topicName || '').trim() || null,
    bloomLevel: values.bloomLevel || null,
    visibility: values.visibility || 2,
    marks: Number(values.marks),
    negativeMarks:
      values.negativeMarks === '' || values.negativeMarks == null
        ? null
        : Number(values.negativeMarks),
    tags: String(tagsText || '')
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
    options,
  };
}
