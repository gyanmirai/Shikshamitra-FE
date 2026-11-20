import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { render, screen, fireEvent } from '@testing-library/react';

import ViewShelfData from './ViewShelfForm';
import {
  catalogueTestStore,
  catalogueTestWrapper,
} from '../../catalogue-configuration/catalogue-test-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
beforeEach(clearCachedAuthSession);
const section = {
  id: 'section-id',
  sectionName: 'Reading Room',
  numberOfShelf: 2,
  shelfNames: [],
  shelfItems: [],
};
const mount = (permissions = ['Library.Settings.SectionManagement.View']) =>
  render(<ViewShelfData sectionData={section} />, {
    wrapper: catalogueTestWrapper(catalogueTestStore(permissions)),
  });
it('shows actual saved shelf names without fabricating book counts or physical rows', async () => {
  mswServer.use(
    http.get('http://library.test/api/library/sections/section-id', () =>
      HttpResponse.json({
        id: section.id,
        sectionName: section.sectionName,
        numberOfShelf: 2,
        shelfDetails: [
          { id: 'stable-shelf-a', shelfName: 'ગુજરાતી વાંચન' },
          { id: 'stable-shelf-b', shelfName: 'Picture Books' },
        ],
      })
    )
  );
  mount();
  expect(await screen.findByText('ગુજરાતી વાંચન')).toBeVisible();
  expect(screen.getByText('Picture Books')).toBeVisible();
  expect(screen.queryAllByText(/^Books \d+/)).toHaveLength(0);
  expect(screen.queryAllByText(/^Row \d+$/)).toHaveLength(0);
  expect(screen.getByText(/occupancy.*unavailable/i)).toBeVisible();
});
it('distinguishes a failed read from an empty section and offers a real retry', async () => {
  let reads = 0;
  mswServer.use(
    http.get('http://library.test/api/library/sections/section-id', () => {
      reads += 1;
      return reads === 1
        ? HttpResponse.json({ detail: 'Shelf details temporarily unavailable.' }, { status: 500 })
        : HttpResponse.json({ ...section, numberOfShelf: 0, shelfDetails: [] });
    })
  );
  mount();
  expect(await screen.findByText('Shelf details temporarily unavailable.')).toBeVisible();
  expect(screen.queryByText(/no shelves/i)).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /Retry/ }));
  expect(await screen.findByText(/no shelves.*configured/i)).toBeVisible();
  expect(reads).toBe(2);
});

it('assigns the saved section using the selected campus identity and the current year', async () => {
  let campusId: string | null = null;
  mswServer.use(
    http.get('http://library.test/api/library/sections/section-id', () =>
      HttpResponse.json({
        ...section,
        campusId,
        campusName: campusId ? 'North Campus' : null,
        shelfDetails: [{ id: 'existing-shelf', shelfName: 'Reading Shelf' }],
      })
    ),
    http.get('http://library.test/api/library/sections/campus-options', ({ request }) => {
      expect(new URL(request.url).searchParams.get('academicYearId')).toBeTruthy();
      return HttpResponse.json([{ id: 'north-id', name: 'North Campus', code: 'NORTH' }]);
    }),
    http.put('http://library.test/api/library/sections/section-id/campus', async ({ request }) => {
      expect(new URL(request.url).searchParams.get('academicYearId')).toBeTruthy();
      expect(await request.json()).toEqual({ campusId: 'north-id' });
      campusId = 'north-id';
      return HttpResponse.json({ campusId, campusName: 'North Campus' });
    })
  );
  mount(['Library.Settings.SectionManagement.View', 'Library.Settings.SectionManagement.Add']);
  fireEvent.click(await screen.findByRole('button', { name: 'Assign campus' }));
  fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Campus' }));
  fireEvent.click(await screen.findByRole('option', { name: 'North Campus (NORTH)' }));
  fireEvent.click(screen.getByRole('button', { name: 'Confirm campus' }));
  expect(await screen.findByText('North Campus')).toBeVisible();
  expect(screen.getByText('Reading Shelf')).toBeVisible();
  expect(screen.queryByRole('button', { name: 'Assign campus' })).not.toBeInTheDocument();
});

it('shows an unassigned section to a View-only user without offering a binding', async () => {
  mswServer.use(
    http.get('http://library.test/api/library/sections/section-id', () =>
      HttpResponse.json({ ...section, campusId: null, campusName: null, shelfDetails: [] })
    )
  );
  mount();
  expect(await screen.findByText('Unassigned')).toBeVisible();
  expect(screen.queryByRole('button', { name: 'Assign campus' })).not.toBeInTheDocument();
});
