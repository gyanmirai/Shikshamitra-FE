import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

export const financeModuleApi = createApi({
  reducerPath: 'financeModuleApi',
  baseQuery: axiosBaseQuery({ baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api` }),
  tagTypes: [
    'Charges',
    'StudentCharges',
    'FeeRefund',
    'Concession',
    'ConcessionRequest',
    'IncomeCategories',
    'BankAccounts',
    'Concession-Type',
    'expense-category',
    'budget-options',
    'ReceiptBook',
    'FeeCategory',
    'FeeHead',
    'FeeCollection',
    'FeeDetails',
    'ExpenseDetails',
    'ExpenseOptions',
    'paymentMethodsConfig',
    'IncomeTracking',
    'Charge-Category',
    'incomeCategoryData',
    'bank-account',
    'FeeStructure',
  ],
  endpoints: () => ({}), // inject later
});
