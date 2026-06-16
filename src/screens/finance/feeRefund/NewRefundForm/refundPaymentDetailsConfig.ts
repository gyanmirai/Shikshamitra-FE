import dayjs from 'dayjs';

import type { IPaymentMethodsConfig } from '../../FeeCollection/Components/type';

const schoolBankAccounts = [
  { id: 'HDFC Bank (HDFC0001234)', name: 'HDFC Bank (HDFC0001234)' },
  { id: 'ICICI Bank (ICIC0005678)', name: 'ICICI Bank (ICIC0005678)' },
  { id: 'SBI Bank (SBIN0003344)', name: 'SBI Bank (SBIN0003344)' },
  { id: 'Kotak Bank (KKBK0007788)', name: 'Kotak Bank (KKBK0007788)' },
];

export const refundPaymentMethodsConfig: IPaymentMethodsConfig = {
  Cash: [
    {
      name: 'amount',
      label: 'Refund Amount',
      type: 'amount',
      required: true,
      min: 0,
    },
    {
      name: 'refundDate',
      label: 'Refund Date',
      type: 'date',
      required: true,
      isDefaultToday: true,
    },
    {
      name: 'receivedBy',
      label: 'Received By',
      type: 'text',
      required: true,
      pattern: '^[A-Za-z ]+$',
      patternMessage: 'Name can only contain letters and spaces',
      maxLength: 100,
    },
    {
      name: 'remarks',
      label: 'Remarks',
      type: 'multiline',
      required: false,
      maxLength: 500,
    },
  ],

  Cheque: [
    {
      name: 'amount',
      label: 'Refund Amount',
      type: 'amount',
      required: true,
      min: 0,
    },
    {
      name: 'refundDate',
      label: 'Cheque Issue Date',
      type: 'date',
      required: true,
      isDefaultToday: true,
    },
    {
      name: 'chequeNumber',
      label: 'Cheque Number',
      type: 'numbers',
      required: true,
      pattern: '^[0-9]{6}$',
      patternMessage: 'Cheque Number must be exactly 6 digits',
      maxLength: 6,
    },
    {
      name: 'payeeName',
      label: 'Student / Parent Name',
      type: 'text',
      required: true,
      pattern: '^[A-Za-z ]+$',
      patternMessage: 'Name can only contain letters and spaces',
      maxLength: 100,
    },
    {
      name: 'sourceBankAccount',
      label: 'Source School Account',
      type: 'select',
      required: true,
      options: schoolBankAccounts,
    },
    {
      name: 'remarks',
      label: 'Remarks',
      type: 'multiline',
      required: false,
      maxLength: 500,
    },
  ],

  'Demand Draft (DD)': [
    {
      name: 'amount',
      label: 'Refund Amount',
      type: 'amount',
      required: true,
      min: 0,
    },
    {
      name: 'issueDate',
      label: 'DD Issue Date',
      type: 'date',
      required: true,
      isDefaultToday: true,
    },
    {
      name: 'ddNumber',
      label: 'DD Number',
      type: 'numbers',
      required: true,
      pattern: '^[0-9]{6,7}$',
      patternMessage: 'DD Number must be 6 or 7 digits',
      maxLength: 7,
    },
    {
      name: 'bankName',
      label: 'Bank Name',
      type: 'text',
      required: true,
      pattern: '^[A-Za-z ]+$',
      patternMessage: 'Bank Name can only contain letters and spaces',
      maxLength: 100,
    },
    {
      name: 'branchName',
      label: 'Branch Name',
      type: 'text',
      required: true,
      pattern: '^[A-Za-z ]+$',
      patternMessage: 'Branch Name can only contain letters and spaces',
      maxLength: 100,
    },
    {
      name: 'payeeName',
      label: 'Student / Parent Name',
      type: 'text',
      required: true,
      pattern: '^[A-Za-z ]+$',
      patternMessage: 'Name can only contain letters and spaces',
      maxLength: 100,
    },
    {
      name: 'sourceBankAccount',
      label: 'Source School Account',
      type: 'select',
      required: true,
      options: schoolBankAccounts,
    },
    {
      name: 'remarks',
      label: 'Remarks',
      type: 'multiline',
      required: false,
      maxLength: 500,
    },
  ],

  'Bank Transfer (NEFT/RTGS/IMPS)': [
    {
      name: 'amount',
      label: 'Refund Amount',
      type: 'amount',
      required: true,
      min: 0,
    },
    {
      name: 'refundDate',
      label: 'Transfer Date',
      type: 'date',
      required: true,
      isDefaultToday: true,
    },
    {
      name: 'transactionId',
      label: 'UTR / Transaction Number',
      type: 'text',
      required: false,
      maxLength: 50,
    },
    {
      name: 'sourceBankAccount',
      label: 'Source School Account',
      type: 'select',
      required: true,
      options: schoolBankAccounts,
    },
    {
      name: 'beneficiaryName',
      label: 'Account Holder Name',
      type: 'text',
      required: true,
      pattern: '^[A-Za-z ]+$',
      patternMessage: 'Account Holder Name can only contain letters and spaces',
      maxLength: 100,
    },
    {
      name: 'beneficiaryBankName',
      label: 'Bank Name',
      type: 'text',
      required: true,
      pattern: '^[A-Za-z ]+$',
      patternMessage: 'Bank Name can only contain letters and spaces',
      maxLength: 100,
    },
    {
      name: 'beneficiaryAccountNumber',
      label: 'Account Number',
      type: 'numbers',
      required: true,
      pattern: '^[0-9]{9,18}$',
      patternMessage: 'Account Number must be between 9 and 18 digits',
      maxLength: 18,
    },
    {
      name: 'ifscCode',
      label: 'IFSC Code',
      type: 'text',
      required: true,
      pattern: '^[A-Z]{4}0[A-Z0-9]{6}$',
      patternMessage: 'Please enter a valid IFSC Code',
      maxLength: 11,
    },
    {
      name: 'remarks',
      label: 'Remarks',
      type: 'multiline',
      required: false,
      maxLength: 500,
    },
  ],

  UPI: [
    {
      name: 'amount',
      label: 'Refund Amount',
      type: 'amount',
      required: true,
      min: 0,
    },
    {
      name: 'refundDate',
      label: 'Refund Date',
      type: 'date',
      required: true,
      isDefaultToday: true,
    },
    {
      name: 'transactionId',
      label: 'UPI Transaction ID',
      type: 'text',
      required: false,
      maxLength: 50,
    },
    {
      name: 'sourceBankAccount',
      label: 'Source School Account',
      type: 'select',
      required: true,
      options: schoolBankAccounts,
    },
    {
      name: 'beneficiaryName',
      label: 'Student / Parent Name',
      type: 'text',
      required: true,
      pattern: '^[A-Za-z ]+$',
      patternMessage: 'Name can only contain letters and spaces',
      maxLength: 100,
    },
    {
      name: 'upiId',
      label: 'UPI ID',
      type: 'text',
      required: true,
      pattern: '^[a-zA-Z0-9._-]{2,}@[a-zA-Z]{2,}$',
      patternMessage: 'Please enter a valid UPI ID',
      maxLength: 50,
    },
    {
      name: 'remarks',
      label: 'Remarks',
      type: 'multiline',
      required: false,
      maxLength: 500,
    },
  ],
};

export const getInitialRefundPaymentDetails = (method?: string) => {
  if (!method || !(method in refundPaymentMethodsConfig)) return {};

  return refundPaymentMethodsConfig[method as keyof typeof refundPaymentMethodsConfig].reduce(
    (acc, field) => {
      if (field.type === 'date') {
        acc[field.name] = field.isDefaultToday ? dayjs() : '';
      } else {
        acc[field.name] = '';
      }
      return acc;
    },
    {} as Record<string, any>
  );
};
