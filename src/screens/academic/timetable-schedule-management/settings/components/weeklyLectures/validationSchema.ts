import * as Yup from 'yup';

export const noOfLectureValidationSchema = Yup.object().shape({
  className: Yup.string().required('Class is required'),
  subjects: Yup.array()
    .of(
      Yup.object().shape({
        name: Yup.string().required('Subject name is required'),
        subjectColor: Yup.string().required('Subject color is required'),
        noOfLecture: Yup.number()
          .required('Lecture count is required')
          .min(0, 'Cannot be negative')
          .max(100, 'Too many lectures'),
      })
    )
    .required('At least one subject is required'),
  totalLectures: Yup.number()
    .required('Total lectures is required')
    .min(0, 'Total lectures cannot be negative')
    .test('sum-of-lectures', 'Total lectures must match sum of subject lectures', function (value) {
      const { subjects } = this.parent;
      const sum = subjects.reduce((acc: number, subject: any) => acc + subject.noOfLecture, 0);
      return value === sum;
    }),
});
