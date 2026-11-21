import type { ReactNode, ComponentType } from 'react';

import { it, vi, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  catalogueTestStore,
  catalogueTestWrapper,
} from 'src/screens/library/settings/catalogue-configuration/catalogue-test-fixture';

import SettingsLayout from '../app/(auth-route)/library/settings/layout';
import CalendarLayout from '../app/(auth-route)/library/settings/calendar/layout';
import ChargeLayout from '../app/(auth-route)/library/settings/charge-type/layout';
import HoursLayout from '../app/(auth-route)/library/settings/library-timing/layout';
import CategoryLayout from '../app/(auth-route)/library/settings/book-category/layout';
import SectionLayout from '../app/(auth-route)/library/settings/sectionManagement/layout';
import PolicyLayout from '../app/(auth-route)/library/settings/borrowing-and-return-rules/layout';

vi.mock('src/sections/error', () => ({ View403: () => <p>Access denied</p> }));

const routes: [string, ComponentType<{ children: ReactNode }>][] = [
  ['Library.Settings.LibraryHours.View', HoursLayout],
  ['Library.Settings.BookCategories.View', CategoryLayout],
  ['Library.Settings.BorrowingRules.View', PolicyLayout],
  ['Library.Settings.BorrowingRules.View', CalendarLayout],
  ['Library.Settings.ChargesCategories.View', ChargeLayout],
  ['Library.Settings.SectionManagement.View', SectionLayout],
];

it.each(routes)(
  'allows the backed child through its exact %s without aggregate settings access',
  (grant, Child) => {
    render(
      <SettingsLayout>
        <Child>
          <p>Owned settings</p>
        </Child>
      </SettingsLayout>,
      { wrapper: catalogueTestWrapper(catalogueTestStore([grant])) }
    );
    expect(screen.getByText('Owned settings')).toBeVisible();
  }
);

it.each(routes)('keeps the child guard when only aggregate access replaces %s', (_grant, Child) => {
  render(
    <SettingsLayout>
      <Child>
        <p>Owned settings</p>
      </Child>
    </SettingsLayout>,
    { wrapper: catalogueTestWrapper(catalogueTestStore(['Library', 'Library.Settings.View'])) }
  );
  expect(screen.queryByText('Owned settings')).not.toBeInTheDocument();
  expect(screen.getByText('Access denied')).toBeVisible();
});
