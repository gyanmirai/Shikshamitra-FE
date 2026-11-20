import { vi, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { render, screen, fireEvent } from '@testing-library/react';

import SectionManagementScreen from '../index';
import {
  catalogueTestStore,
  catalogueTestWrapper,
} from '../../catalogue-configuration/catalogue-test-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn(), error: vi.fn() },
}));
// Replace only the register's table presentation. The selected row comes from
// the real subscribed request; the parent, dialog, form and mutations stay real.
vi.mock('./SectionManagementTable', () => ({
  default: ({
    data,
    onEdit,
  }: {
    data?: { id: string; sectionName: string }[];
    onEdit: (row: { id: string; sectionName: string }) => void;
  }) => (
    <div>
      {data?.map((row) => (
        <button type="button" key={row.id} onClick={() => onEdit(row)}>
          Edit {row.sectionName}
        </button>
      ))}
    </div>
  ),
}));

export const sectionApiRoot = 'http://library.test/api/library/sections';
export const savedSection = {
  id: 'section-id',
  sectionName: 'Reading Room',
  numberOfShelf: 2,
  shelfDetails: [
    { id: 'shelf-a', shelfName: 'બાળ પુસ્તકો' },
    { id: 'shelf-b', shelfName: 'Référence' },
  ],
};
beforeEach(() => {
  clearCachedAuthSession();
  vi.clearAllMocks();
  mswServer.use(
    http.get(sectionApiRoot, () =>
      HttpResponse.json({
        items: [savedSection],
        totalCount: 1,
        currentPage: 1,
        pageSize: 10,
        totalPages: 1,
      })
    ),
    http.get(`${sectionApiRoot}/${savedSection.id}`, () => HttpResponse.json(savedSection))
  );
});
export function mountSectionScreen() {
  const store = catalogueTestStore([
    'Library.Settings.SectionManagement.View',
    'Library.Settings.SectionManagement.Add',
  ]);
  return {
    store,
    ...render(<SectionManagementScreen />, {
      wrapper: catalogueTestWrapper(store),
    }),
  };
}
export async function openSectionEditor(edit = false) {
  if (edit) fireEvent.click(await screen.findByRole('button', { name: 'Edit Reading Room' }));
  else fireEvent.click(screen.getByTestId('library-settings-section-add-button'));
  return screen.findByRole('dialog', {
    name: edit ? /Update Section|Edit Section/i : /Add Section/i,
  });
}
export function changeSectionName(value: string) {
  fireEvent.change(screen.getByRole('textbox', { name: /Section Name/i }), { target: { value } });
}
export function changeShelfCount(value: string) {
  const input =
    screen.queryByRole('spinbutton', { name: /Number.*Shel/i }) ??
    screen.getByRole('textbox', { name: /Number.*Shel/i });
  fireEvent.change(input, { target: { value } });
}
export function changeShelfName(index: number, value: string) {
  const label = `Shelf ${index + 1}`;
  const labeled = screen.queryByRole('textbox', { name: `${label} name` });
  if (labeled) fireEvent.change(labeled, { target: { value } });
  else {
    fireEvent.doubleClick(screen.getByText(label));
    const input = screen.getByDisplayValue(label);
    fireEvent.change(input, { target: { value } });
    fireEvent.blur(input);
  }
}
