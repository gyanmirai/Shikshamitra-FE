import * as Yup from 'yup';

// Validation schema for form fields
export const validationSchema = Yup.object({
  chapterNo: Yup.number().required('Chapter No is required'),
  chapterName: Yup.string().required('Chapter name is required'),
  startDate: Yup.mixed().required('Chapter Start Date is required'),
  endDate: Yup.mixed().required('Chapter End Date is required'),
});
