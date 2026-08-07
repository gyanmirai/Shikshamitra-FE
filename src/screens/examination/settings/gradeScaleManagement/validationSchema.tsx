import * as Yup from 'yup';

// ---------------------------------------------------------------------------
// Step 1 — Basic Details
// Only the identity/marks fields are validated here so users never see
// "Grade Range" errors before reaching that step.
// ---------------------------------------------------------------------------
export const basicDetailsSchema = Yup.object().shape({
  name: Yup.string().required('Grading Scale Title is Required'),
  totalMarks: Yup.number()
    .required('Total Marks is Required')
    .min(1, 'Total Marks must be greater than 0'),
  passMarks: Yup.number()
    .transform((value, originalValue) => (originalValue === '' ? null : value))
    .nullable()
    .min(0, 'Pass Marks cannot be negative')
    .test('pass-marks-limit', 'Pass Marks cannot exceed Total Marks', function (val) {
      if (val === null || val === undefined) return true;
      const { totalMarks } = this.parent;
      return totalMarks === undefined || totalMarks === null || val <= Number(totalMarks);
    }),
  description: Yup.string().max(500, 'Description cannot exceed 500 characters'),
  isDefault: Yup.boolean(),
  status: Yup.number().required('Status is Required'),
});

// ---------------------------------------------------------------------------
// Step 2 — Grade Ranges
// Only the gradingScale array is validated here. The range tests read
// totalMarks from the actual form values (this.parent / options.from), so they
// keep working even though totalMarks is declared in the Basic Details schema.
// ---------------------------------------------------------------------------
export const gradeRangesSchema = Yup.object().shape({
  gradingScale: Yup.array()
    .min(1, 'At least one grade range is required')
    .of(
      Yup.object().shape({
        minMarks: Yup.number()
          .required('Min Marks is Required')
          .min(0, 'Min Marks must be at least 0')
          .test('min-marks-limit', 'Cannot exceed total marks', function (val) {
            const totalMarksVal = Number((this.options as any).from?.[1]?.value?.totalMarks);
            if (!Number.isNaN(totalMarksVal) && val > totalMarksVal) {
              return false;
            }
            return true;
          })
          .test('min-lt-max', 'Min Marks must be less than Max Marks', function (val) {
            const { maxMarks } = this.parent;
            if (maxMarks !== undefined && maxMarks !== null && val >= Number(maxMarks)) {
              return false;
            }
            return true;
          }),
        maxMarks: Yup.number()
          .required('Max Marks is Required')
          .min(0, 'Max Marks must be at least 0')
          .test('max-marks-limit', 'Cannot exceed total marks', function (val) {
            const totalMarksVal = Number((this.options as any).from?.[1]?.value?.totalMarks);
            if (!Number.isNaN(totalMarksVal) && val > totalMarksVal) {
              return false;
            }
            return true;
          })
          .test('max-gt-min', 'Max Marks must be greater than Min Marks', function (val) {
            const { minMarks } = this.parent;
            if (minMarks !== undefined && minMarks !== null && val <= Number(minMarks)) {
              return false;
            }
            return true;
          }),
        grade: Yup.string().required('Grade is Required'),
        gradePoint: Yup.number()
          .transform((value, originalValue) => (originalValue === '' ? null : value))
          .nullable()
          .min(0, 'Grade Point must be at least 0')
          .max(100, 'Grade Point cannot exceed 100'),
        remark: Yup.string().max(100, 'Remark cannot exceed 100 characters'),
        resultStatus: Yup.number().required('Result Status is Required'),
      })
    )
    .test('unique-grades', 'Grades must be unique', function (gradingScale) {
      if (!gradingScale) return true;
      const seen = new Set();
      for (let i = 0; i < gradingScale.length; i += 1) {
        const g = gradingScale[i].grade;
        if (g && seen.has(g)) {
          return this.createError({
            path: `gradingScale.${i}.grade`,
            message: 'Duplicate grade',
          });
        }
        if (g) seen.add(g);
      }
      return true;
    })
    .test('no-overlap', 'Grade ranges must not overlap', function (gradingScale) {
      if (!gradingScale || gradingScale.length <= 1) return true;

      const validScales = gradingScale.filter((item) => {
        const min =
          item.minMarks !== undefined && item.minMarks !== null ? Number(item.minMarks) : NaN;
        const max =
          item.maxMarks !== undefined && item.maxMarks !== null ? Number(item.maxMarks) : NaN;
        return !Number.isNaN(min) && !Number.isNaN(max);
      });

      for (let i = 0; i < validScales.length; i += 1) {
        const minA = Number(validScales[i].minMarks);
        const maxA = Number(validScales[i].maxMarks);

        for (let j = i + 1; j < validScales.length; j += 1) {
          const minB = Number(validScales[j].minMarks);
          const maxB = Number(validScales[j].maxMarks);

          if (minA <= maxB && maxA >= minB) {
            return this.createError({
              path: `gradingScale.${i}.maxMarks`,
              message: `Overlaps with range (${minB}-${maxB})`,
            });
          }
        }
      }
      return true;
    })
    .test(
      'no-gaps',
      'Grade ranges must cover all marks from 0 to Total Marks with no gaps',
      function (gradingScale) {
        if (!gradingScale || gradingScale.length === 0) return true;
        const totalMarksVal = Number(this.parent.totalMarks);
        if (Number.isNaN(totalMarksVal) || totalMarksVal <= 0) return true;

        const sorted = [...gradingScale]
          .filter((item) => item.minMarks !== undefined && item.maxMarks !== undefined)
          .map((item) => ({ min: Number(item.minMarks), max: Number(item.maxMarks) }))
          .sort((a, b) => a.min - b.min);

        if (sorted.length === 0) return true;

        if (sorted[0].min !== 0) {
          return this.createError({
            path: 'gradingScale',
            message: 'The grading scale ranges must start from 0 marks.',
          });
        }

        for (let i = 0; i < sorted.length - 1; i += 1) {
          if (sorted[i + 1].min > sorted[i].max + 1) {
            return this.createError({
              path: 'gradingScale',
              message: `Gap detected between marks ${sorted[i].max} and ${sorted[i + 1].min}.`,
            });
          }
        }

        if (sorted[sorted.length - 1].max !== totalMarksVal) {
          return this.createError({
            path: 'gradingScale',
            message: `The grading scale ranges must cover up to the Total Marks (${totalMarksVal}).`,
          });
        }

        return true;
      }
    ),
});

// ---------------------------------------------------------------------------
// Full schema — used for the final submit (last step) so the complete form is
// validated before the API call.
// ---------------------------------------------------------------------------
export const fullValidationSchema = basicDetailsSchema.concat(gradeRangesSchema);

// Per-step schemas consumed by the stepper. The last entry is the full schema
// so the final submission validates the entire form.
export const stepValidationSchemas = [
  basicDetailsSchema,
  gradeRangesSchema,
  fullValidationSchema,
];

// Backward-compatible default export (the complete schema).
export const validationSchema = fullValidationSchema;
