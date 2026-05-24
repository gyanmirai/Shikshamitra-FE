import { api } from 'src/redux/service';

export const userScopeApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUserScopeHierarchy: builder.query({
      query: ({ userId, academicYearId }: { userId: string; academicYearId?: string }) => ({
        url: '/app/user-scope/user-scope-hierarchy',
        params: {
          userId,
          ...(academicYearId ? { academicYearId } : {}),
        },
      }),
    }),
  }),
});

export const { useGetUserScopeHierarchyQuery } = userScopeApi;
