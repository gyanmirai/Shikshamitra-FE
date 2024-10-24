import React from 'react';

import CustomizableTable from 'src/components/customizabaleTable';

export const FinanceStudentPaymentHistoryTab = () => {
  const data = [
    {
      id: 1,
      date: '25-12-2024',
      amount: '10000',
      paymentMethod: 'Cash',
    },
    {
      id: 2,
      date: '25-03-2025',
      amount: '5000',
      paymentMethod: 'Cash',
    },
    {
      id: 3,
      date: '25-05-2025',
      amount: '15000',
      paymentMethod: 'Cash',
    },
  ];
  return (
    <CustomizableTable
      columns={[
        { id: 'date', label: 'Date' },
        { id: 'amount', label: 'Amount' },
        { id: 'paymentMethod', label: 'Payment Method' },
      ]}
      data={data}
    />
  );
};
