import * as Yup from 'yup';

export const reconciliationDialogValidationSchema = Yup.object({
  checkBounceCharges: Yup.string().required('Bounce Charges is required'),
  checkBounceReason: Yup.string().required('Reason is required'),
});
