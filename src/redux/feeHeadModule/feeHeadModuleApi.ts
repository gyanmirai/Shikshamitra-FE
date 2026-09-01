import { financeModuleType } from 'src/redux/tagTypes';

import { financeModuleApi } from '../finance/financeModuleApi';

export enum FeeHeadModule {
  Dashboard = 0,
  Student = 1,
  Academics = 2,
  ClassManagement = 3,
  HRStaff = 4,
  Finance = 5,
  Communication = 6,
  Calendar = 7,
  Library = 8,
  Transport = 9,
  ResourceManagement = 10,
  Hostel = 11,
  Security = 12,
  SecurityGuard = 13,
  InstituteSetup = 14,
}

export const FEE_HEAD_MODULE_VALUES = Object.values(FeeHeadModule).filter(
  (value): value is FeeHeadModule => typeof value === 'number'
);

export const FEE_HEAD_MODULE_LABELS: Record<FeeHeadModule, string> = {
  [FeeHeadModule.Dashboard]: 'Dashboard',
  [FeeHeadModule.Student]: 'Student',
  [FeeHeadModule.Academics]: 'Academics',
  [FeeHeadModule.ClassManagement]: 'Class Management',
  [FeeHeadModule.HRStaff]: 'HR/Staff',
  [FeeHeadModule.Finance]: 'Finance',
  [FeeHeadModule.Communication]: 'Communication',
  [FeeHeadModule.Calendar]: 'Calendar',
  [FeeHeadModule.Library]: 'Library',
  [FeeHeadModule.Transport]: 'Transport',
  [FeeHeadModule.ResourceManagement]: 'Resource Management',
  [FeeHeadModule.Hostel]: 'Hostel',
  [FeeHeadModule.Security]: 'Security',
  [FeeHeadModule.SecurityGuard]: 'Security Guard',
  [FeeHeadModule.InstituteSetup]: 'Institute Setup',
};

export const getFeeHeadModuleDisplayName = (module?: FeeHeadModule | null) =>
  module == null ? '-' : FEE_HEAD_MODULE_LABELS[module] || '-';

export interface IFeeHeadModuleOption {
  value: FeeHeadModule;
  displayName: string;
}

export const feeHeadModuleApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get fee head module lookup list
    getFeeHeadModules: builder.query<IFeeHeadModuleOption[], void>({
      query: () => ({
        url: '/fee-head-modules',
        method: 'GET',
      }),
      providesTags: [financeModuleType.feeHeadModule],
    }),
  }),
});

export const { useGetFeeHeadModulesQuery } = feeHeadModuleApi;
