import * as Yup from 'yup';

export const resourceVerifiedValidationSchema = Yup.object().shape({
  resourceStatusAfterAudit: Yup.string().required('Audit status is required'),
  descriptionAfterResourceAudit: Yup.string()
    .required('Audit description is required')
    .min(10, 'Description must be at least 10 characters'),
});
