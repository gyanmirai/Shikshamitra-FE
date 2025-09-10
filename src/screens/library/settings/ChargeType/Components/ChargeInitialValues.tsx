export const getChargeTypeInitialValues = (editData?: any) => ({
  chargeType: editData?.chargeType || '',
  amount: editData?.amount || '',
  description: editData?.description || '',
});
