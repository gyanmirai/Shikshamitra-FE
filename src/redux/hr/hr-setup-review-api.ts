import { api } from 'src/redux/service';
import { employeeType } from 'src/redux/tagTypes';

export type HrSetupReviewSection = 'calendar' | 'attendance' | 'leave' | 'payroll' | 'sample';

export type HrSetupReview = {
  academicYearId: string;
  section: HrSetupReviewSection;
  configurationState: 'valid' | 'missing' | 'invalid' | 'no_staff' | 'deferred';
  reviewState: 'record_not_present' | 'reviewed' | 'stale';
  fingerprint: string;
  concurrencyStamp: string;
  canReview: boolean;
  starterInitialized: boolean;
  tenantStarterEnabled: boolean;
  reviewedBy?: string | null;
  reviewedByName?: string | null;
  reviewedAt?: string | null;
  details: string[];
  notices: string[];
  employeeId?: string | null;
  date?: string | null;
};

export type HrSetupReviewArgs = {
  academicYearId: string;
  section: HrSetupReviewSection;
  employeeId?: string | null;
  date?: string | null;
  newSample?: boolean;
};

// Reuse owning mutation tags so policy edits visibly stale review evidence on the next read.
const tags = [employeeType.attendanceRule, employeeType.employeeLeavePolicy, employeeType.employee];
export const hrSetupReviewPath = ({ academicYearId, section }: HrSetupReviewArgs) =>
  `/hr/setup-review/${encodeURIComponent(academicYearId)}/${section}`;

export const hrSetupReviewApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getHrSetupReview: builder.query<HrSetupReview, HrSetupReviewArgs>({
      query: (args) => ({
        url: hrSetupReviewPath(args),
        params: {
          employeeId: args.employeeId || undefined,
          date: args.date || undefined,
          newSample: args.newSample || undefined,
        },
      }),
      providesTags: tags,
    }),
    recordHrSetupReview: builder.mutation<
      HrSetupReview,
      HrSetupReviewArgs & { fingerprint: string; concurrencyStamp: string }
    >({
      query: ({ fingerprint, concurrencyStamp, employeeId, date, ...args }) => ({
        url: hrSetupReviewPath(args),
        method: 'POST',
        body: { fingerprint, concurrencyStamp, employeeId, date },
      }),
      invalidatesTags: tags,
    }),
  }),
});

export const { useGetHrSetupReviewQuery, useRecordHrSetupReviewMutation } = hrSetupReviewApi;
