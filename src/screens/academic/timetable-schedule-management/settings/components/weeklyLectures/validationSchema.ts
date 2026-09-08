import * as Yup from 'yup';

import {
  MAX_WEEKLY_LECTURES_PER_SUBJECT,
  MIN_WEEKLY_LECTURES_PER_SUBJECT,
} from './weeklyLectureValue';

export const noOfLectureValidationSchema = Yup.object().shape({
  classId: Yup.string().required('Class is required'),
  subjects: Yup.array()
    .of(
      Yup.object().shape({
        name: Yup.string(),
        // subjectColor: Yup.string().required('Subject color is required'),
        noOfLecture: Yup.number()
          .required('Weekly Lectures are required')
          .min(MIN_WEEKLY_LECTURES_PER_SUBJECT, 'Weekly Lectures cannot be negative')
          .max(
            MAX_WEEKLY_LECTURES_PER_SUBJECT,
            `Weekly Lectures cannot exceed ${MAX_WEEKLY_LECTURES_PER_SUBJECT}`
          ),
      })
    )
    .required('At least one subject is required'),
});
