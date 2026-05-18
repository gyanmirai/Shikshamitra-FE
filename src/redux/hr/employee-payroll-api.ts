import { employeeType } from 'src/redux/tagTypes';

import { employeeApi } from './employeeApi';

export interface DayCalculationRequest {
  academicYearId?: string;
  dayCalculationType: 'working-days' | 'total-month-days' | 'manual-days';
  saturdayWorkPolicy?: SaturdayWorkPolicy;
  holidaySyncMode?: HolidaySyncMode;
  manualDays?: number;
  manualMonthDays?: DayCalculationManualMonth[];
  holidayOverrides?: PayrollHolidayOverride[];
}

export type SaturdayWorkPolicy = 'full-day' | 'half-day' | 'off';
export type HolidaySyncMode = 'synced-with-overrides';

export interface DayCalculationManualMonth {
  year: number;
  month: number;
  manualDays: number;
}

export interface DayCalculationMonthPreview {
  year: number;
  month: number;
  calendarDays: number;
  sundays: number;
  saturdays: number;
  saturdayUnits: number;
  weeklyOffDays: number;
  holidayDays: number;
  payrollHolidayDays: number;
  payrollHolidayUnits: number;
  workingDays: number;
  manualDays?: number | null;
  basisDays: number;
  dayCalculationType: 'working-days' | 'total-month-days' | 'manual-days';
  locked: boolean;
  holidayNames: string[];
  holidays: PayrollResolvedHoliday[];
}

export interface DayCalculationSetting {
  academicYearId?: string;
  dayCalculationType: 'working-days' | 'total-month-days' | 'manual-days';
  saturdayWorkPolicy: SaturdayWorkPolicy;
  holidaySyncMode: HolidaySyncMode;
  manualDays?: number | null;
  manualMonthDays: DayCalculationManualMonth[];
  holidayOverrides: PayrollHolidayOverride[];
  usedFallbackSetting: boolean;
  months: DayCalculationMonthPreview[];
}

export interface PayrollHolidayOverride {
  date: string;
  holidayName: string;
  includedInPayroll: boolean;
  calendarHolidayId?: string | null;
}

export interface PayrollResolvedHoliday {
  date: string;
  calendarHolidayId?: string | null;
  holidayName: string;
  source: 'calendar' | 'payroll' | string;
  includedInPayroll: boolean;
  isEditable: boolean;
}

export interface DayCalculationResponse {
  success: boolean;
  message: string;
  setting?: DayCalculationSetting;
}

export const employeePayrollApi = employeeApi.injectEndpoints({
  endpoints: (builder) => ({
    getDeductionComponents: builder.query({
      query: ({ page = 1, pageSize = 20, academicYearId, search }) => ({
        url: '/payroll/deduction-components',
        method: 'GET',
        params: { page, pageSize, academicYearId, search },
      }),
      providesTags: [employeeType.deductionComponents],
    }),
    getDeductionComponentById: builder.query({
      query: (id) => ({
        url: `/payroll/deduction-components/${id}`,
        method: 'GET',
      }),
      providesTags: [employeeType.deductionComponents],
    }),
    addDeductionComponent: builder.mutation({
      query: ({ academicYearId, body }) => ({
        url: '/payroll/deduction-components',
        method: 'POST',
        body,
      }),
      invalidatesTags: [employeeType.deductionComponents],
    }),
    updateDeductionComponent: builder.mutation({
      query: ({ id, body }) => ({
        url: `/payroll/deduction-components/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [
        employeeType.deductionComponents,
        employeeType.employeePayroll,
        employeeType.salaryStructure,
      ],
    }),
    previewDeductionComponentUpdateImpact: builder.mutation({
      query: ({ id, body, includeEmployees = false }) => ({
        url: `/payroll/deduction-components/${id}/update-impact-preview`,
        method: 'POST',
        params: { includeEmployees },
        body,
      }),
    }),
    previewDeductionComponentDeleteImpact: builder.query({
      query: ({ id, includeEmployees = true, skipCount = 0, maxResultCount = 20 }) => ({
        url: `/payroll/deduction-components/${id}/delete-impact-preview`,
        method: 'GET',
        params: { includeEmployees, skipCount, maxResultCount },
      }),
    }),
    deleteDeductionComponent: builder.mutation({
      query: ({ id, previewHash }) => ({
        url: `/payroll/deduction-components/${id}`,
        method: 'DELETE',
        params: { previewHash },
      }),
      invalidatesTags: [
        employeeType.deductionComponents,
        employeeType.employeePayroll,
        employeeType.salaryStructure,
      ],
    }),
    addEarningComponent: builder.mutation({
      query: ({ academicYearId, body }) => ({
        url: '/payroll/earning-components',
        method: 'POST',
        body,
      }),
      invalidatesTags: [employeeType.earningComponents],
    }),
    updateEarningComponent: builder.mutation({
      query: ({ id, body }) => ({
        url: `/payroll/earning-components/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [
        employeeType.earningComponents,
        employeeType.employeePayroll,
        employeeType.salaryStructure,
      ],
    }),
    previewEarningComponentUpdateImpact: builder.mutation({
      query: ({ id, body, includeEmployees = false }) => ({
        url: `/payroll/earning-components/${id}/update-impact-preview`,
        method: 'POST',
        params: { includeEmployees },
        body,
      }),
    }),
    previewEarningComponentDeleteImpact: builder.query({
      query: ({ id, includeEmployees = true, skipCount = 0, maxResultCount = 20 }) => ({
        url: `/payroll/earning-components/${id}/delete-impact-preview`,
        method: 'GET',
        params: { includeEmployees, skipCount, maxResultCount },
      }),
    }),
    getEarningComponents: builder.query({
      query: ({ page = 1, pageSize = 20, academicYearId, search }) => ({
        url: '/payroll/earning-components',
        method: 'GET',
        params: { page, pageSize, academicYearId, search },
      }),
      providesTags: [employeeType.earningComponents],
    }),
    getEarningComponentById: builder.query({
      query: (id) => ({
        url: `/payroll/earning-components/${id}`,
        method: 'GET',
      }),
      providesTags: [employeeType.earningComponents],
    }),
    deleteEarningComponent: builder.mutation({
      query: ({ id, previewHash }) => ({
        url: `/payroll/earning-components/${id}`,
        method: 'DELETE',
        params: { previewHash },
      }),
      invalidatesTags: [
        employeeType.earningComponents,
        employeeType.employeePayroll,
        employeeType.salaryStructure,
      ],
    }),
    saveDayCalculationSettings: builder.mutation({
      query: ({ body }) => ({
        url: '/payroll/day-calculation',
        method: 'POST',
        body,
      }),
      invalidatesTags: [employeeType.runPayroll],
    }),
    getDayCalculationSettings: builder.query<DayCalculationSetting, { academicYearId: string }>({
      query: ({ academicYearId }) => ({
        url: '/payroll/day-calculation',
        method: 'GET',
        params: { academicYearId },
      }),
      providesTags: [employeeType.runPayroll],
    }),
    previewDayCalculationSettings: builder.mutation<
      DayCalculationSetting,
      { body: DayCalculationRequest }
    >({
      query: ({ body }) => ({
        url: '/payroll/day-calculation/preview',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useAddDeductionComponentMutation,
  useAddEarningComponentMutation,
  useUpdateDeductionComponentMutation,
  useUpdateEarningComponentMutation,
  usePreviewDeductionComponentUpdateImpactMutation,
  usePreviewEarningComponentUpdateImpactMutation,
  usePreviewDeductionComponentDeleteImpactQuery,
  usePreviewEarningComponentDeleteImpactQuery,
  useGetDeductionComponentsQuery,
  useGetEarningComponentsQuery,
  useGetDeductionComponentByIdQuery,
  useGetEarningComponentByIdQuery,
  useDeleteDeductionComponentMutation,
  useDeleteEarningComponentMutation,
  useSaveDayCalculationSettingsMutation,
  useGetDayCalculationSettingsQuery,
  usePreviewDayCalculationSettingsMutation,
} = employeePayrollApi;
