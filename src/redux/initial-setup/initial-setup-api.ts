import { api } from '../service';
import { yearType, boardType, organizationType } from '../tagTypes';

import type { SetupAction, InitialSetup } from './types';

export const initialSetupApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getInitialSetup: builder.query<InitialSetup, void>({
      query: () => '/institute-setup/initial',
    }),
    saveInitialSetup: builder.mutation<
      InitialSetup,
      { action: SetupAction; input: Record<string, unknown> }
    >({
      query: ({ action, input }) => ({
        url: `/institute-setup/initial/${action}`,
        method: action === 'users' ? 'POST' : 'PUT',
        body: input,
      }),
      invalidatesTags: (result, error, { action }) => {
        if (error) return [];
        if (action === 'academic-year') return [yearType.year];
        if (action === 'structure')
          return [boardType.board, organizationType.academicOrganizationOptions];
        return [];
      },
    }),
  }),
});
export const { useGetInitialSetupQuery, useLazyGetInitialSetupQuery, useSaveInitialSetupMutation } =
  initialSetupApi;
