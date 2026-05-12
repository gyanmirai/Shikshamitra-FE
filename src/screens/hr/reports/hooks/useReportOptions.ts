import { useMemo } from 'react';
import { useGetEmployeeQuery } from 'src/redux/hr/employeeApi';
import { EmployeeStatusTypeOptions } from 'src/enums/employee-status-type';

export const EARNING_COMPONENTS = [
  'Basic Salary',
  'House Rent Allowance (HRA)',
  'Transport Allowance',
  'Special Allowance',
  'Medical Allowance',
  'Bonus',
];

export const DEDUCTION_COMPONENTS = [
  'Provident Fund (PF)',
  'Professional Tax',
  'Income Tax (TDS)',
  'Loan Recovery',
  'Health Insurance',
  'Other Deductions',
];

export const useReportOptions = () => {
  const { data: employeeData, isLoading: isEmployeeLoading } = useGetEmployeeQuery({
    page: 1,
    pageSize: 500,
    search: '',
  });

  const employees = useMemo(() => employeeData?.items || [], [employeeData]);

  const departmentOptions = useMemo(() => {
    const depts = new Set<string>();
    employees.forEach((emp: any) => {
      if (emp.department) {
        depts.add(emp.department);
      }
    });
    return Array.from(depts).sort();
  }, [employees]);

  return {
    employees,
    departmentOptions,
    statusOptions: EmployeeStatusTypeOptions,
    earningComponents: EARNING_COMPONENTS,
    deductionComponents: DEDUCTION_COMPONENTS,
    isEmployeeLoading,
  };
};
