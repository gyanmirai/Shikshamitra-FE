export const paymentMethodsConfig = {
  Cash: [{ name: 'amount', label: 'Amount', type: 'amount', required: true, min: 0 }],

  Cheque: [
    { name: 'amount', label: 'Amount', type: 'amount', required: true, min: 0 },
    {
      name: 'chequeNumber',
      label: 'Cheque Number',
      type: 'text',
      required: false,
      pattern: '^[0-9]{6}$',
      patternMessage: 'Cheque Number must be exactly 6 digits',
    },
    {
      name: 'bankName',
      label: 'Bank Name',
      type: 'text',
      required: false,
      pattern: '^(?=.*[a-zA-Z0-9])[a-zA-Z0-9 ]+$',

      // patternMessage: 'Bank Name can include letters, numbers, spaces and . , & ( ) -',
    },
    { name: 'chequeDate', label: 'Cheque Date', type: 'date', required: false },
    {
      name: 'payeeName',
      label: 'Cheque Holder Name',
      type: 'text',
      required: false,
      pattern: '^(?=.*[a-zA-Z0-9])[a-zA-Z0-9 ]+$',
      // patternMessage: 'Cheque Holder Name can include letters, numbers, spaces and . , & ( ) -',
    },
    {
      name: 'bankAccount',
      label: 'Bank Account',
      type: 'select',

      options: [
        'HDFC Bank (HDFC0001234)',
        'ICICI Bank (ICIC0005678)',
        'SBI Bank (SBIN0003344)',
        'Kotak Bank (KKBK0007788)',
      ],
    },
  ],

  'Demand Draft (DD)': [
    { name: 'amount', label: 'Amount', type: 'amount', required: true, min: 0 },
    { name: 'paymentDate', label: 'Payment Date', type: 'date', required: false },
    {
      name: 'currency',
      label: 'Currency',
      type: 'select',
      required: false,
      options: ['INR', 'USD', 'EUR'],
    },
    {
      name: 'ddNumber',
      label: 'DD Number',
      type: 'text',
      required: false,
      pattern: '^[0-9]{7}$',
      patternMessage: 'DD Number must be exactly 6 OR 7 digits',
    },
    {
      name: 'bankName',
      label: 'Bank Name',
      type: 'text',
      required: false,
      pattern: '^(?=.*[a-zA-Z0-9])[a-zA-Z0-9 ]+$',

      // patternMessage: 'Bank Name can include letters, numbers, spaces and . , & ( ) -',
    },
    {
      name: 'branchName',
      label: 'Branch Name',
      type: 'text',
      required: false,
      pattern: '^(?=.*[a-zA-Z0-9])[a-zA-Z0-9 ]+$',

      // patternMessage: 'Branch Name can include letters, numbers, spaces and . , & ( ) -',
    },
    { name: 'issueDate', label: 'Issue Date', type: 'date', required: false },
    {
      name: 'payeeName',
      label: 'Payee Name',
      type: 'text',
      required: false,
      pattern: '^(?=.*[a-zA-Z0-9])[a-zA-Z0-9 ]+$',

      // patternMessage: 'Payee Name can include letters, numbers, spaces and . , & ( ) -',
    },
    { name: 'remarks', label: 'Remarks', type: 'multiline', required: false },
    {
      name: 'bankAccount',
      label: 'Bank Account',
      type: 'select',
      // required: true,
      options: [
        'HDFC Bank (HDFC0001234)',
        'ICICI Bank (ICIC0005678)',
        'SBI Bank (SBIN0003344)',
        'Kotak Bank (KKBK0007788)',
      ],
    },
  ],

  'Bank Transfer (NEFT/RTGS/IMPS)': [
    { name: 'amount', label: 'Amount', type: 'amount', required: true, min: 0 },
    {
      name: 'transactionId',
      label: 'Transaction ID / UTR Number',
      type: 'text',
      required: false,
    },
    { name: 'transferDate', label: 'Transfer Date', type: 'date', required: false },
    {
      name: 'accountHolderName',
      label: 'Account Holder Name',
      type: 'text',
      required: false,
      pattern: '^(?=.*[a-zA-Z0-9])[a-zA-Z0-9 ]+$',

      // patternMessage: 'Bank Name can include letters, numbers, spaces and . , & ( ) -',
    },
    {
      name: 'bankAccount',
      label: 'Bank Account',
      type: 'select',
      // required: true,
      options: [
        'HDFC Bank (HDFC0001234)',
        'ICICI Bank (ICIC0005678)',
        'SBI Bank (SBIN0003344)',
        'Kotak Bank (KKBK0007788)',
      ],
    },
  ],

  'Credit Card': [
    { name: 'amount', label: 'Amount', type: 'amount', required: true, min: 0 },
    {
      name: 'cardHolderName',
      label: 'Card Holder Name',
      type: 'text',
      required: false,
      pattern: '^(?=.*[a-zA-Z0-9])[a-zA-Z0-9 ]+$',

      // patternMessage: 'Card Holder Name can include letters, numbers, spaces and . , & ( ) -',
    },
    {
      name: 'last4Digits',
      label: 'Last 4 Digits of Card',
      type: 'text',
      required: false,
      pattern: '^[0-9]{4}$',
    },
    {
      name: 'transactionId',
      label: 'Transaction ID',
      type: 'text',
      required: false,
    },
    { name: 'paymentDate', label: 'Payment Date', type: 'date', required: false },
    {
      name: 'bankAccount',
      label: 'Bank Account',
      type: 'select',
      // required: true,
      options: [
        'HDFC Bank (HDFC0001234)',
        'ICICI Bank (ICIC0005678)',
        'SBI Bank (SBIN0003344)',
        'Kotak Bank (KKBK0007788)',
      ],
    },
  ],

  UPI: [
    { name: 'amount', label: 'Amount', type: 'amount', required: true, min: 0 },
    { name: 'upiId', label: 'UPI ID/VPA', type: 'text', required: false },
    {
      name: 'transactionId',
      label: 'Transaction ID',
      type: 'text',
      required: false,
    },
    { name: 'paymentDate', label: 'Payment Date', type: 'date', required: false },
    {
      name: 'bankAccount',
      label: 'Bank Account',
      type: 'select',
      // required: true,
      options: [
        'HDFC Bank (HDFC0001234)',
        'ICICI Bank (ICIC0005678)',
        'SBI Bank (SBIN0003344)',
        'Kotak Bank (KKBK0007788)',
      ],
    },
  ],

  'Online Payment Gateway': [
    { name: 'amount', label: 'Amount', type: 'amount', required: true, min: 0 },
    { name: 'paymentDate', label: 'Payment Date', type: 'date', required: false },
    {
      name: 'currency',
      label: 'Currency',
      type: 'select',
      required: false,
      options: ['INR', 'USD', 'EUR'],
    },
    {
      name: 'transactionId',
      label: 'Transaction ID / Payment Reference Number',
      type: 'text',
      required: false,
    },
    {
      name: 'paymentGateway',
      label: 'Payment Gateway Name',
      type: 'text',
      required: false,
      pattern: '^(?=.*[a-zA-Z0-9])[a-zA-Z0-9 ]+$',

      // patternMessage: 'Payment Gateway Name can include letters, numbers, spaces and . , & ( ) -',
    },
    { name: 'remarks', label: 'Remarks', type: 'multiline', required: false },
    {
      name: 'bankAccount',
      label: 'Bank Account',
      type: 'select',
      // required: true,
      options: [
        'HDFC Bank (HDFC0001234)',
        'ICICI Bank (ICIC0005678)',
        'SBI Bank (SBIN0003344)',
        'Kotak Bank (KKBK0007788)',
      ],
    },
  ],

  'Wallet / Prepaid Card': [
    { name: 'amount', label: 'Amount', type: 'amount', required: true, min: 0 },
    {
      name: 'walletProvider',
      label: 'Wallet Provider Name',
      type: 'text',
      required: false,
      pattern: '^[a-zA-Z0-9 ]+$',
      // patternMessage: 'Wallet Provider Name can include letters, numbers, spaces and . , & ( ) -',
    },
    {
      name: 'transactionId',
      label: 'Transaction ID',
      type: 'text',
      required: false,
    },
    { name: 'remarks', label: 'Remarks', type: 'multiline', required: false },
    {
      name: 'bankAccount',
      label: 'Bank Account',
      type: 'select',
      options: [
        'HDFC Bank (HDFC0001234)',
        'ICICI Bank (ICIC0005678)',
        'SBI Bank (SBIN0003344)',
        'Kotak Bank (KKBK0007788)',
      ],
    },
  ],
};
