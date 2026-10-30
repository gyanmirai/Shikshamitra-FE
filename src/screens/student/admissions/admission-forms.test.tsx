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
  criteria: '',
  query: vi.fn(),
  create: vi.fn(),
  preview: vi.fn(),
  canManage: true,
  editingId: null as string | null,
  editing: undefined as AdmissionForm | undefined,
  dialogProps: vi.fn(),
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
  useSearchParams: () => new URLSearchParams(`view=${mocks.view}&${mocks.criteria}`),
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
    editingId: mocks.editingId,
    editing: mocks.editing,
    creatingPurpose: 0,
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
vi.mock('./admission-form-dialog', () => ({
  AdmissionFormDialog: (props: unknown) => {
    mocks.dialogProps(props);
    return null;
  },
}));
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
const registrationForm: AdmissionForm = {
  ...form,
  id: 'form-2',
  name: 'Fresh registration',
  code: 'REG',
  purpose: 1,
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
    mocks.criteria = '';
    mocks.canManage = true;
    mocks.editingId = null;
    mocks.editing = undefined;
    Object.assign(mocks.result, {
      data: { items: [form], totalCount: 26 },
      currentData: { items: [form], totalCount: 26 },
      isLoading: false,
      isFetching: false,
      isError: false,
    });
  });

  it.each(['inquiry', 'registration', 'invalid'])(
    'shows both form types without tabs for legacy view=%s and starts Inquiry',
    (view) => {
      mocks.view = view;
      mocks.result.currentData = { items: [form, registrationForm], totalCount: 2 };
      renderScreen();
      expect(screen.getByRole('heading', { name: 'Admission forms' })).toBeInTheDocument();
      expect(screen.queryByRole('tab')).not.toBeInTheDocument();
      expect(screen.getByRole('table', { name: 'Admission forms table' })).toBeInTheDocument();
      expect(screen.getByText('Fresh inquiry')).toBeInTheDocument();
      expect(screen.getByText('Fresh registration')).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Form type' })).toBeInTheDocument();
      expect(screen.getByRole('cell', { name: 'Inquiry' })).toBeInTheDocument();
      expect(screen.getByRole('cell', { name: 'Registration' })).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Add form' }));
      expect(mocks.create).toHaveBeenCalledWith(0);
      expect(mocks.query.mock.lastCall![0]).not.toHaveProperty('purpose');
      expect(screen.queryByRole('button', { name: 'Filter Purpose' })).not.toBeInTheDocument();
      ['Form', 'Version', 'Sections', 'Status'].forEach((heading) =>
        expect(screen.getByRole('button', { name: `Filter ${heading}` })).toBeInTheDocument()
      );
    }
  );

  it.each(['inquiry', 'registration'])(
    'restores %s list position and criteria after closing preview',
    async (view) => {
      mocks.view = view;
      const params = new URLSearchParams({
        page: '2',
        size: '25',
        search: 'Fresh',
        columns: JSON.stringify([
          { column: 'status', type: 'equals', value: 1, valueType: 'enum', label: 'Status' },
        ]),
      });
      mocks.criteria = params.toString();
      renderScreen();
      await waitFor(() =>
        expect(mocks.query).toHaveBeenLastCalledWith(
          expect.objectContaining({
            search: 'Fresh',
            skipCount: 25,
            maxResultCount: 25,
            status: 1,
          }),
          undefined
        )
      );
      expect(screen.getByPlaceholderText('Search...')).toHaveValue('Fresh');
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 600));
      });
      expect(mocks.query.mock.lastCall![0]).toMatchObject({ skipCount: 25 });
      fireEvent.click(screen.getByText('Fresh inquiry'));
      const destination = new URL(mocks.preview.mock.lastCall![1], 'https://school.test');
      expect(mocks.query.mock.lastCall![0]).not.toHaveProperty('purpose');
      expect(destination.searchParams.get('view')).toBeNull();
      expect(destination.searchParams.get('page')).toBe('2');
      expect(destination.searchParams.get('search')).toBe('Fresh');
      expect(destination.searchParams.get('columns')).toBe(params.get('columns'));
    }
  );

  it('keeps safe current rows while refreshing the same query', () => {
    mocks.result.isFetching = true;
    renderScreen();
    expect(screen.getByText('Fresh inquiry')).toBeInTheDocument();
    expect(
      screen.getByRole('progressbar', { name: 'Refreshing Admission forms' })
    ).toBeInTheDocument();
    expect(document.querySelector('.MuiSkeleton-root')).not.toBeInTheDocument();
  });

  it('uses table skeletons for a new scope instead of exposing data from the previous query', () => {
    mocks.result.currentData = undefined;
    mocks.result.isFetching = true;
    renderScreen();
    expect(screen.queryByText('Fresh inquiry')).not.toBeInTheDocument();
    expect(document.querySelector('.MuiSkeleton-root')).toBeInTheDocument();
    expect(screen.queryByText(/No admission forms/)).not.toBeInTheDocument();
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
      screen.queryByText('No admission forms configured yet. Create a draft to begin.')
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

  it('applies and clears a numeric filter across both form types', async () => {
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
          skipCount: 0,
          columnFilters:
            '[{"column":"sectionCount","type":"equals","value":0,"valueType":"number"}]',
        }),
        undefined
      )
    );
    fireEvent.click(screen.getByRole('button', { name: 'Clear (1)' }));
    await waitFor(() =>
      expect(mocks.query).toHaveBeenLastCalledWith(
        expect.objectContaining({ skipCount: 0 }),
        undefined
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
    expect(mocks.preview).toHaveBeenCalledWith('form-1', '/student/admissions/settings/forms');
  });

  it('keeps search, paging and filters when a legacy view parameter changes', async () => {
    mocks.criteria = 'search=Fresh';
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
        skipCount: 10,
        search: 'Fresh',
        status: 1,
      })
    );
    const activeRequests = mocks.query.mock.calls.filter(([, options]) => !options?.skip);
    expect(activeRequests.length).toBeGreaterThan(0);
    activeRequests.forEach(([args]) => {
      expect(args).toMatchObject({ search: 'Fresh', skipCount: 10, status: 1 });
      expect(args).not.toHaveProperty('purpose');
    });
    expect(screen.getByRole('button', { name: 'Clear (1)' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search...')).toHaveValue('Fresh');
  });

  it('searches both form types on the server and resets pagination', async () => {
    mocks.criteria = 'page=2';
    renderScreen();
    fireEvent.change(screen.getByPlaceholderText('Search...'), {
      target: { value: '  Fresh  ' },
    });
    await waitFor(() => {
      expect(mocks.query.mock.lastCall![0]).toMatchObject({ search: 'Fresh', skipCount: 0 });
      expect(mocks.query.mock.lastCall![0]).not.toHaveProperty('purpose');
    });
  });

  it('keeps a Registration edit in its actual context while details load', () => {
    mocks.result.currentData = { items: [registrationForm], totalCount: 1 };
    mocks.editingId = registrationForm.id;
    renderScreen();
    expect(mocks.dialogProps.mock.lastCall![0].initialPurpose).toBe(1);
  });
});
