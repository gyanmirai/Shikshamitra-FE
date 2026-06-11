export type EmployeeCreateResponseForForm = {
  id?: string | null;
  userId?: string | null;
};

export type EmployeeIdentityFormValues = {
  employeeId?: string;
  userId?: string | null;
};

export const applyEmployeeCreateResponseToFormValues = <T extends EmployeeIdentityFormValues>(
  values: T,
  response: EmployeeCreateResponseForForm
): T => ({
  ...values,
  employeeId: response.id || values.employeeId || '',
  userId: response.userId || values.userId,
});
