import type { ReactNode } from 'react';
import type { AdmissionInquiry } from 'src/redux/student/admissions/admission-inquiries-api';

import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { useState, useEffect } from 'react';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { render, screen, waitFor, cleanup, fireEvent } from '@testing-library/react';

import AdmissionInquiriesScreen from './admission-inquiries';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  useSearchParams: () => new URLSearchParams('board=board-gseb&medium=medium-english'),
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/custom-breadcrumbs', () => ({
  CustomBreadcrumbs: () => <h1>Admission inquiries</h1>,
}));
vi.mock('src/components/custom-date-range-picker', () => ({ CustomDateRangePicker: () => null }));
vi.mock('src/components/customizabaleTable', () => ({
  default: ({
    data,
    isLoading,
    noDataText,
  }: {
    data: AdmissionInquiry[];
    isLoading: boolean;
    noDataText: ReactNode;
  }) =>
    isLoading ? (
      <div role="status">Loading inquiries</div>
    ) : (
      <div>
        {data.length ? data.map((row) => <p key={row.id}>{row.applicantName}</p>) : noDataText}
      </div>
    ),
}));
vi.mock('./admission-academic-filters', () => ({
  useAdmissionAcademicFilters: () => {
    const [standardId, setStandardId] = useState('');
    return {
      academicYearId: 'year-2026',
      boardId: 'board-gseb',
      mediumId: 'medium-english',
      standardId,
      dashboardScope: false,
      update: (_key: string, value: string) => setStandardId(value),
      clear: () => setStandardId(''),
    };
  },
  AdmissionAcademicFilters: ({
    onChange,
    onLoadingChange,
  }: {
    onChange: (key: string, value: string) => void;
    onLoadingChange: (value: boolean) => void;
  }) => {
    useEffect(() => onLoadingChange(false), [onLoadingChange]);
    return (
      <>
        <button type="button" onClick={() => onChange('class', 'class-8')}>
          Std 8
        </button>
        <button type="button" onClick={() => onChange('class', '')}>
          All Classes
        </button>
      </>
    );
  },
}));
vi.mock('./inquiry-management/use-inquiry-handoff', () => ({
  useInquiryHandoff: () => ({ moving: false, canMove: false, issue: null, move: vi.fn() }),
}));
vi.mock('./inquiry-management/inquiry-follow-up-dialog', () => ({
  InquiryFollowUpDialog: () => null,
}));
vi.mock('./inquiry-management/inquiry-handoff-issue-dialog', () => ({
  InquiryHandoffIssueDialog: () => null,
}));
vi.mock('./inquiry-management/admission-inquiry-management-page', () => ({
  AdmissionInquiryManagementPage: () => null,
}));
vi.mock('./inquiry-management/admission-inquiry-columns', () => ({
  buildAdmissionInquiryColumns: () => [],
}));

const makeStore = () =>
  configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
      auth: (
        state = {
          user: {},
          permissions: [{ name: 'Students.Admissions.Inquiries.View', isGranted: true }],
        }
      ) => state,
    },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
let store: ReturnType<typeof makeStore>;
let records: { id: string; applicantName: string; standardId: string }[];
let requests: URLSearchParams[];
const rhea = { id: 'inq-3', applicantName: 'Rhea Panchal', standardId: 'class-8' };
const renderList = () =>
  render(
    <Provider store={store}>
      <AdmissionInquiriesScreen />
    </Provider>
  );

beforeEach(() => {
  store = makeStore();
  records = [];
  requests = [];
  clearCachedAuthSession();
  mswServer.use(
    http.get('*/api/auth/session', () => HttpResponse.json(null)),
    http.get('*/api/student/enrollment/admissions/inquiries', ({ request }) => {
      const params = new URL(request.url).searchParams;
      requests.push(params);
      const items = records.filter(
        (row) => !params.has('standardId') || params.get('standardId') === row.standardId
      );
      return HttpResponse.json({ data: { totalCount: items.length, items } });
    })
  );
});
afterEach(() => {
  cleanup();
  store.dispatch(api.util.resetApiState());
  clearCachedAuthSession();
});

it('refreshes a cached empty All Classes result after a specific class finds a new inquiry', async () => {
  renderList();
  await screen.findByText('No Inquiries Awaiting Admission Handoff');
  expect(requests).toHaveLength(1);
  // Another staff session/public inquiry creates a record after this browser cached an empty list.
  records = [rhea];
  fireEvent.click(screen.getByRole('button', { name: /^Std 8$/ }));
  await screen.findByText('Rhea Panchal');
  expect(requests).toHaveLength(2);
  fireEvent.click(screen.getByRole('button', { name: /^All Classes$/ }));
  await waitFor(() => expect(requests).toHaveLength(3));
  expect(await screen.findByText('Rhea Panchal')).toBeInTheDocument();
  expect(requests[2].has('standardId')).toBe(false);
  expect(requests[2].has('standardIds')).toBe(false);
  requests.forEach((params) => {
    expect(params.get('academicYearId')).toBe('year-2026');
    expect(params.get('boardId')).toBe('board-gseb');
    expect(params.get('mediumId')).toBe('medium-english');
    expect(params.get('skipCount')).toBe('0');
  });
});

it('refreshes All Classes on worklist re-entry rather than preserving an old empty cache', async () => {
  const firstVisit = renderList();
  await screen.findByText('No Inquiries Awaiting Admission Handoff');
  firstVisit.unmount();
  records = [rhea];
  renderList();
  expect(await screen.findByText('Rhea Panchal')).toBeInTheDocument();
  expect(requests).toHaveLength(2);
});

it('reuses the active request on ordinary rerenders', async () => {
  records = [rhea];
  const view = renderList();
  await screen.findByText('Rhea Panchal');
  view.rerender(
    <Provider store={store}>
      <AdmissionInquiriesScreen />
    </Provider>
  );
  expect(screen.getByText('Rhea Panchal')).toBeInTheDocument();
  expect(requests).toHaveLength(1);
});
