import type { ReactNode, ReactElement } from 'react';

import { vi, it, expect, describe } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import StudentReportsScreen from './index';
import LegacyReportUnavailable from './components/LegacyReportUnavailable';

const mocks = vi.hoisted(() => ({
  reports: [] as { categoryId: string; render: () => ReactElement<{ reportType?: string }> }[],
  jobs: vi.fn(() => ({
    currentData: { items: [], totalCount: 0 },
    isFetching: false,
    refetch: vi.fn(),
  })),
}));
vi.mock('src/components/common-report', () => ({
  default: ({ subCategories }: { subCategories: typeof mocks.reports }) => {
    mocks.reports = subCategories;
    return <div>Report catalog</div>;
  },
}));
vi.mock('src/components/custom-breadcrumbs', () => ({
  CustomBreadcrumbs: ({ action, links }: { action: ReactNode; links: {name:string;href?:string}[] }) => <header>{links.filter(link=>link.href).map(link=><a key={link.name} href={link.href}>{link.name}</a>)}{action}</header>,
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span /> }));
vi.mock('./components/StudentRecordsReportForm', () => ({ default: () => <div /> }));
vi.mock('./components/VerifyStudentData', () => ({ default: () => <div /> }));
vi.mock('./components/AdmissionCategorywiseList', () => ({ default: () => <div /> }));
vi.mock('./components/StudentRecordsAiReportButton', () => ({
  StudentRecordsAiReportButton: () => <div />,
}));
vi.mock('src/components/customizabaleTable', () => ({
  default: ({ data }: { data: object[] }) => <div>{JSON.stringify(data)}</div>,
}));
vi.mock('react-redux', () => ({
  useSelector: (selector: (state: object) => unknown) => selector({ auth: { permissions: [] } }),
}));
vi.mock('src/redux/student/records/student-record-reports-api', () => ({
  useGetRecordsReportJobsQuery: mocks.jobs,
  useCancelRecordsReportMutation: () => [vi.fn(), { isLoading: false }],
  useCreateRecordsReportMutation: () => [vi.fn(), { isLoading: false }],
  useDownloadRecordsReportMutation: () => [vi.fn(), { isLoading: false }],
}));

describe('Student Reports active catalog and history', () => {
  it('routes each Compliance choice to its actual distinct report contract without removing the catalog', () => {
    render(<StudentReportsScreen />);
    fireEvent.click(screen.getByRole('button', { name: /Generate report/i }));
    expect(
      mocks.reports
        .filter((report) => report.categoryId === 'Compliance')
        .map((report) => report.render().props.reportType)
    ).toEqual(['UdiseBaseline', 'GujaratCompliance', 'IdentityExceptions', 'EligibilityTracking']);
    expect(mocks.reports.filter((report) => report.categoryId !== 'Compliance')).toHaveLength(21);
    expect(mocks.reports.filter((report) => report.categoryId !== 'Compliance').every((report) => report.render().type === LegacyReportUnavailable)).toBe(true);
  });

  it('reads actual generated jobs instead of rendering the two fixture reports', () => {
    render(<StudentReportsScreen />);
    expect(mocks.jobs).toHaveBeenCalled();
    expect(screen.queryByText(/2025-12-0[12]/)).not.toBeInTheDocument();
  });
});

it('routes the Student Records breadcrumb to the canonical Records landing page', () => {
 render(<StudentReportsScreen/>);
 expect(screen.getByRole('link',{name:'Student Records'})).toHaveAttribute('href','/student/profile');
});
