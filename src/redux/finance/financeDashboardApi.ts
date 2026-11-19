import type { PaymentMethod } from 'src/enums/finance-payment-method';

import { financeModuleApi } from './financeModuleApi';

export type FinanceDashboardClass = {
  classId: string | null;
  className: string;
  boardId: string | null;
  mediumId: string | null;
  boardMedium: string | null;
  outstanding: number;
  overdue: number;
  studentsWithOverdueFees: number;
  separateCharges: number | null;
};

export type FinanceDashboardBalances = {
  outstanding: number;
  overdue: number;
  studentsWithOverdueFees: number;
  classes: FinanceDashboardClass[];
};

export type FinanceDashboardWork = {
  kind: 'concessionReview' | 'refundReview' | 'refundFailed' | 'refundPayment';
  count: number;
  amount: number | null;
};

type FinanceDashboardOverview = {
  balances: FinanceDashboardBalances | null;
  work: FinanceDashboardWork[];
  refundsAwaitingPayment: FinanceDashboardWork | null;
};

export type FinanceDashboardActivity = {
  confirmedFees: number | null;
  receiptCount: number | null;
  days: { date: string; amount: number }[];
  paymentMethods: { method: PaymentMethod; amount: number }[];
  confirmedIncome: number | null;
  confirmedExpenses: number | null;
  netMovement: number | null;
  accountEntryCount: number | null;
  collectionsUnavailable: string | null;
};

type DashboardPeriod = { academicYearId: string; scopeKey: string; from: string; to: string };

export const financeDashboardApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getFinanceDashboardOverview: builder.query<FinanceDashboardOverview, DashboardPeriod>({
      query: ({ academicYearId, from, to }) => ({
        url: '/finance/dashboard/overview',
        params: { academicYearId, from, to },
      }),
      keepUnusedDataFor: 0,
    }),
    getFinanceDashboardActivity: builder.query<FinanceDashboardActivity, DashboardPeriod>({
      query: ({ academicYearId, from, to }) => ({
        url: '/finance/dashboard/activity',
        params: { academicYearId, from, to },
      }),
      keepUnusedDataFor: 0,
    }),
  }),
});

export const { useGetFinanceDashboardOverviewQuery, useGetFinanceDashboardActivityQuery } =
  financeDashboardApi;

export type { FinanceDashboardOverview };
