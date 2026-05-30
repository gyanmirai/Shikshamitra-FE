import * as Yup from 'yup';
import {
  EmployeeStatusType,
  EmployeeStatusTypeArray,
  EmployeeStatusTypeInformation,
} from 'src/enums/employee-status-type';

export const getEmployeeStatusOptions = (currentStatus: EmployeeStatusType) => {
  const isTerminal =
    currentStatus === EmployeeStatusType.Left || currentStatus === EmployeeStatusType.Retired;

  return EmployeeStatusTypeArray.map((item, index) => ({
    label: EmployeeStatusType[index],
    value: index,
    description: EmployeeStatusTypeInformation[item as keyof typeof EmployeeStatusTypeInformation],
  })).filter((option) => !(isTerminal && option.value === EmployeeStatusType.Active));
};

export const changeStatusValidationSchema = Yup.object({
  status: Yup.object({
    value: Yup.number().required('Status is required'),
  }).required('Status is required'),
  effectiveDate: Yup.mixed().when('status', {
    is: (statusValue: { value: EmployeeStatusType } | null) =>
      statusValue?.value !== EmployeeStatusType.Active,
    then: (schema) => schema.required('Effective date is required'),
    otherwise: (schema) => schema.nullable(),
  }),
  remarks: Yup.string()
    .max(2000, 'Remarks must be at most 2000 characters')
    .when('status', {
      is: (statusValue: { value: EmployeeStatusType } | null) =>
        statusValue?.value === EmployeeStatusType.Left ||
        statusValue?.value === EmployeeStatusType.Retired,
      then: (schema) => schema.trim().required('Remarks are required for Left or Retired status'),
      otherwise: (schema) => schema.nullable(),
    }),
});
