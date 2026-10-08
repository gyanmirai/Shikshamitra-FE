import { it, vi, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import { useSalaryEditorPrefetch } from './use-salary-editor-prefetch';

const mocks = vi.hoisted(() => ({
  manage: true,
  activate: true,
  employee: vi.fn(),
  templates: vi.fn(),
  pf: vi.fn(),
  revisions: vi.fn(),
  readiness: vi.fn(),
}));
vi.mock('react-redux', () => ({ useSelector: () => [] }));
vi.mock('src/utils/permissions', () => ({
  hasGrantedPermission: (_: unknown, name: string) =>
    name.endsWith('.Manage') ? mocks.manage : mocks.activate,
}));
vi.mock('src/redux/hr/employeeApi', () => ({ employeeApi: { usePrefetch: () => mocks.employee } }));
vi.mock('src/redux/PF/PFApi', () => ({ pfApi: { usePrefetch: () => mocks.pf } }));
vi.mock('src/redux/hr/salary-template-api', () => ({
  salaryTemplateApi: { usePrefetch: () => mocks.templates },
}));
vi.mock('src/redux/hr/compensation-revision-api', () => ({
  compensationRevisionApi: {
    usePrefetch: (name: string) =>
      name === 'getCompensationRevisions' ? mocks.revisions : mocks.readiness,
  },
}));
beforeEach(() => {
  vi.clearAllMocks();
  mocks.manage = true;
  mocks.activate = true;
});
it('starts independent editor reads together on intent', () => {
  const { result } = renderHook(() => useSalaryEditorPrefetch('staff-1'));
  expect(mocks.employee).not.toHaveBeenCalled();
  act(() => result.current());
  expect(mocks.employee).toHaveBeenCalledWith('staff-1');
  expect(mocks.revisions).toHaveBeenCalledWith('staff-1');
  expect(mocks.templates).toHaveBeenCalledWith(undefined);
  expect(mocks.pf).toHaveBeenCalledWith({});
  expect(mocks.readiness).toHaveBeenCalledWith('staff-1');
});
it('does not preload without salary management permission or a staff ID', () => {
  mocks.manage = false;
  const { result, rerender } = renderHook(({ id }) => useSalaryEditorPrefetch(id), {
    initialProps: { id: 'staff-1' },
  });
  act(() => result.current());
  mocks.manage = true;
  rerender({ id: '' });
  act(() => result.current());
  [mocks.employee, mocks.revisions, mocks.templates, mocks.pf, mocks.readiness].forEach((mock) =>
    expect(mock).not.toHaveBeenCalled()
  );
});
it('uses the new staff ID and does not preload activation without employee edit permission', () => {
  mocks.activate = false;
  const { result, rerender } = renderHook(({ id }) => useSalaryEditorPrefetch(id), {
    initialProps: { id: 'staff-1' },
  });
  rerender({ id: 'staff-2' });
  act(() => result.current());
  expect(mocks.employee).toHaveBeenCalledWith('staff-2');
  expect(mocks.revisions).toHaveBeenCalledWith('staff-2');
  expect(mocks.readiness).not.toHaveBeenCalled();
});
