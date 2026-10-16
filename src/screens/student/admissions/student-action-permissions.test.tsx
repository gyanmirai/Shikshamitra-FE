import { it, vi, expect, describe } from 'vitest';
import { renderHook } from '@testing-library/react';

import { useEligibilityPermissions } from './eligibility/use-eligibility-permissions';
import { useDocumentPermissions } from './document-verification/use-document-permissions';

const auth = vi.hoisted(() => ({ permissions: [] as { name: string; isGranted: boolean }[] }));
vi.mock('react-redux', () => ({ useSelector: (select: any) => select({ auth }) }));

describe('Student sensitive action grants', () => {
  it.each(['Documents', 'Eligibility'])('allows %s writes only with current Add/Update permission', (feature) => {
    const hook = feature === 'Documents' ? useDocumentPermissions : useEligibilityPermissions;
    auth.permissions = [{ name: `Students.Admissions.${feature}.View`, isGranted: true }];
    const result = renderHook(() => hook());
    expect(result.result.current.view).toBe(true);
    expect(Object.entries(result.result.current).filter(([name]) => !['view', 'download'].includes(name)).every(([, allowed]) => !allowed)).toBe(true);

    auth.permissions.push({ name: `Students.Admissions.${feature}.Add`, isGranted: true });
    result.rerender();
    expect(Object.values(result.result.current).every(Boolean)).toBe(true);

    auth.permissions = [
      { name: `Students.Admissions.${feature}.View`, isGranted: true },
      { name: `Students.Admissions.${feature}.Add`, isGranted: false },
      { name: `Students.Admissions.${feature}.Delete`, isGranted: true },
    ];
    result.rerender();
    expect(Object.entries(result.result.current).filter(([name]) => !['view', 'download'].includes(name)).every(([, allowed]) => !allowed)).toBe(true);
  });
});
