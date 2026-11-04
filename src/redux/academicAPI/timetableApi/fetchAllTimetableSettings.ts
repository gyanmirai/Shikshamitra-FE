import type { FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';

type SettingsResult = {
  data?: unknown;
  error?: FetchBaseQueryError;
};
type SettingsBaseQuery = (args: FetchArgs) => SettingsResult | PromiseLike<SettingsResult>;

export async function fetchAllTimetableSettings(
  baseQuery: SettingsBaseQuery,
  url: string,
  academicMediumId: string
) {
  const items: unknown[] = [];
  let totalCount = 0;
  do {
    // eslint-disable-next-line no-await-in-loop -- The next offset depends on the number of rows returned.
    const result = await baseQuery({
      url,
      method: 'GET',
      params: { AcademicMediumId: academicMediumId, SkipCount: items.length, MaxResultCount: 1000 },
    });
    if (result.error) return { error: result.error };
    const page = result.data as { items?: unknown[]; totalCount?: number } | undefined;
    const { items: pageItems, totalCount: pageTotal } = page ?? {};
    if (
      !Array.isArray(pageItems) ||
      typeof pageTotal !== 'number' ||
      !Number.isSafeInteger(pageTotal) ||
      pageTotal < 0 ||
      (pageItems.length === 0 && items.length < pageTotal)
    ) {
      return {
        error: {
          status: 'CUSTOM_ERROR' as const,
          error: 'The timetable settings response is incomplete. Please retry.',
        },
      };
    }
    items.push(...pageItems);
    totalCount = pageTotal;
  } while (items.length < totalCount);
  return { data: { items, totalCount } };
}
