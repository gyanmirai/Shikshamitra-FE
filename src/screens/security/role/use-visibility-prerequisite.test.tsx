import { it, vi, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import { useVisibilityPrerequisite } from './use-visibility-prerequisite';

import type { PermissionCatalogue } from './permission-catalogue';

const flag = 'ShikshaMitra.Module.HR';
const name = 'HR.Employee.View';
const catalogue: PermissionCatalogue = {
  groups: [
    {
      name: 'HR',
      displayName: 'HR',
      permissions: [name, flag].map((key) => ({
        name: key,
        displayName: key,
        isGranted: false,
        allowedProviders: [],
        grantedProviders: [],
      })),
    },
  ],
};
const modules = [
  { title: 'HR', permissionName: flag, children: [{ title: 'Staff', permissionName: name }] },
];

it('revalidates pending actions when the catalogue changes before confirmation', () => {
  const setStates = vi.fn();
  const { result, rerender } = renderHook(
    (current: PermissionCatalogue) =>
      useVisibilityPrerequisite({
        catalogue: current,
        modules,
        provider: { providerName: 'R', providerKey: 'HR Manager' },
        states: {},
        setStates,
        disabled: false,
      }),
    { initialProps: catalogue }
  );
  act(() => result.current.requestChange([name], 'allow'));
  expect(result.current.confirmation.open).toBe(true);
  rerender({
    groups: [
      {
        ...catalogue.groups[0],
        permissions: catalogue.groups[0].permissions.filter((entry) => entry.name !== name),
      },
    ],
  });
  expect(result.current.confirmation.disabled).toBe(true);
  act(() => result.current.confirmation.onConfirm());
  expect(setStates).not.toHaveBeenCalled();
});
