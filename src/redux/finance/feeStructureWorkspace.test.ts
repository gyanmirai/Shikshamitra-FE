import { it, vi, expect, describe } from 'vitest';

import './feeStructureWorkspace';

vi.mock('./financeFeeStructure', () => ({ financeFeeStructureApi: { util: {} } }));

const { endpoints } = vi.hoisted(() => ({ endpoints: {} as Record<string, any> }));
vi.mock('./financeModuleApi', () => ({
  financeModuleApi: {
    injectEndpoints: (config: any) => {
      Object.assign(
        endpoints,
        config.endpoints({ query: (value: any) => value, mutation: (value: any) => value })
      );
      return {};
    },
  },
}));

describe('Fee Structure workspace API', () => {
  it('loads copy sources only from the metadata-scoped classes and groups every saved structure', async () => {
    const baseQuery = vi.fn(async ({ params }) => ({
      data: { standardFeeStructures: [{ id: `${params.standardId}-structure`, name: 'Annual' }] },
    }));
    const result = await endpoints.getStructureCopySources.queryFn(
      {
        feeStructureMetadataId: 'current-medium',
        classes: [
          { id: 'one', name: 'Class 1' },
          { id: 'two', name: 'Class 2' },
        ],
      },
      {},
      {},
      baseQuery
    );
    expect(baseQuery.mock.calls.map(([args]) => args.params.standardId)).toEqual(['one', 'two']);
    expect(result.data).toEqual([
      {
        standardId: 'one',
        className: 'Class 1',
        structure: { id: 'one-structure', name: 'Annual' },
      },
      {
        standardId: 'two',
        className: 'Class 2',
        structure: { id: 'two-structure', name: 'Annual' },
      },
    ]);
  });
  it('reports failed class reads instead of displaying an incomplete source list', async () => {
    const error = { status: 403, data: 'Forbidden' };
    const result = await endpoints.getStructureCopySources.queryFn(
      { classes: [{ id: 'denied', name: 'Class 1' }] },
      {},
      {},
      async () => ({ error })
    );
    expect(result).toEqual({ error });
  });
  it('sends an idempotency key for create and only the changed fields for update', () => {
    const candidate = {
      name: 'Annual',
      concurrencyStamp: 'stamp',
      collectionPolicyVersionId: 'old-v1',
    };
    const create = endpoints.saveStructureDraft.query({
      feeStructureMetadataId: 'metadata',
      standardId: 'class',
      requestId: 'request',
      standardFeeStructures: candidate,
    });
    expect(create).toEqual({
      url: '/fee-structures',
      method: 'POST',
      params: { feeStructureMetadataId: 'metadata' },
      body: { standardId: 'class', requestId: 'request', standardFeeStructures: candidate },
    });
    expect(
      endpoints.saveStructureDraft.query({
        structureId: 'structure',
        requestId: 'patch-key',
        changes: { name: 'Updated' },
        standardFeeStructures: candidate,
      })
    ).toEqual({
      url: '/fee-structures/structure',
      method: 'PATCH',
      body: { requestId: 'patch-key', concurrencyStamp: 'stamp', changes: { name: 'Updated' } },
    });
  });
  it('requires stamped publication and revision commands and refreshes the owning class', () => {
    const args = { structureId: 'structure', standardId: 'class', concurrencyStamp: 'stamp' };
    expect(endpoints.publishStructure.query(args)).toEqual({
      url: '/fee-structures/structure/publish',
      method: 'POST',
      body: { concurrencyStamp: 'stamp' },
    });
    expect(endpoints.reviseStructure.query(args).url).toBe('/fee-structures/structure/revisions');
    expect(endpoints.publishStructure.invalidatesTags(null, null, args)).toContainEqual(
      expect.objectContaining({ id: 'class' })
    );
    expect(endpoints.previewStructure.invalidatesTags).toBeUndefined();
  });
});

it('loads only lightweight class context', () => {
  expect(endpoints.getStructureContext.query({ standardId: 'class' }).url).toBe(
    '/fee-structures/context'
  );
  expect(endpoints.getStructureSettings).toBeUndefined();
});

it('does not refetch settings or class lists for an existing draft patch', () => {
  expect(
    endpoints.saveStructureDraft.invalidatesTags({}, null, {
      structureId: 'saved',
      standardId: 'class',
    })
  ).toEqual([]);
});
