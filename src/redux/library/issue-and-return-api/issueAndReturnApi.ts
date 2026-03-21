import { libraryModuleApi } from '../libraryModuleApi';

export const issueAndReturnApi = libraryModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getIssueReturnList: builder.query({
      query: (params) => ({
        url: '/library/issue-return',
        method: 'GET',
        params,
      }),
      providesTags: ['Books'],
    }),

    getBookDetailsByAccession: builder.query({
      query: ({ accessionNo }) => ({
        url: `/library/books/accession/${accessionNo}`,
        method: 'GET',
      }),
    }),

    issueBook: builder.mutation({
      query: ({ body }) => ({
        url: '/library/issues',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Books'],
    }),

    getReturnDetails: builder.query({
      query: ({ accessionNo, academicYearId }) => ({
        url: `/library/return/${accessionNo}`,
        method: 'GET',
        params: { academicYearId },
      }),
    }),

    returnBook: builder.mutation({
      query: ({ academicYearId, body }) => ({
        url: '/library/return',
        method: 'POST',
        params: { academicYearId },
        data: body,
      }),
      invalidatesTags: ['Books'],
    }),

    getMemberDetailsByAccession: builder.query({
      query: ({ accessionNo, ...params }) => ({
        url: `/library/issuedBook/accession/${accessionNo}/member`,
        method: 'GET',
        params,
      }),
    }),
  }),
});

export const {
  useGetIssueReturnListQuery,
  useGetBookDetailsByAccessionQuery,
  useIssueBookMutation,
  useGetReturnDetailsQuery,
  useReturnBookMutation,
  useGetMemberDetailsByAccessionQuery,
} = issueAndReturnApi;
