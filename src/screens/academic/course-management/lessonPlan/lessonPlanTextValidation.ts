import * as Yup from 'yup';

// Match CreateLessonPlanDto, UpdateLessonPlanDto, and LessonPlanConfiguration.
export const lessonPlanTextFields = {
  topic: {
    label: 'Topic',
    maxLength: 256,
    helper: 'Describe the topic planned for this lesson',
    placeholder: 'e.g. Addition of Fractions',
  },
  learningObjective: {
    label: 'Learning Objective',
    maxLength: 1024,
    helper: 'Clearly state what students should achieve by the end of the lesson',
    placeholder: 'Students will be able to...',
  },
  resourcesRequired: {
    label: 'Resources Required',
    maxLength: 512,
    helper: 'List materials, tools or aids needed to deliver this lesson',
    placeholder: 'Textbook, worksheet, projector...',
  },
} as const;

export type LessonPlanTextField = keyof typeof lessonPlanTextFields;
export type LessonPlanTextErrors = Partial<Record<LessonPlanTextField, string>>;

const textRule = (field: LessonPlanTextField) => {
  const { label, maxLength } = lessonPlanTextFields[field];
  return Yup.string().max(maxLength, `${label} must be ${maxLength} characters or fewer.`);
};

const textSchema = Yup.object({
  topic: textRule('topic'),
  learningObjective: textRule('learningObjective'),
  resourcesRequired: textRule('resourcesRequired'),
});

export function validateLessonPlanText(values: Record<LessonPlanTextField, string>) {
  const errors: LessonPlanTextErrors = {};
  try {
    textSchema.validateSync(values, { abortEarly: false });
  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      error.inner.forEach((issue) => {
        if (issue.path && Object.hasOwn(lessonPlanTextFields, issue.path)) {
          errors[issue.path as LessonPlanTextField] = issue.message;
        }
      });
    }
  }
  return errors;
}
