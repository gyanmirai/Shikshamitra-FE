import { it, vi, expect, describe } from 'vitest';

// Evaluate the real endpoint declarations without unrelated browser/session dependencies.
import './employee-payroll-api';

const mocks = vi.hoisted(() => ({ definitions: {} as Record<string, any> }));
vi.mock('./employeeApi', () => ({
  employeeApi: {
    injectEndpoints: ({ endpoints }: any) => {
      mocks.definitions = endpoints({
        query: (definition: unknown) => definition,
        mutation: (definition: unknown) => definition,
      });
      return {};
    },
  },
}));
describe('payroll component option endpoint wiring', () => {
  it.each([
    ['getEarningComponentOptions', 'earning'],
    ['getDeductionComponentOptions', 'deduction'],
  ])('loads later pages for %s through the existing list API', async (endpoint, kind) => {
    const rows = Array.from({ length: 101 }, (_, index) => ({ id: `${kind}-${index + 1}` }));
    const baseQuery = vi.fn(async ({ params }: any) => ({
      data: {
        totalCount: rows.length,
        items: rows.slice((params.page - 1) * params.pageSize, params.page * params.pageSize),
      },
    }));
    const result = await mocks.definitions[endpoint].queryFn(
      { academicYearId: 'year' },
      { signal: new AbortController().signal },
      undefined,
      baseQuery
    );
    expect(result.data.items).toEqual(rows);
    expect(baseQuery).toHaveBeenCalledTimes(2);
    expect(baseQuery).toHaveBeenLastCalledWith({
      url: `/payroll/${kind}-components`,
      method: 'GET',
      params: { page: 2, pageSize: 100, academicYearId: 'year' },
    });
    expect(mocks.definitions[endpoint].providesTags).toHaveLength(1);
  });

  it('leaves ordinary record-table defaults and requested pagination unchanged', () => {
    expect(mocks.definitions.getEarningComponents.query({})).toMatchObject({
      params: { page: 1, pageSize: 20 },
    });
    expect(
      mocks.definitions.getDeductionComponents.query({ page: 3, pageSize: 10, search: 'Tax' })
    ).toMatchObject({ params: { page: 3, pageSize: 10, search: 'Tax' } });
  });
});
