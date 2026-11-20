export type CatalogueRevisions = { metadataRevision: string; copiesRevision: string };
export type CatalogueMutationResult = CatalogueRevisions & { id: string; message?: string };

export function requireCatalogueRevision(value: unknown): asserts value is string {
  if (typeof value !== 'string' || value.length === 0)
    throw new Error(
      'The current book revision is unavailable. Reload the saved book before saving.'
    );
}

export function readCatalogueRevisions(value: unknown): CatalogueRevisions {
  const result = value as Partial<CatalogueRevisions> | null;
  const metadataRevision = result?.metadataRevision;
  const copiesRevision = result?.copiesRevision;
  requireCatalogueRevision(metadataRevision);
  requireCatalogueRevision(copiesRevision);
  return { metadataRevision, copiesRevision };
}
