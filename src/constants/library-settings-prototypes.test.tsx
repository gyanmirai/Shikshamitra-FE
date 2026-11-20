import { it, vi, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  catalogueTestStore,
  catalogueTestWrapper,
} from 'src/screens/library/settings/catalogue-configuration/catalogue-test-fixture';

import ReportsLayout from '../app/(auth-route)/library/reports/layout';
import SecurityRoleLayout from '../app/(auth-route)/security/role/layout';
import CatalogueLayout from '../app/(auth-route)/library/book-list/layout';
import MembersLayout from '../app/(auth-route)/library/member-management/layout';
import PermissionPage from '../app/(auth-route)/library/settings/permission/page';
import BookConditionPage from '../app/(auth-route)/library/settings/book-condition/page';
import CurriculumPage from '../app/(auth-route)/library/settings/curriculumn-templates/page';
import MemberSettingsPage from '../app/(auth-route)/library/settings/membership-management/page';
import ReportsSettingsPage from '../app/(auth-route)/library/settings/report-configuration/page';

const route = vi.hoisted(() => ({
  redirect: vi.fn(() => {
    throw new Error('NEXT_REDIRECT');
  }),
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));
vi.mock('next/navigation', () => route);
vi.mock('src/sections/error', () => ({ View403: () => <p>Access denied</p> }));
vi.mock('src/screens/library/settings/BookCondition', () => ({
  default: () => <p>Old condition form</p>,
}));
vi.mock(
  'src/screens/library/settings/permission-setting/library-permission-setting-screen',
  () => ({
    default: () => <p>Old permission form</p>,
  })
);

it.each([
  { Page: BookConditionPage, target: '/library/book-list' },
  { Page: MemberSettingsPage, target: '/library/member-management' },
  { Page: ReportsSettingsPage, target: '/library/reports' },
  { Page: PermissionPage, target: '/security/role' },
])('retires a prototype through its real $target destination', ({ Page, target }) => {
  route.redirect.mockClear();
  expect(() => Page()).toThrow('NEXT_REDIRECT');
  expect(route.redirect).toHaveBeenCalledWith(target);
});

it('resolves the unbacked curriculum placeholder through the normal not-found boundary', () => {
  expect(() => CurriculumPage()).toThrow('NEXT_NOT_FOUND');
});

it.each([SecurityRoleLayout, CatalogueLayout, MembersLayout, ReportsLayout])(
  'keeps the destination exact View independent of a Library settings grant',
  (Layout) => {
    render(
      <Layout>
        <p>Protected destination</p>
      </Layout>,
      {
        wrapper: catalogueTestWrapper(catalogueTestStore(['Library.Settings.View'])),
      }
    );
    expect(screen.queryByText('Protected destination')).not.toBeInTheDocument();
    expect(screen.getByText('Access denied')).toBeVisible();
  }
);
