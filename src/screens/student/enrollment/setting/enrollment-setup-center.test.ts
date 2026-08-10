import type { AdmissionCrmSetupStatusDto } from 'src/redux/student/admissions-crm/setup-playbooks-contracts';

import { createElement } from 'react';
import { render, screen } from '@testing-library/react';
import { it, vi, expect, describe, beforeEach } from 'vitest';

import { EnrollmentSetupCenter, buildEnrollmentSetupCards } from './enrollment-setup-center';

const mocks = vi.hoisted(() => ({
  setupStatusQuery: vi.fn(),
  enrollmentWorkspace: vi.fn(),
}));

vi.mock('src/redux/student/admissions-crm/setup-playbooks-api', () => ({
  useGetAdmissionCrmSetupStatusQuery: (...args: unknown[]) => mocks.setupStatusQuery(...args),
}));

vi.mock('../admissions-crm/enrollment-workspace-context', () => ({
  useEnrollmentWorkspace: () => mocks.enrollmentWorkspace(),
}));

vi.mock('../admissions-crm/workspace-header', () => ({
  EnrollmentWorkspaceHeader: () => null,
}));

vi.mock('src/components/iconify', () => ({
  Iconify: ({ icon }: { icon: string }) => createElement('span', { 'data-icon': icon }),
}));

vi.mock('src/routes/components', () => ({
  RouterLink: 'a',
}));

describe('Enrollment Setup Center cards', () => {
  it('uses the same access-visible cards for readiness and managed state', () => {
    const setup: AdmissionCrmSetupStatusDto = {
      academicYearId: 'year-1',
      cycleName: '2026-27',
      status: 1,
      items: [
        {
          key: 'admission-year',
          title: 'Admission Year Setup',
          status: 2,
          accessMode: 1,
          blockerCodes: [],
          path: '/admission-year',
        },
        {
          key: 'pipeline',
          title: 'Pipeline Settings',
          status: 2,
          accessMode: 0,
          blockerCodes: [],
          path: '/pipeline',
        },
        {
          key: 'communication',
          title: 'Communication Settings',
          status: 1,
          accessMode: 2,
          blockerCodes: ['template-required'],
          path: '/communication',
        },
      ],
    };

    const cards = buildEnrollmentSetupCards(setup);

    expect(cards.map((card) => card.key)).toEqual(['admission-year', 'communication']);
    expect(cards.find((card) => card.key === 'admission-year')).toMatchObject({
      ready: true,
      readOnly: true,
    });
    expect(cards.find((card) => card.key === 'communication')).toMatchObject({
      ready: false,
      readOnly: false,
    });
  });
});

describe('Enrollment Setup Center access loading', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.enrollmentWorkspace.mockReturnValue({
      academicYearId: 'year-1',
      state: { cycle: 'year-1' },
    });
  });

  it('shows labelled progress without checklist cards until access modes are loaded', () => {
    mocks.setupStatusQuery.mockReturnValue({
      data: undefined,
      isError: false,
      isLoading: true,
      isFetching: true,
      refetch: vi.fn(),
    });

    render(createElement(EnrollmentSetupCenter));

    expect(
      screen.getByRole('progressbar', { name: 'Loading enrollment setup' })
    ).toBeInTheDocument();
    expect(screen.queryByText('Setup checklist')).not.toBeInTheDocument();
    expect(screen.queryByText('Admission Year Setup')).not.toBeInTheDocument();
  });

  it('shows no checklist cards when access status fails', () => {
    mocks.setupStatusQuery.mockReturnValue({
      data: undefined,
      isError: true,
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    });

    render(createElement(EnrollmentSetupCenter));

    expect(screen.getByText('Enrollment readiness could not be loaded.')).toBeInTheDocument();
    expect(screen.queryByText('Setup checklist')).not.toBeInTheDocument();
    expect(screen.queryByText('Admission Year Setup')).not.toBeInTheDocument();
  });

  it('retains explicit setup guidance when no academic year is selected', () => {
    mocks.enrollmentWorkspace.mockReturnValue({
      academicYearId: undefined,
      state: { cycle: undefined },
    });
    mocks.setupStatusQuery.mockReturnValue({
      data: undefined,
      isError: false,
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    });

    render(createElement(EnrollmentSetupCenter));

    expect(screen.getByText('Select an academic year to begin')).toBeInTheDocument();
    expect(screen.getByText('Setup checklist')).toBeInTheDocument();
    expect(screen.getByText('Admission Year Setup')).toBeInTheDocument();
  });
});
