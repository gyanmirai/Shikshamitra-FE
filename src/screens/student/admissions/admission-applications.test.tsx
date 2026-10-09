import type { IColumn } from 'src/components/customizabaleTable/types';

import { vi, it, expect, describe, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import AdmissionApplicationsScreen from './admission-applications';

const state = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  search: 'counsellor=owner-1&page=2',
}));
vi.mock('next/navigation', () => ({
  usePathname: () => '/student/admissions/applications',
  useRouter: () => ({ push: state.push, replace: state.replace }),
  useSearchParams: () => new URLSearchParams(state.search),
}));
vi.mock('next/link', () => ({
  default: ({ children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a {...props}>{children}</a>
  ),
}));
vi.mock('src/components/custom-breadcrumbs', () => ({ CustomBreadcrumbs: () => null }));
vi.mock('./admission-query-error', () => ({ AdmissionQueryError: () => null }));
vi.mock('./admission-application-detail', () => ({
  default: ({ applicationId, onClose }: { applicationId: string; onClose: () => void }) => (
    <section role="dialog" aria-label={`Application ${applicationId}`}>
      <button type="button" onClick={onClose}>
        Close drawer
      </button>
    </section>
  ),
}));
vi.mock('./admission-academic-filters', () => ({
  AdmissionAcademicFilters: () => null,
  useAdmissionAcademicFilters: () => ({
    academicYearId: 'year-1',
    boardId: '',
    mediumId: '',
    standardId: '',
    clear: vi.fn(),
    update: vi.fn(),
  }),
}));
vi.mock('src/redux/student/admissions/admission-applications-api', () => ({
  useGetAdmissionApplicationCounsellorsQuery: () => ({
    data: [{ id: 'owner-1', name: 'Counsellor' }],
  }),
  useGetAdmissionApplicationsQuery: () => ({
    currentData: {
      items: [
        {
          id: 'application-1',
          applicantId: 'applicant-1',
          applicationNumber: 'APP-2026-000001',
          applicantName: 'Parth Patel',
        },
      ],
    },
  }),
}));
vi.mock('src/components/customizabaleTable', () => ({
  default: ({ columns, data }: { columns: IColumn[]; data: Record<string, unknown>[] }) => (
    <div>
      {data.map((row) => (
        <div key={String(row.id)}>
          {columns
            .filter((column) => ['applicationNumber', 'applicantName'].includes(column.id))
            .map((column) => (
              <span key={column.id}>{column.render?.(row[column.id], row)}</span>
            ))}
        </div>
      ))}
    </div>
  ),
}));

describe('Applications drawer entry links', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.search = 'counsellor=owner-1&page=2';
  });
  it('uses the same filtered drawer URL for both reference and applicant name', () => {
    render(<AdmissionApplicationsScreen />);
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(2);
    links.forEach((link) =>
      expect(link).toHaveAttribute(
        'href',
        '/student/admissions/applications?counsellor=owner-1&page=2&application=application-1'
      )
    );
    fireEvent.click(links[1], { button: 0 });
    expect(state.push).toHaveBeenCalledWith(
      '/student/admissions/applications?counsellor=owner-1&page=2&application=application-1',
      { scroll: false }
    );
  });
  it.each([{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { button: 1 }])(
    'preserves native modified link navigation %s',
    (modifier) => {
      render(<AdmissionApplicationsScreen />);
      expect(fireEvent.click(screen.getByRole('link', { name: 'Parth Patel' }), modifier)).toBe(
        true
      );
      expect(state.push).not.toHaveBeenCalled();
    }
  );
  it('opens a copied link within list context and closes without dropping list filters', () => {
    state.search += '&application=application-1';
    render(<AdmissionApplicationsScreen />);
    expect(screen.getByRole('dialog', { name: 'Application application-1' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Close drawer' }));
    expect(state.replace).toHaveBeenCalledWith(
      '/student/admissions/applications?counsellor=owner-1&page=2',
      { scroll: false }
    );
  });
});
