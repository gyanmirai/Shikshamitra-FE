export const getChargeTypeInitialValues = (editData?: any) => ({
  chargeType: editData?.chargeType || '',
  isFixed: editData?.isFixed ?? false, // <-- add this line
  amount: editData?.amount !== undefined ? String(editData.amount) : '',
  description: editData?.description || '',
});
