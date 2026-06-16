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
      maxLength: 250,
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
      type: 'anytext',
      required: true,
      pattern: "^[A-Za-z][A-Za-z\\s.'-]{2,99}$",
      patternMessage: 'Enter a valid student/parent name. Example: Rahul Sharma',
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
      maxLength: 250,
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
      pattern: '^[0-9]{6,12}$',
      patternMessage: 'Enter a valid DD number. Example: 1234567890',
      maxLength: 12,
    },
    {
      name: 'bankName',
      label: 'Bank Name',
      type: 'anytext',
      required: true,
      pattern: '^[A-Za-z&.\\s]{3,100}$',
      patternMessage: 'Enter a valid bank name. Example: ICICI Bank',
      maxLength: 100,
    },
    {
      name: 'branchName',
      label: 'Branch Name',
      type: 'anytext',
      required: true,
      pattern: '^[A-Za-z0-9\\s-]{3,100}$',
      patternMessage: 'Enter a valid branch name. Example: MG Road Branch',
      maxLength: 100,
    },
    {
      name: 'payeeName',
      label: 'Student / Parent Name',
      type: 'anytext',
      required: true,
      pattern: "^[A-Za-z][A-Za-z\\s.'-]{2,99}$",
      patternMessage: 'Enter a valid student/parent name. Example: Rahul Sharma',
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
      maxLength: 250,
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
      type: 'anytext',
      required: false,
      pattern: '^$|^[A-Za-z0-9]{12,30}$',
      patternMessage: 'Enter a valid UTR/Transaction Number. Example: N123456789876',
      maxLength: 30,
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
      type: 'anytext',
      required: true,
      pattern: "^[A-Za-z][A-Za-z\\s.'-]{2,99}$",
      patternMessage: 'Enter a valid account holder name. Example: Rahul Sharma',
      maxLength: 100,
    },
    {
      name: 'beneficiaryBankName',
      label: 'Bank Name',
      type: 'anytext',
      required: true,
      pattern: '^[A-Za-z&.\\s]{3,100}$',
      patternMessage: 'Enter a valid bank name. Example: State Bank of India',
      maxLength: 100,
    },
    {
      name: 'beneficiaryAccountNumber',
      label: 'Account Number',
      type: 'numbers',
      required: true,
      pattern: '^[0-9]{9,18}$',
      patternMessage: 'Enter a valid account number (9–18 digits). Example: 123456789012',
      maxLength: 18,
    },
    {
      name: 'ifscCode',
      label: 'IFSC Code',
      type: 'uppercase',
      required: true,
      pattern: '/^[A-Z]{4}0[A-Z0-9]{6}$/',
      patternMessage: 'Enter a valid IFSC code. Example: SBIN0001234',
      maxLength: 11,
    },
    {
      name: 'remarks',
      label: 'Remarks',
      type: 'multiline',
      required: false,
      maxLength: 250,
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
      type: 'anytext',
      required: false,
      pattern: '^$|^[A-Za-z0-9]{10,35}$',
      patternMessage: 'Enter a valid UPI transaction ID. Example: T20240615123456',
      maxLength: 35,
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
      type: 'anytext',
      required: true,
      pattern: "^[A-Za-z][A-Za-z\\s.'-]{2,99}$",
      patternMessage: 'Enter a valid student/parent name. Example: Rahul Sharma',
      maxLength: 100,
    },
    {
      name: 'upiId',
      label: 'UPI ID',
      type: 'anytext',
      required: true,
      pattern: '^[a-zA-Z0-9._-]{2,100}@[a-zA-Z]{2,20}$',
      patternMessage: 'Enter a valid UPI ID. Example: rahul123@okaxis',
      maxLength: 121,
    },
    {
      name: 'remarks',
      label: 'Remarks',
      type: 'multiline',
      required: false,
      maxLength: 250,
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
