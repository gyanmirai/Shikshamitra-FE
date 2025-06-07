import { RenderPfRules } from './RenderPfRules';

import type { FieldsType } from './types';

export const PayrollFields: FieldsType[] = [
  {
    type: 'text',
    label: 'Bank Name',
    name: 'bankName',
    placeholder: 'Enter Bank Name',
  },
  {
    type: 'text',
    label: 'Branch Name',
    name: 'branchName',
    placeholder: 'Enter Branch Name',
  },
  {
    type: 'text',
    label: 'Account Holder Name',
    name: 'accountHolderName',
    placeholder: 'Enter Account Holder Name',
  },
  {
    type: 'text',
    label: 'Account Number',
    name: 'accountNumber',
    placeholder: 'Enter Account Number',
  },
  {
    type: 'text',
    label: 'IFSC Code',
    name: 'ifscCode',
    placeholder: 'Enter IFSC Code',
  },
  {
    type: 'dropdown',
    label: 'PF Type',
    name: 'pfType',
    placeholder: 'Select PF Type',
  },
  {
    type: 'dropdown',
    label: 'PF Rule',
    name: 'pfRule',
    placeholder: 'Select PF Rule',
    renderComp(props) {
      return <RenderPfRules {...props} />;
    },
  },
  {
    type: 'text',
    label: 'EPF Number',
    name: 'epfNumber',
    placeholder: 'Enter EPF Number',
  },
  {
    type: 'text',
    label: 'UAN Number',
    name: 'uanNumber',
    placeholder: 'Enter UAN Number',
  },
  {
    type: 'number',
    label: 'Basic Salary',
    name: 'basicSalary',
    placeholder: 'Enter Basic Salary',
  },
  {
    type: 'text',
    label: 'Punch Id',
    name: 'punchId',
    placeholder: 'Enter Punch Id',
  },
  {
    type: 'text',
    label: 'TDS Percentage',
    name: 'tdsPercentage',
    placeholder: 'Enter TDS Percentage',
  },
  {
    type: 'text',
    label: 'TDS Amount',
    name: 'tdsAmount',
    placeholder: 'Enter TDS Amount',
  },
];
