/** Keep each policy family's catalogs separate; default changes refresh that year's choices. */
export const policyCacheTags = <T extends string>(type: T) => ({
  list: (result: any, _error: unknown, arg: { academicYearId: string }) => [
    { type, id: `year:${arg.academicYearId}` },
    ...(result?.items ?? []).map((item: any) => ({ type, id: item.id })),
  ],
  detail: (result: any, _error: unknown, arg: any) => {
    const year = result?.academicYearId ?? result?.items?.[0]?.academicYearId;
    return [
      { type, id: typeof arg === 'string' ? arg : arg.id },
      ...(year ? [{ type, id: `year:${year}` }] : []),
    ];
  },
  changed: (result: any, error: unknown, arg: any) => {
    if (error) return [];
    const year = result?.academicYearId ?? arg?.body?.academicYearId ?? arg?.academicYearId;
    const id = result?.id ?? (typeof arg === 'string' ? arg : arg?.id);
    // Legacy archive commands return no year. Refresh only their own family in that case.
    return year ? [{ type, id: `year:${year}` }, ...(id ? [{ type, id }] : [])] : [type];
  },
});
