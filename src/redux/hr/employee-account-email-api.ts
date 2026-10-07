import { api } from 'src/redux/service';
import { employeeType } from 'src/redux/tagTypes';

export type EmployeeAccountEmail = {
  userId: string;
  employeeEmail: string | null;
  accountEmail: string;
  userName: string;
  concurrencyToken: string;
};

export type ChangeEmployeeAccountEmail = {
  email: string;
  reason: string;
  confirmEmployeeVerified: boolean;
  concurrencyToken: string;
  idempotencyKey: string;
};

export const employeeAccountEmailApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getEmployeeAccountEmail: builder.query<EmployeeAccountEmail, string>({
      query: (id) => `/employees/${id}/account-email`,
      providesTags: [employeeType.employee],
    }),
    changeEmployeeAccountEmail: builder.mutation<EmployeeAccountEmail,
      { employeeId: string; body: ChangeEmployeeAccountEmail }>({
      query: ({ employeeId, body }) => ({
        url: `/employees/${employeeId}/account-email`, method: 'PUT', body,
      }),
      invalidatesTags: (result) => result ? [employeeType.employee, employeeType.salarySlip] : [],
    }),
  }),
});

export const { useGetEmployeeAccountEmailQuery, useChangeEmployeeAccountEmailMutation } = employeeAccountEmailApi;
