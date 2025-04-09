import * as Yup from 'yup';

export const validationSchema = Yup.object({
  taxName: Yup.string().required("Tax Name can't be empty"),
  taxPercentage: Yup.string().required("Tax Percentage can't be empty"),
  applicableRegion: Yup.array().min(1, 'Please select at least one region').required(),
  applicableCategory: Yup.array().min(1, 'Please select at least one category').required(),
});
