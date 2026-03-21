export const getBookCategoryInitialValues = (editData?: any) => ({
  categoryName: editData?.categoryName || '',
  code: editData?.code || '',
  description: editData?.description || '',
});
