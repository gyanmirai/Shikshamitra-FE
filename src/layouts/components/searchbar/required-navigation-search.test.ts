import type { GrantedPermission } from 'src/utils/permissions';
import type { NavSectionProps } from 'src/components/nav-section';

import { it, expect } from 'vitest';

import { getAllItems } from './utils';

const searchableItems: (input: {
  data: NavSectionProps['data'];
  permissions?: GrantedPermission[];
}) => ReturnType<typeof getAllItems> = getAllItems;
const data = [
  {
    items: [
      { title: 'Legacy destination', path: '/legacy' },
      {
        title: 'Stock Receiving',
        path: '/library/receiving',
        permissionName: 'Library.Receiving.View',
        requiredAllPermissions: ['Library.Receiving.View', 'Library.AllBooks.View'],
      },
    ],
  },
];

it('hides receiving from search when a required exact permission is absent', () => {
  expect(
    searchableItems({
      data,
      permissions: [{ name: 'Library.Receiving.View', isGranted: true }],
    }).map((item) => item.path)
  ).toEqual(['/legacy']);
  expect(searchableItems({ data }).map((item) => item.path)).toEqual(['/legacy']);
});

it('shows receiving without Add when both read prerequisites exist and leaves legacy entries intact', () => {
  expect(
    searchableItems({
      data,
      permissions: ['Library.Receiving.View', 'Library.AllBooks.View'].map((name) => ({
        name,
        isGranted: true,
      })),
    }).map((item) => item.path)
  ).toEqual(['/legacy', '/library/receiving']);
});
