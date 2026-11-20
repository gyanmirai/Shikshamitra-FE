import { it, vi, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  catalogueTestStore,
  catalogueTestWrapper,
} from 'src/screens/library/settings/catalogue-configuration/catalogue-test-fixture';

import CatalogueConfigurationLayout from '../app/(auth-route)/library/(catalogue-settings)/settings/catalogue-configuration/layout';

vi.mock('src/sections/error', () => ({ View403: () => <p>Access denied</p> }));

it('permits its exact View through the isolated layout without Settings/category/module aggregate grants', () => {
  render(
    <CatalogueConfigurationLayout>
      <p>Owned configuration</p>
    </CatalogueConfigurationLayout>,
    {
      wrapper: catalogueTestWrapper(
        catalogueTestStore(['Library.Settings.CatalogueConfiguration.View'])
      ),
    }
  );
  expect(screen.getByText('Owned configuration')).toBeVisible();
});

it('denies category/aggregate grants when the dedicated configuration View is missing', () => {
  render(
    <CatalogueConfigurationLayout>
      <p>Owned configuration</p>
    </CatalogueConfigurationLayout>,
    {
      wrapper: catalogueTestWrapper(
        catalogueTestStore([
          'Library',
          'Library.Settings.View',
          'Library.Settings.BookCategories.View',
        ])
      ),
    }
  );
  expect(screen.queryByText('Owned configuration')).not.toBeInTheDocument();
  expect(screen.getByText('Access denied')).toBeVisible();
});
