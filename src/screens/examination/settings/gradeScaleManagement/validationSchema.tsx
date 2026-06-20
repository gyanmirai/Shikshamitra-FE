import * as Yup from 'yup';

export const validationSchema = Yup.object().shape({
  name: Yup.string().required('Grading Scale Title is Required'),
  totalMarks: Yup.string().required('Total Marks is Required'),
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

      for (let i = 0; i < gradingScale.length; i += 1) {
        const itemA = gradingScale[i];
        const minA =
          itemA.minMarks !== undefined && itemA.minMarks !== null ? Number(itemA.minMarks) : NaN;
        const maxA =
          itemA.maxMarks !== undefined && itemA.maxMarks !== null ? Number(itemA.maxMarks) : NaN;
        // eslint-disable-next-line no-continue
        if (Number.isNaN(minA) || Number.isNaN(maxA)) continue;

        for (let j = i + 1; j < gradingScale.length; j += 1) {
          const itemB = gradingScale[j];
          const minB =
            itemB.minMarks !== undefined && itemB.minMarks !== null ? Number(itemB.minMarks) : NaN;
          const maxB =
            itemB.maxMarks !== undefined && itemB.maxMarks !== null ? Number(itemB.maxMarks) : NaN;
          // eslint-disable-next-line no-continue
          if (Number.isNaN(minB) || Number.isNaN(maxB)) continue;

          // Check overlap: range A overlaps with range B if (minA <= maxB and maxA >= minB)
          if (minA <= maxB && maxA >= minB) {
            return this.createError({
              path: `gradingScale.${i}.maxMarks`,
              message: `Overlaps with range (${minB}-${maxB})`,
            });
          }
        }
      }
      return true;
    }),
});
