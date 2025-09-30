export const paymentMethodsConfig = {
  Cash: [{ name: 'amount', label: 'Amount', type: 'amount', required: true, min: 0 }],

  Cheque: [
    { name: 'amount', label: 'Amount', type: 'amount', required: true, min: 0 },
    {
      name: 'chequeNumber',
      label: 'Cheque Number',
      type: 'text',
      required: true,
      pattern: '^[0-9]{6}$',
      patternMessage: 'Cheque Number must be exactly 6 digits',
    },
    {
      name: 'bankName',
      label: 'Bank Name',
      type: 'text',
      required: true,
      pattern: '^(?=.*[a-zA-Z0-9])[a-zA-Z0-9 ]+$',

      // patternMessage: 'Bank Name can include letters, numbers, spaces and . , & ( ) -',
    },
    { name: 'chequeDate', label: 'Cheque Date', type: 'date', required: true },
    {
      name: 'payeeName',
      label: 'Cheque Holder Name',
      type: 'text',
      required: true,
      pattern: '^(?=.*[a-zA-Z0-9])[a-zA-Z0-9 ]+$',
      // patternMessage: 'Cheque Holder Name can include letters, numbers, spaces and . , & ( ) -',
    },
  ],

  'Demand Draft (DD)': [
    { name: 'amount', label: 'Amount', type: 'amount', required: true, min: 0 },
    { name: 'paymentDate', label: 'Payment Date', type: 'date', required: true },
    {
      name: 'currency',
      label: 'Currency',
      type: 'select',
      required: true,
      options: ['INR', 'USD', 'EUR'],
    },
    {
      name: 'ddNumber',
      label: 'DD Number',
      type: 'text',
      required: true,
      pattern: '^[0-9]{7}$',
      patternMessage: 'DD Number must be exactly 6 OR 7 digits',
    },
    {
      name: 'bankName',
      label: 'Bank Name',
      type: 'text',
      required: true,
      pattern: '^(?=.*[a-zA-Z0-9])[a-zA-Z0-9 ]+$',

      // patternMessage: 'Bank Name can include letters, numbers, spaces and . , & ( ) -',
    },
    {
      name: 'branchName',
      label: 'Branch Name',
      type: 'text',
      required: true,
      pattern: '^(?=.*[a-zA-Z0-9])[a-zA-Z0-9 ]+$',

      // patternMessage: 'Branch Name can include letters, numbers, spaces and . , & ( ) -',
    },
    { name: 'issueDate', label: 'Issue Date', type: 'date', required: true },
    {
      name: 'payeeName',
      label: 'Payee Name',
      type: 'text',
      required: true,
      pattern: '^(?=.*[a-zA-Z0-9])[a-zA-Z0-9 ]+$',

      // patternMessage: 'Payee Name can include letters, numbers, spaces and . , & ( ) -',
    },
    { name: 'remarks', label: 'Remarks', type: 'multiline', required: false },
  ],

  'Bank Transfer (NEFT/RTGS/IMPS)': [
    { name: 'amount', label: 'Amount', type: 'amount', required: true, min: 0 },
    {
      name: 'transactionId',
      label: 'Transaction ID / UTR Number',
      type: 'text',
      required: true,
    },
    { name: 'transferDate', label: 'Transfer Date', type: 'date', required: true },
    {
      name: 'accountHolderName',
      label: 'Account Holder Name',
      type: 'text',
      required: true,
      pattern: '^(?=.*[a-zA-Z0-9])[a-zA-Z0-9 ]+$',

      // patternMessage: 'Bank Name can include letters, numbers, spaces and . , & ( ) -',
    },
  ],

  'Credit Card': [
    { name: 'amount', label: 'Amount', type: 'amount', required: true, min: 0 },
    {
      name: 'cardHolderName',
      label: 'Card Holder Name',
      type: 'text',
      required: true,
      pattern: '^(?=.*[a-zA-Z0-9])[a-zA-Z0-9 ]+$',

      // patternMessage: 'Card Holder Name can include letters, numbers, spaces and . , & ( ) -',
    },
    {
      name: 'last4Digits',
      label: 'Last 4 Digits of Card',
      type: 'text',
      required: true,
      pattern: '^[0-9]{4}$',
    },
    {
      name: 'transactionId',
      label: 'Transaction ID',
      type: 'text',
      required: true,
    },
    { name: 'paymentDate', label: 'Payment Date', type: 'date', required: false },
  ],

  UPI: [
    { name: 'amount', label: 'Amount', type: 'amount', required: true, min: 0 },
    { name: 'upiId', label: 'UPI ID/VPA', type: 'text', required: true },
    {
      name: 'transactionId',
      label: 'Transaction ID',
      type: 'text',
      required: true,
    },
    { name: 'paymentDate', label: 'Payment Date', type: 'date', required: true },
  ],

  'Online Payment Gateway': [
    { name: 'amount', label: 'Amount', type: 'amount', required: true, min: 0 },
    { name: 'paymentDate', label: 'Payment Date', type: 'date', required: true },
    {
      name: 'currency',
      label: 'Currency',
      type: 'select',
      required: true,
      options: ['INR', 'USD', 'EUR'],
    },
    {
      name: 'transactionId',
      label: 'Transaction ID / Payment Reference Number',
      type: 'text',
      required: true,
    },
    {
      name: 'paymentGateway',
      label: 'Payment Gateway Name',
      type: 'text',
      required: true,
      pattern: '^(?=.*[a-zA-Z0-9])[a-zA-Z0-9 ]+$',

      // patternMessage: 'Payment Gateway Name can include letters, numbers, spaces and . , & ( ) -',
    },
    { name: 'remarks', label: 'Remarks', type: 'multiline', required: false },
  ],

  'Wallet / Prepaid Card': [
    { name: 'amount', label: 'Amount', type: 'amount', required: true, min: 0 },
    {
      name: 'walletProvider',
      label: 'Wallet Provider Name',
      type: 'text',
      required: true,
      pattern: '^[a-zA-Z0-9 ]+$',
      // patternMessage: 'Wallet Provider Name can include letters, numbers, spaces and . , & ( ) -',
    },
    {
      name: 'transactionId',
      label: 'Transaction ID',
      type: 'text',
      required: true,
    },
    { name: 'remarks', label: 'Remarks', type: 'multiline', required: false },
  ],
};
