import * as Yup from 'yup';

// Validation schema for form fields
export const validationSchema = Yup.object({
  chapterNo: Yup.number().required('Chapter No is required'),
  chapterName: Yup.string().required('Chapter name is required'),
  assignedTeacher: Yup.string().required('Assigned Teacher is Required'),
  content: Yup.string().required('Chapter description is required'),
  startTime: Yup.mixed().required('Select the Start Date for chapter'),
  endTime: Yup.mixed().required('Select the End Date for chapter'),
});
