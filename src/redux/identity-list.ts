export type IdentityListQuery = {
  skipCount: number;
  maxResultCount: number;
  filter?: string;
  sorting: string;
};

export type IdentityPage<T> = { items: T[]; totalCount: number };
