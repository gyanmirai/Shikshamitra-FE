export type AccountSettingHistoryQuery = string | {
  id: string;
  skipCount?: number;
  maxResultCount?: number;
};

export function accountSettingHistoryRequest(resource: string, input: AccountSettingHistoryQuery) {
  const { id, skipCount = 0, maxResultCount = 50 } = typeof input === 'string' ? { id: input } : input;
  return { url: `/${resource}/${id}/versions`, method: 'GET', params: { skipCount, maxResultCount } };
}
