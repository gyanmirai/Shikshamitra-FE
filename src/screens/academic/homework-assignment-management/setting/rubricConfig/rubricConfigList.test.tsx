// @vitest-environment jsdom

import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { vi, it, expect, describe } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import RubricConfigTable from './rubricConfigTable';
import { useRubricTemplateList } from './hooks/useRubricTemplateList';

vi.hoisted(() => {
  vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:4197');
  // jsdom has no layout observer; retain the real table and stub only this browser API.
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe = vi.fn();

      unobserve = vi.fn();

      disconnect = vi.fn();
    }
  );
});

const template = {
  id: 'template-one',
  title: 'Writing rubric',
  isTemplate: true,
  scoringModel: 0,
  visibility: 3,
  status: 0,
  tags: [],
  performanceLevels: [],
  version: 1,
  totalMarks: 10,
  criteria: [{ id: 'criterion-one', title: 'Accuracy', points: 10, displayOrder: 1 }],
};

function List() {
  const list = useRubricTemplateList();
  return (
    <RubricConfigTable
      data={list.tableData}
      isLoading={list.isLoading}
      isError={list.isError}
      hasMedium={list.hasMedium}
      onRetry={list.retry}
      canAdd={false}
      canDelete={false}
      onEdit={vi.fn()}
      onDuplicate={vi.fn()}
      onPreview={vi.fn()}
      onUsage={vi.fn()}
      onVersion={vi.fn()}
      onArchive={vi.fn()}
      onPublish={vi.fn()}
    />
  );
}

function setup(medium: string | null = 'medium-one') {
  mswServer.use(
    http.get(/\/api\/auth\/session$/, () => HttpResponse.json(null)),
    http.get(/^https:\/\/api\.(iconify.design|simplesvg.com|unisvg.com)\//, ({ request }) => {
      const url = new URL(request.url);
      return HttpResponse.json({
        prefix: url.pathname.slice(1, -5),
        icons: {},
        not_found: url.searchParams.get('icons')?.split(',') || [],
      });
    })
  );
  const store = configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
      confirmPopup: () => ({ isChanges: false }),
      globalState: () => ({ currentMedium: medium ? { id: medium } : null }),
    },
    middleware: (getDefault) => getDefault().concat(api.middleware),
  });
  render(
    <Provider store={store}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <List />
      </ThemeProvider>
    </Provider>
  );
  return userEvent.setup();
}

describe('Rubric template list request states', () => {
  it('shows an error and retries the failed request, then displays templates and usage', async () => {
    const requests: URL[] = [];
    mswServer.use(
      http.get('http://localhost:4197/api/academic/rubrics', ({ request }) => {
        requests.push(new URL(request.url));
        return requests.length === 1
          ? HttpResponse.json({ title: 'Request failed', status: 500 }, { status: 500 })
          : HttpResponse.json([
              template,
              { ...template, id: 'task-one', isTemplate: false, sourceTemplateId: template.id },
            ]);
      })
    );
    const user = setup();
    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load rubric templates');
    expect(screen.queryByText('No Rubric Templates Found')).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search...')).toBeVisible();
    fireEvent.change(screen.getByPlaceholderText('Search...'), { target: { value: 'Writing' } });
    expect(screen.getByRole('alert')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByText('Writing rubric')).toBeVisible();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(await screen.findByText('1 times')).toBeVisible();
    expect(requests).toHaveLength(2);
    expect(requests[0].searchParams.get('academicMediumId')).toBe('medium-one');
    expect(requests[0].searchParams.has('isTemplate')).toBe(false);
  }, 10000);

  it('shows the empty state only after a successful empty response', async () => {
    mswServer.use(
      http.get('http://localhost:4197/api/academic/rubrics', () => HttpResponse.json([]))
    );
    setup();
    expect(await screen.findByText('No Rubric Templates Found')).toBeVisible();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows a prerequisite and sends no request when no medium is selected', async () => {
    let requests = 0;
    mswServer.use(
      http.get('http://localhost:4197/api/academic/rubrics', () => {
        requests += 1;
        return HttpResponse.json([]);
      })
    );
    setup(null);
    expect(
      screen.getByText('Select an Academic Year, Board and Medium to view rubric templates.')
    ).toBeVisible();
    await waitFor(() => expect(requests).toBe(0));
    expect(screen.queryByText('No Rubric Templates Found')).not.toBeInTheDocument();
  });
});
