import { api } from 'src/redux/service';
import { allTagTypes, organizationType } from 'src/redux/tagTypes';

import type { UserScopeHierarchy } from './types';

export interface UserScopeHierarchyArgs {
  userId: string;
  academicYearId?: string;
  cacheTenantId?: string;
}

export const userScopeApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUserScopeHierarchy: builder.query<UserScopeHierarchy, UserScopeHierarchyArgs>({
      query: ({ userId, academicYearId }) => ({
        url: '/app/user-scope/user-scope-hierarchy',
        params: {
          userId,
          ...(academicYearId ? { academicYearId } : {}),
        },
      }),
      providesTags: [allTagTypes.userScope, organizationType.academicHierarchyOptions],
      keepUnusedDataFor: 0,
    }),
  }),
});

export const { useGetUserScopeHierarchyQuery } = userScopeApi;
