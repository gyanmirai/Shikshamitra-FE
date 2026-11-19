import type { QueryReturnValue, FetchBaseQueryMeta, FetchBaseQueryError } from '@reduxjs/toolkit/query';

import { api } from '../service';

import type { PagedResultDto } from '../communication/communicationTypes';
import type {
  AcademicNotificationRule,
  SaveAcademicNotificationRule,
  AcademicNotificationCatalogue,
  AcademicNotificationRulesQuery,
  AcademicNotificationRuleListItem,
  AcademicNotificationCacheIdentity,
  PublishedNotificationTemplateOption,
} from './types';

const root = '/academic/notifications';
const ruleTag = 'AcademicNotificationRule' as const;
const templatePageSize = 100;

function cacheOwner({ tenantCacheKey, userCacheKey }: AcademicNotificationCacheIdentity) {
  return `${tenantCacheKey}:${userCacheKey}`;
}

export const academicNotificationsApi = api.enhanceEndpoints({ addTagTypes: [ruleTag] }).injectEndpoints({
  endpoints: (builder) => ({
    academicNotificationCatalogue: builder.query<AcademicNotificationCatalogue, AcademicNotificationCacheIdentity>({
      query: (identity) => ({ url: `${root}/catalogue`, expectedSessionOwner: cacheOwner(identity) }),
    }),
    academicNotificationRules: builder.query<PagedResultDto<AcademicNotificationRuleListItem>, AcademicNotificationRulesQuery>({
      query: ({ scope, eventKey, skipCount, maxResultCount, ...identity }) => ({
        url: `${root}/rules`,
        expectedSessionOwner: cacheOwner(identity),
        params: {
          academicYearId: scope.academicYearId ?? undefined,
          boardId: scope.boardId ?? undefined,
          mediumId: scope.mediumId ?? undefined,
          classId: scope.classId ?? undefined,
          divisionId: scope.divisionId ?? undefined,
          eventKey,
          skipCount,
          maxResultCount,
        },
      }),
      providesTags: (_, __, identity) => [{ type: ruleTag, id: cacheOwner(identity) }],
    }),
    saveAcademicNotificationRule: builder.mutation<
      AcademicNotificationRule,
      AcademicNotificationCacheIdentity & { command: SaveAcademicNotificationRule }
    >({
      query: ({ command, ...identity }) => ({
        url: `${root}/rules/${encodeURIComponent(command.eventKey)}`,
        expectedSessionOwner: cacheOwner(identity),
        method: 'PUT',
        body: command,
      }),
      invalidatesTags: (result, _, identity) => result ? [{ type: ruleTag, id: cacheOwner(identity) }] : [],
    }),
    academicNotificationTemplateOptions: builder.query<
      PagedResultDto<PublishedNotificationTemplateOption>,
      AcademicNotificationCacheIdentity & { eventKey: string; academicMediumId?: string | null }
    >({
      queryFn: async ({ eventKey, academicMediumId, ...identity }, _, __, fetchWithBQ) => {
        async function readPage(
          collected: PublishedNotificationTemplateOption[]
        ): Promise<QueryReturnValue<PagedResultDto<PublishedNotificationTemplateOption>, FetchBaseQueryError, FetchBaseQueryMeta>> {
          const request = {
            url: `${root}/templates/options`,
            expectedSessionOwner: cacheOwner(identity),
            params: { eventKey, academicMediumId: academicMediumId ?? undefined, skipCount: collected.length, maxResultCount: templatePageSize },
          };
          const result = await fetchWithBQ(request);
          if (result.error) return { error: result.error };
          const page = result.data as PagedResultDto<PublishedNotificationTemplateOption>;
          const items = [...collected, ...page.items];
          if (page.items.length < templatePageSize || items.length >= page.totalCount) {
            return { data: { items, totalCount: page.totalCount } };
          }
          return readPage(items);
        }
        return readPage([]);
      },
    }),
  }),
});

export const {
  useAcademicNotificationCatalogueQuery,
  useAcademicNotificationRulesQuery,
  useSaveAcademicNotificationRuleMutation,
  useAcademicNotificationTemplateOptionsQuery,
} = academicNotificationsApi;
