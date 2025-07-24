import type { FormikProps } from 'formik';

import { useState } from 'react';

import type { IExamFormValues } from '../type';

const ExamDetails = (props: FormikProps<IExamFormValues>) => {
  // Formik instance for form handling and validation
  const formik = props;
  // State to store and manage exam schedules data for each subject, initialized with subjects from formik values
  const [examSchedules, setExamSchedules] = useState(formik.values.subjects);
  return <></>;
};
export default ExamDetails;
