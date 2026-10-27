import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { Provider } from 'react-redux';
import { addIcon } from '@iconify/react';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';
import { defaultSettings } from 'src/components/settings/config-settings';
import { act, render, screen, waitFor, cleanup, fireEvent } from '@testing-library/react';

import AdmissionFormsScreen from './admission-forms';

const mocks = vi.hoisted(() => ({
  view: 'inquiry',
  query: vi.fn(),
  create: vi.fn(),
  preview: vi.fn(),
  canManage: true,
  result: {
    currentData: undefined as { items: AdmissionForm[]; totalCount: number } | undefined,
    data: undefined as { items: AdmissionForm[]; totalCount: number } | undefined,
    isLoading: false,
    isFetching: false,
    isError: false,
    refetch: vi.fn(),
  },
  errorToast: vi.fn(),
  dismissToast: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(`view=${mocks.view}`),
  usePathname: () => '/student/admissions/settings/forms',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}));
vi.mock('src/redux/student/admissions/admission-forms-api', () => ({
  useGetAdmissionFormsQuery: (args: unknown, options?: unknown) => {
    mocks.query(args, options);
    return mocks.result;
  },
}));
vi.mock('./form-list/use-form-list-actions', () => ({
  useFormListActions: () => ({
    dialog: { value: false },
    canManage: mocks.canManage,
    canPublish: mocks.canManage,
    canDelete: mocks.canManage,
    create: mocks.create,
    preview: mocks.preview,
    ...Object.fromEntries(
      [
        'edit',
        'requestClone',
        'validate',
        'requestPublish',
        'showHistory',
        'createVersion',
        'archive',
        'requestDelete',
        'close',
        'clearPendingClone',
        'confirmClone',
        'clearPendingPublish',
        'editPendingPublish',
        'confirmPublish',
        'closeHistory',
        'clearPendingDelete',
        'confirmDelete',
      ].map((name) => [name, vi.fn()])
    ),
  }),
}));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { error: mocks.errorToast, dismiss: mocks.dismissToast },
}));
vi.mock('./admission-form-dialog', () => ({ AdmissionFormDialog: () => null }));
vi.mock('./admission-form-clone-dialog', () => ({ AdmissionFormCloneDialog: () => null }));
vi.mock('./admission-form-publish-dialog', () => ({ AdmissionFormPublishDialog: () => null }));
vi.mock('./admission-form-history-dialog', () => ({ AdmissionFormHistoryDialog: () => null }));

[
  'mdi:plus',
  'lucide:info',
  'mdi:account-question-outline',
  'mdi:file-document-edit-outline',
  'fluent:filter-12-filled',
  'solar:magnifer-linear',
  'mingcute:close-line',
  'solar:pen-bold',
  'solar:trash-bin-trash-bold',
  'mdi:publish',
  'eva:more-vertical-fill',
  'solar:menu-dots-bold',
  'mdi:history',
  'mdi:content-copy',
  'mdi:check-decagram-outline',
  'eva:arrow-back-fill',
  'solar:export-bold',
  'solar:maximize-square-3-outline',
  'solar:eye-bold',
].forEach((name) => addIcon(name, { body: '<path d="M0 0h16v16H0z"/>', width: 16, height: 16 }));

const form: AdmissionForm = {
  id: 'form-1',
  name: 'Fresh inquiry',
  code: 'INQ',
  version: 2,
  sectionCount: 3,
  purpose: 0,
  status: 0,
  layoutType: 0,
  sections: [],
};
const theme = createTheme(defaultSettings);
const renderScreen = () => {
  const store = configureStore({
    reducer: () => ({
      globalState: {},
      auth: { permissions: [] },
      confirmPopup: { isChanges: false },
    }),
  });
  return render(<AdmissionFormsScreen />, {
    wrapper: ({ children }) => (
      <Provider store={store}>
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
      </Provider>
    ),
  });
};

describe('Admission forms list workspace', () => {
  afterEach(async () => {
    cleanup();
    // StudentFeedback releases shared toast deduplication after unmount.
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  });
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.view = 'inquiry';
    mocks.canManage = true;
    Object.assign(mocks.result, {
      data: { items: [form], totalCount: 26 },
      currentData: { items: [form], totalCount: 26 },
      isLoading: false,
      isFetching: false,
      isError: false,
    });
  });

  it.each([
    { view: 'inquiry', purpose: 0, title: 'Inquiry forms' },
    { view: 'registration', purpose: 1, title: 'Registration forms' },
  ])('keeps the $view tab, permissions and create purpose', ({ view, purpose, title }) => {
    mocks.view = view;
    renderScreen();
    expect(screen.getByRole('heading', { name: 'Admission forms' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: title })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('table', { name: `${title} table` })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Add form' }));
    expect(mocks.create).toHaveBeenCalledWith(purpose);
    expect(mocks.query).toHaveBeenLastCalledWith(
      expect.objectContaining({ purpose }),
      expect.anything()
    );
    expect(screen.queryByRole('button', { name: 'Filter Purpose' })).not.toBeInTheDocument();
    ['Form', 'Version', 'Sections', 'Status'].forEach((heading) =>
      expect(screen.getByRole('button', { name: `Filter ${heading}` })).toBeInTheDocument()
    );
  });

  it('keeps safe current rows while refreshing the same query', () => {
    mocks.result.isFetching = true;
    renderScreen();
    expect(screen.getByText('Fresh inquiry')).toBeInTheDocument();
    expect(
      screen.getByRole('progressbar', { name: 'Refreshing Inquiry forms' })
    ).toBeInTheDocument();
    expect(document.querySelector('.MuiSkeleton-root')).not.toBeInTheDocument();
  });

  it('uses table skeletons for a new scope instead of exposing data from the previous query', () => {
    mocks.result.currentData = undefined;
    mocks.result.isFetching = true;
    renderScreen();
    expect(screen.queryByText('Fresh inquiry')).not.toBeInTheDocument();
    expect(document.querySelector('.MuiSkeleton-root')).toBeInTheDocument();
    expect(screen.queryByText(/No inquiry forms/)).not.toBeInTheDocument();
  });

  it('does not show successful empty data after an API failure', async () => {
    Object.assign(mocks.result, { data: undefined, currentData: undefined, isError: true });
    renderScreen();
    await waitFor(() =>
      expect(mocks.errorToast).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Unable to load this enrollment data.' })
      )
    );
    expect(
      screen.queryByText('No inquiry forms configured yet. Create a draft to begin.')
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /retry|reload/i })).not.toBeInTheDocument();
  });

  it('keeps safe rows after a same-query refresh fails and announces the error once', async () => {
    mocks.result.isError = true;
    renderScreen();
    await waitFor(() => expect(mocks.errorToast).toHaveBeenCalledTimes(1));
    expect(screen.getByText('Fresh inquiry')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /retry|reload/i })).not.toBeInTheDocument();
  });

  it('applies and clears a numeric filter within the current tab', async () => {
    renderScreen();
    fireEvent.click(screen.getByRole('button', { name: 'Go to next page' }));
    fireEvent.click(screen.getByRole('button', { name: 'Filter Sections' }));
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Filter Type *' }));
    fireEvent.click(await screen.findByRole('option', { name: 'Equals' }));
    fireEvent.change(await screen.findByRole('spinbutton', { name: 'Sections *' }), {
      target: { value: '0' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
    await waitFor(() =>
      expect(mocks.query).toHaveBeenLastCalledWith(
        expect.objectContaining({
          purpose: 0,
          skipCount: 0,
          columnFilters:
            '[{"column":"sectionCount","type":"equals","value":0,"valueType":"number"}]',
        }),
        expect.anything()
      )
    );
    fireEvent.click(screen.getByRole('button', { name: 'Clear (1)' }));
    await waitFor(() =>
      expect(mocks.query).toHaveBeenLastCalledWith(
        expect.objectContaining({ purpose: 0, skipCount: 0 }),
        expect.anything()
      )
    );
    expect(mocks.query.mock.lastCall![0].columnFilters).toBeUndefined();
  });

  it('keeps viewing and utilities available when managing forms is not granted', () => {
    mocks.canManage = false;
    renderScreen();
    expect(screen.getByRole('button', { name: 'Add form' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Columns' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
    fireEvent.click(screen.getByText('Fresh inquiry'));
    expect(mocks.preview).toHaveBeenCalledWith('form-1');
  });

  it('resets criteria on tab change without requesting the new purpose with old criteria', async () => {
    const rendered = renderScreen();
    fireEvent.click(screen.getByRole('button', { name: 'Filter Status' }));
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Status *' }));
    fireEvent.click(await screen.findByRole('option', { name: 'Published' }));
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
    await waitFor(() => expect(mocks.query.mock.lastCall![0].status).toBe(1));
    fireEvent.click(screen.getByRole('button', { name: 'Go to next page' }));
    mocks.query.mockClear();
    mocks.view = 'registration';
    rendered.rerender(<AdmissionFormsScreen />);

    await waitFor(() =>
      expect(mocks.query.mock.lastCall![0]).toMatchObject({
        purpose: 1,
        skipCount: 0,
        status: undefined,
      })
    );
    const activeRequests = mocks.query.mock.calls.filter(([, options]) => !options?.skip);
    expect(activeRequests.length).toBeGreaterThan(0);
    activeRequests.forEach(([args]) =>
      expect(args).toMatchObject({ purpose: 1, skipCount: 0, status: undefined })
    );
    expect(screen.queryByRole('button', { name: 'Clear (1)' })).not.toBeInTheDocument();
  });
});
