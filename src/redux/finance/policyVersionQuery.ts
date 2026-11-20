export type PolicyVersionQueryArgs =
  | string
  | {
      id: string;
      versionId?: string;
      skipCount?: number;
      maxResultCount?: number;
    };

export function policyVersionRequest(family: string, args: PolicyVersionQueryArgs) {
  const { id, ...params } = typeof args === 'string' ? { id: args } : args;
  return { url: `/finance/${family}-policies/${id}/versions`, method: 'GET', params };
}
