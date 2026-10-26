import { describe, expect, it, vi } from 'vitest';
import './shift-management-api';

const captured = vi.hoisted(() => ({ endpoints: {} as any }));
vi.mock('src/redux/service', () => ({
  api: {
    injectEndpoints: ({ endpoints }: any) => {
      captured.endpoints = endpoints({
        query: (definition: any) => definition,
        mutation: (definition: any) => definition,
      });
      return {};
    },
  },
}));

describe('staff shift list request contract', () => {
  it('forwards pagination and global sorting instead of repeatedly loading the first page', () => {
    expect(
      captured.endpoints.getShifts.query({
        skipCount: 40,
        maxResultCount: 20,
        sorting: 'startTime desc, id asc',
      })
    ).toEqual({
      url: '/app/shift-management',
      params: { skipCount: 40, maxResultCount: 20, sorting: 'startTime desc, id asc' },
    });
  });
  it('preserves existing selector calls without query arguments', () => {
    expect(captured.endpoints.getShifts.query()).toEqual({
      url: '/app/shift-management',
      params: undefined,
    });
  });
});
