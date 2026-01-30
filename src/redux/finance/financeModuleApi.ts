import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';
import expenseCategoryData from 'src/json/finance/settings/expense-category/expenseCategoryData.json';

import chargesData from '../../../chargesData.json';
import financeData from '../../../feeRefundData.json';
import concessionData from '../../../concession.json';
import financeModuleData from '../../../financeData.json';
import incomeDetailsData from '../../../financeIncomeData.json';
// your mock JSON
const isDev = process.env.NODE_ENV === 'development';

export const financeModuleApi = createApi({
  reducerPath: 'financeModuleApi',
  baseQuery: !isDev
    ? axiosBaseQuery({ baseUrl: 'http://localhost:3001' })
    : async ({ url }) => {
        switch (url) {
          case '/incomeCategoryOptions':
            return { data: incomeDetailsData.incomeCategoryOptions };
          case '/chargesData':
            return { data: chargesData.chargesData };
          case '/studentChargeData':
            return { data: chargesData.studentChargeData };
          case '/feeRefundData':
            return { data: financeData.feeRefundData };
          case '/concessionData':
            return { data: concessionData.concessionData };
          case '/concessionRequestData':
            return { data: concessionData.concessionRequestData };
          case '/bankAccountData':
            return { data: financeModuleData.bankAccountData };
          case '/concessionTypeData':
            return { data: financeModuleData.concessionTypeSetting };
          case '/expenseCategories':
            return { data: expenseCategoryData.expenseCategories };
          case '/budgetOptions':
            return { data: expenseCategoryData.budgetOptions };
          default:
            return {
              error: {
                status: 404,
                data: 'No mock data found for this route',
              },
            };
        }
      },
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
    'FeeHead',
  ],
  endpoints: () => ({}), // inject later
});
