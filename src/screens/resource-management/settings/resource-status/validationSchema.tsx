import * as Yup from 'yup';

export const resourceStatusValidationSchema = Yup.object().shape({
  resourceStatusName: Yup.string().required('Status name is required'),
  resourceStatusDescription: Yup.string().required('Description is required'),
});
