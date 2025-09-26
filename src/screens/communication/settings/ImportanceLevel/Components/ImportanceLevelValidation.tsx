import * as Yup from 'yup';

export const importanceLevelValidationSchema = Yup.object().shape({
  levelName: Yup.string().trim().required('Importance Level is required'),
  description: Yup.string().nullable(),
  color: Yup.string().required('Color is required'),
});
