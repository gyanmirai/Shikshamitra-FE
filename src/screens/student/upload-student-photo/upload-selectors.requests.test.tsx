import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { StudentApi } from 'src/redux/student';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { classApi } from 'src/redux/class/classApi';
import { studentPermissions } from 'src/constants/student-menu';
import { studentType, organizationType } from 'src/redux/tagTypes';
import { vi, it, expect, describe, afterEach, beforeEach } from 'vitest';
import { act, render, screen, cleanup, waitFor, fireEvent } from '@testing-library/react';

import UploadStudentPhotoScreen from './index';
import UploadStudentDocumentsScreen from '../upload-student-documents';

const feedback = vi.hoisted(() => ({ error: vi.fn(), success: vi.fn() }));

// Real endpoint subscriptions and cache; authenticated transport uses synthetic data only.
vi.mock('src/redux/service', async () => {
  const { createApi, fetchBaseQuery } = await import('@reduxjs/toolkit/query/react');
  const { tagTypes } = await import('src/redux/tagTypes');
  return {
    api: createApi({
      reducerPath: 'uploadSelectorsTestApi',
      baseQuery: fetchBaseQuery({ baseUrl: 'http://upload-selectors.test/api' }),
      tagTypes,
      endpoints: () => ({}),
    }),
  };
});
vi.mock('src/components/toast', () => ({ shikshaMitraToast: feedback }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/custom-breadcrumbs', () => ({
  CustomBreadcrumbs: ({ heading }: { heading: string }) => <h1>{heading}</h1>,
}));
vi.mock('src/components/customDialog', () => ({
  default: ({ open, title, children }: any) =>
    open ? (
      <section role="dialog" aria-label={title}>
        {children}
      </section>
    ) : null,
}));
vi.mock('src/components/upload', () => ({
  Upload: ({ onDrop, disabled }: any) => (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onDrop([new File(['synthetic'], 'proof.pdf', { type: 'application/pdf' })])}
    >
      Choose synthetic file
    </button>
  ),
  UploadAvatar: () => null,
}));
vi.mock('src/components/customizabaleTable', () => ({
  default: ({ data, columns, onServerPagination, onServerSearch }: any) => (
    <div>
      {data.map((row: any) => (
        <div key={row.id}>
          {row.fullName}
          {columns.find((column: any) => column.id === 'action').render(undefined, row)}
        </div>
      ))}
      <button type="button" onClick={() => onServerPagination(2, 25)}>
        Next page
      </button>
      <button type="button" onClick={() => onServerSearch('Riya')}>
        Search Riya
      </button>
    </div>
  ),
}));

const classes = Array.from({ length: 12 }, (_, index) => ({
  id: `class-${index + 1}`,
  name: `Class ${index + 1}`,
  divisions: ['A', 'B'].map((name) => ({ id: `${index + 1}-${name}`, name })),
}));
const requests: { path: string; params: URLSearchParams }[] = [];
let store: ReturnType<typeof makeStore>;

function makeStore(permissions: string[] = []) {
  return configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
      auth: () => ({ permissions: permissions.map((name) => ({ name, isGranted: true })) }),
      globalState: () => ({ currentYear: { id: 'global-selected-year' } }),
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
  });
}

beforeEach(() => {
  requests.length = 0;
  feedback.error.mockReset();
  store = makeStore();
  mswServer.use(
    http.get('http://upload-selectors.test/api/app/standard/lookup', ({ request }) => {
      const url = new URL(request.url);
      requests.push({ path: url.pathname, params: url.searchParams });
      return HttpResponse.json({ items: classes });
    }),
    http.get('http://upload-selectors.test/api/app/standard', ({ request }) => {
      const url = new URL(request.url);
      requests.push({ path: url.pathname, params: url.searchParams });
      return HttpResponse.json({ totalCount: classes.length, items: classes.slice(0, 10) });
    }),
    http.get(
      'http://upload-selectors.test/api/students/records/list/:division',
      ({ request, params }) => {
        const url = new URL(request.url);
        requests.push({ path: url.pathname, params: url.searchParams });
        return HttpResponse.json({
          totalCount: 40,
          items: [
            {
              studentId: `student-${params.division}`,
              studentName: `Pupil ${params.division}`,
              status: 2,
            },
          ],
        });
      }
    ),
    http.get(
      'http://upload-selectors.test/api/student/enrollment/registrations/:id/documents/required-status',
      () => HttpResponse.json([])
    ),
    http.get(
      'http://upload-selectors.test/api/app/student-document/required-documents-status/:id',
      () => HttpResponse.json([])
    )
  );
});

afterEach(async () => {
  cleanup();
  await act(async () => {
    store.dispatch(api.util.resetApiState());
  });
});

async function choose(label: string, name: string) {
  fireEvent.mouseDown(screen.getByRole('combobox', { name: label }));
  fireEvent.click(await screen.findByRole('option', { name }));
}

describe.each([
  ['photos', UploadStudentPhotoScreen],
  ['documents', UploadStudentDocumentsScreen],
] as const)('%s upload selectors', (_kind, Screen) => {
  it('loads all scoped class options without a year filter and queries only the selected division', async () => {
    render(
      <Provider store={store}>
        <Screen />
      </Provider>
    );
    await waitFor(() => expect(requests).toHaveLength(1));
    expect(screen.getByRole('combobox', { name: 'Division' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    await choose('Class', 'Class 12');
    expect(requests.filter((request) => request.path.includes('/records/list/'))).toHaveLength(0);
    await choose('Division', 'B');
    expect(await screen.findByText('Pupil 12-B')).toBeVisible();
    expect(requests.map((request) => request.path)).toEqual([
      '/api/app/standard/lookup',
      '/api/students/records/list/12-B',
    ]);
    expect(Object.fromEntries(requests[0].params)).toEqual({});
    expect(Object.fromEntries(requests[1].params)).toEqual({
      skipCount: '0',
      maxResultCount: '10',
    });
    expect(
      screen.getByRole('button', { name: /Upload (photo|documents) for Pupil 12-B/ })
    ).toBeDisabled();
  });

  it('keeps server paging/search and hides previous-division rows during a new request', async () => {
    render(
      <Provider store={store}>
        <Screen />
      </Provider>
    );
    await choose('Class', 'Class 1');
    await choose('Division', 'A');
    await screen.findByText('Pupil 1-A');
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    await waitFor(() => expect(requests.at(-1)?.params.get('skipCount')).toBe('25'));
    fireEvent.click(screen.getByRole('button', { name: 'Search Riya' }));
    await waitFor(() => expect(requests.at(-1)?.params.get('searchTerm')).toBe('Riya'));
    expect(requests.at(-1)?.params.get('skipCount')).toBe('0');
    let finish!: () => void;
    const pending = new Promise<void>((resolve) => {
      finish = resolve;
    });
    mswServer.use(
      http.get('http://upload-selectors.test/api/students/records/list/2-A', async () => {
        await pending;
        return HttpResponse.json({ totalCount: 0, items: [] });
      })
    );
    try {
      await choose('Class', 'Class 2');
      expect(screen.queryByText('Pupil 1-A')).not.toBeInTheDocument();
      await choose('Division', 'A');
      expect(screen.queryByText('Pupil 1-A')).not.toBeInTheDocument();
    } finally {
      await act(async () => finish());
    }
  });

  it('does not query students when class options fail', async () => {
    mswServer.use(
      http.get('http://upload-selectors.test/api/app/standard/lookup', () =>
        HttpResponse.json({ error: { message: 'Synthetic lookup failure' } }, { status: 403 })
      )
    );
    render(
      <Provider store={store}>
        <Screen />
      </Provider>
    );
    await waitFor(() => expect(feedback.error).toHaveBeenCalled());
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Class' }));
    expect(await screen.findByRole('option', { name: 'No class available' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    expect(requests.filter((request) => request.path.includes('/records/list/'))).toHaveLength(0);
  });

  it('keeps a standard-only scope selectable without inventing child divisions', async () => {
    const scoped = { items: [{ ...classes[0], divisions: [] }] };
    mswServer.use(
      http.get('http://upload-selectors.test/api/app/standard/lookup', () =>
        HttpResponse.json(scoped)
      ),
      http.get('http://upload-selectors.test/api/app/standard', () => HttpResponse.json(scoped))
    );
    render(
      <Provider store={store}>
        <Screen />
      </Provider>
    );
    await choose('Class', 'Class 1');
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Division' }));
    expect(await screen.findByRole('option', { name: 'No division available' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    expect(requests.filter((request) => request.path.includes('/records/list/'))).toHaveLength(0);
  });

  it.each(['lookup', 'students'] as const)(
    'withdraws cached pupils after a denied same-argument %s refresh and keeps them hidden until recovery',
    async (source) => {
      render(
        <Provider store={store}>
          <Screen />
        </Provider>
      );
      await choose('Class', 'Class 1');
      await choose('Division', 'A');
      await screen.findByText('Pupil 1-A');
      const url =
        source === 'lookup'
          ? 'http://upload-selectors.test/api/app/standard/lookup'
          : 'http://upload-selectors.test/api/students/records/list/1-A';
      const args = { divisionId: '1-A', skipCount: 0, maxResultCount: 10, searchTerm: '' };
      mswServer.use(
        http.get(url, () =>
          HttpResponse.json({ error: { message: 'Current scope denied' } }, { status: 403 })
        )
      );
      await act(async () => {
        store.dispatch(
          api.util.invalidateTags([
            source === 'lookup' ? organizationType.academicHierarchyOptions : studentType.student,
          ])
        );
      });
      await waitFor(() => {
        const state =
          source === 'lookup'
            ? classApi.endpoints.getClassLookup.select()(store.getState())
            : StudentApi.endpoints.getStudentsByDivision.select(args)(store.getState());
        expect(state.isError).toBe(true);
      });
      // RTK retains successful data for the same arguments after a rejected refresh.
      expect(screen.queryByText('Pupil 1-A')).not.toBeInTheDocument();
      if (source === 'lookup')
        expect(screen.getByRole('combobox', { name: 'Division' })).toHaveAttribute(
          'aria-disabled',
          'true'
        );

      let finish!: () => void;
      const pending = new Promise<void>((resolve) => {
        finish = resolve;
      });
      mswServer.use(
        http.get(url, async () => {
          await pending;
          return HttpResponse.json(
            source === 'lookup'
              ? { items: classes }
              : {
                  totalCount: 1,
                  items: [{ studentId: 'student-1-A', studentName: 'Recovered pupil 1-A' }],
                }
          );
        })
      );
      let retry!: { unwrap: () => Promise<unknown> };
      await act(async () => {
        retry =
          source === 'lookup'
            ? store.dispatch(
                classApi.endpoints.getClassLookup.initiate(undefined, {
                  subscribe: false,
                  forceRefetch: true,
                })
              )
            : store.dispatch(
                StudentApi.endpoints.getStudentsByDivision.initiate(args, {
                  subscribe: false,
                  forceRefetch: true,
                })
              );
      });
      try {
        await waitFor(() => {
          const state =
            source === 'lookup'
              ? classApi.endpoints.getClassLookup.select()(store.getState())
              : StudentApi.endpoints.getStudentsByDivision.select(args)(store.getState());
          expect(state.isLoading).toBe(true);
        });
        expect(screen.queryByText('Pupil 1-A')).not.toBeInTheDocument();
      } finally {
        await act(async () => {
          finish();
          await retry.unwrap();
        });
      }
      expect(
        await screen.findByText(source === 'lookup' ? 'Pupil 1-A' : 'Recovered pupil 1-A')
      ).toBeVisible();
      expect(screen.getByRole('combobox', { name: 'Class' })).toHaveTextContent('Class 1');
      expect(screen.getByRole('combobox', { name: 'Division' })).toHaveTextContent('A');
    }
  );

  it.each(['division', 'class'])(
    'withdraws cached pupils when refreshed academic scope removes the selected %s',
    async (removed) => {
      render(
        <Provider store={store}>
          <Screen />
        </Provider>
      );
      await choose('Class', 'Class 1');
      await choose('Division', 'A');
      await screen.findByText('Pupil 1-A');
      mswServer.use(
        http.get('http://upload-selectors.test/api/app/standard/lookup', () =>
          HttpResponse.json({
            items:
              removed === 'class'
                ? [classes[1]]
                : [{ ...classes[0], divisions: [classes[0].divisions[1]] }],
          })
        )
      );
      await act(async () => {
        store.dispatch(api.util.invalidateTags([organizationType.academicHierarchyOptions]));
      });
      await waitFor(() => expect(screen.queryByText('Pupil 1-A')).not.toBeInTheDocument());
      expect(requests.filter((request) => request.path.includes('/records/list/'))).toHaveLength(1);
      if (removed === 'class')
        expect(screen.getByRole('combobox', { name: 'Division' })).toHaveAttribute(
          'aria-disabled',
          'true'
        );
    }
  );

  it.each(['lookup', 'students', 'scope'] as const)(
    'withdraws an open upload dialog after %s denies or removes its current student',
    async (source) => {
      store = makeStore([studentPermissions.records.manageStudent]);
      render(
        <Provider store={store}>
          <Screen />
        </Provider>
      );
      await choose('Class', 'Class 1');
      await choose('Division', 'A');
      await screen.findByText('Pupil 1-A');
      const action = screen.getByRole('button', { name: /Upload (photo|documents) for Pupil 1-A/ });
      expect(action).toBeEnabled();
      fireEvent.click(action);
      expect(await screen.findByRole('dialog')).toBeVisible();
      const url =
        source === 'students'
          ? 'http://upload-selectors.test/api/students/records/list/1-A'
          : 'http://upload-selectors.test/api/app/standard/lookup';
      mswServer.use(
        http.get(url, () =>
          source === 'scope'
            ? HttpResponse.json({
                items: [{ ...classes[0], divisions: [classes[0].divisions[1]] }],
              })
            : HttpResponse.json(
                { error: { message: 'Current student scope denied' } },
                { status: 403 }
              )
        )
      );
      await act(async () => {
        store.dispatch(
          api.util.invalidateTags([
            source === 'students' ? studentType.student : organizationType.academicHierarchyOptions,
          ])
        );
      });
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      expect(screen.queryByText('Pupil 1-A')).not.toBeInTheDocument();
      mswServer.use(
        http.get(url, () =>
          HttpResponse.json(
            source === 'students'
              ? {
                  totalCount: 1,
                  items: [{ studentId: 'student-1-A', studentName: 'Pupil 1-A', status: 2 }],
                }
              : { items: classes }
          )
        )
      );
      await act(async () => {
        store.dispatch(
          api.util.invalidateTags([
            source === 'students' ? studentType.student : organizationType.academicHierarchyOptions,
          ])
        );
      });
      await screen.findByText('Pupil 1-A');
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    }
  );

  it.each(['lookup', 'students'] as const)(
    'keeps the current upload dialog through a healthy pending %s refresh',
    async (source) => {
      store = makeStore([studentPermissions.records.manageStudent]);
      render(
        <Provider store={store}>
          <Screen />
        </Provider>
      );
      await choose('Class', 'Class 1');
      await choose('Division', 'A');
      await screen.findByText('Pupil 1-A');
      const action = screen.getByRole('button', { name: /Upload (photo|documents) for Pupil 1-A/ });
      expect(action).toBeEnabled();
      fireEvent.click(action);
      await screen.findByRole('dialog');
      let finish!: () => void;
      const pending = new Promise<void>((resolve) => {
        finish = resolve;
      });
      const url =
        source === 'lookup'
          ? 'http://upload-selectors.test/api/app/standard/lookup'
          : 'http://upload-selectors.test/api/students/records/list/1-A';
      mswServer.use(
        http.get(url, async () => {
          await pending;
          return HttpResponse.json(
            source === 'lookup'
              ? { items: classes }
              : {
                  totalCount: 1,
                  items: [{ studentId: 'student-1-A', studentName: 'Pupil 1-A', status: 2 }],
                }
          );
        })
      );
      try {
        await act(async () => {
          store.dispatch(
            api.util.invalidateTags([
              source === 'lookup' ? organizationType.academicHierarchyOptions : studentType.student,
            ])
          );
        });
        await waitFor(() => {
          const state =
            source === 'lookup'
              ? classApi.endpoints.getClassLookup.select()(store.getState())
              : StudentApi.endpoints.getStudentsByDivision.select({
                  divisionId: '1-A',
                  skipCount: 0,
                  maxResultCount: 10,
                  searchTerm: '',
                })(store.getState());
          expect(state.isLoading).toBe(true);
        });
        expect(screen.getByRole('dialog')).toBeVisible();
      } finally {
        await act(async () => finish());
      }
      await waitFor(() => {
        const state =
          source === 'lookup'
            ? classApi.endpoints.getClassLookup.select()(store.getState())
            : StudentApi.endpoints.getStudentsByDivision.select({
                divisionId: '1-A',
                skipCount: 0,
                maxResultCount: 10,
                searchTerm: '',
              })(store.getState());
        expect(state.isSuccess).toBe(true);
      });
      expect(screen.getByRole('dialog')).toBeVisible();
    }
  );
});

it.each([
  [2, true],
  [4, true],
  [6, false],
  [7, false],
  [8, false],
  [undefined, false],
] as const)(
  'keeps document upload lifecycle authority for roster status %s',
  async (status, allowed) => {
    store = makeStore([studentPermissions.records.manageStudent]);
    mswServer.use(
      http.get('http://upload-selectors.test/api/students/records/list/1-A', () =>
        HttpResponse.json({
          totalCount: 1,
          items: [{ studentId: 'student-1-A', studentName: 'Pupil 1-A', status }],
        })
      )
    );
    render(
      <Provider store={store}>
        <UploadStudentDocumentsScreen />
      </Provider>
    );
    await choose('Class', 'Class 1');
    await choose('Division', 'A');
    await screen.findByText('Pupil 1-A');
    const action = screen.getByRole('button', { name: 'Upload documents for Pupil 1-A' });
    if (allowed) expect(action).toBeEnabled();
    else {
      expect(action).toBeDisabled();
      fireEvent.mouseOver(action.parentElement!);
      expect(await screen.findByRole('tooltip')).toHaveTextContent(
        'Student documents can be uploaded during registration.'
      );
    }
  }
);

it('withdraws document submit authority when the current roster lifecycle changes while its dialog is open', async () => {
  store = makeStore([studentPermissions.records.manageStudent]);
  const posted = vi.fn();
  const requirements = [
    { documentTypeId: 'proof', documentTypeName: 'Identity proof', isRequired: true },
  ];
  mswServer.use(
    http.get(
      'http://upload-selectors.test/api/student/enrollment/registrations/:id/documents/required-status',
      () => HttpResponse.json(requirements)
    ),
    http.get(
      'http://upload-selectors.test/api/app/student-document/required-documents-status/:id',
      () => HttpResponse.json(requirements)
    ),
    http.post(
      'http://upload-selectors.test/api/student/enrollment/registrations/:id/documents',
      () => {
        posted();
        return HttpResponse.json({});
      }
    ),
    http.post('http://upload-selectors.test/api/app/student-document/upload-document/:id', () => {
      posted();
      return HttpResponse.json({});
    })
  );
  render(
    <Provider store={store}>
      <UploadStudentDocumentsScreen />
    </Provider>
  );
  await choose('Class', 'Class 1');
  await choose('Division', 'A');
  await screen.findByText('Pupil 1-A');
  const action = screen.getByRole('button', { name: 'Upload documents for Pupil 1-A' });
  expect(action).toBeEnabled();
  fireEvent.click(action);
  await screen.findByRole('dialog');
  await choose('Document Type', 'Identity proof');
  fireEvent.click(screen.getByRole('button', { name: 'Choose synthetic file' }));
  expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
  mswServer.use(
    http.get('http://upload-selectors.test/api/students/records/list/1-A', () =>
      HttpResponse.json({
        totalCount: 1,
        items: [{ studentId: 'student-1-A', studentName: 'Pupil 1-A', status: 6 }],
      })
    )
  );
  await act(async () => {
    store.dispatch(api.util.invalidateTags([studentType.student]));
  });
  await waitFor(() =>
    expect(
      StudentApi.endpoints.getStudentsByDivision.select({
        divisionId: '1-A',
        skipCount: 0,
        maxResultCount: 10,
        searchTerm: '',
      })(store.getState()).data.items[0].status
    ).toBe(6)
  );
  expect(screen.getByRole('dialog')).toBeVisible();
  expect(screen.getByText('Student documents can be uploaded during registration.')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  expect(posted).not.toHaveBeenCalled();
});
