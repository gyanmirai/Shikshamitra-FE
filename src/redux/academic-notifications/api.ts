import { api } from '../service';

import type { PagedResultDto } from '../communication/communicationTypes';
import type {
  AcademicNotificationRule,
  SaveAcademicNotificationRule,
  AcademicNotificationCatalogue,
  AcademicNotificationRulesQuery,
  AcademicNotificationRuleListItem,
  AcademicNotificationCacheIdentity,
} from './types';

const root = '/academic/notifications';
const ruleTag = 'AcademicNotificationRule' as const;

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
  }),
});

export const {
  useAcademicNotificationCatalogueQuery,
  useAcademicNotificationRulesQuery,
  useSaveAcademicNotificationRuleMutation,
} = academicNotificationsApi;
