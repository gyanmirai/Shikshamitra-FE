import type { UserScopeHierarchy } from 'src/redux/userScope/types';

import { it, vi, expect, describe, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import GlobalAcademicSearch from './index';

const mocks = vi.hoisted(() => ({
  pathname: '/student/onboarding/setup',
  confirm: vi.fn().mockResolvedValue(false),
  dispatch: vi.fn(),
  years: {
    items: [
      { id: 'year-a', name: '2026-2027' },
      { id: 'year-b', name: '2027-2028' },
    ],
  },
  boards: { items: [] },
  scope: {
    userId: 'staff-user',
    userName: 'staff',
    isAdmin: true,
    fromCache: false,
    generatedAt: '',
    accessibleHierarchy: [],
  } as UserScopeHierarchy,
}));

vi.mock('next/navigation', () => ({ usePathname: () => mocks.pathname }));
vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      accessToken: 'test-session',
      profile: { sub: 'staff-user' },
    },
  }),
}));
vi.mock('react-redux', () => ({
  useDispatch: () => mocks.dispatch,
  useSelector: (select: (state: unknown) => unknown) =>
    select({
      globalState: { currentYear: mocks.years.items[0], currentBoard: {}, currentMedium: {} },
    }),
}));
vi.mock('src/hooks/use-confirm-dialog', () => ({ useConfirmDialog: () => [mocks.confirm, null] }));
vi.mock('src/redux/year/yearApi', () => ({ useGetYearQuery: 'years' }));
vi.mock('src/redux/board/boardApi', () => ({ useGetBoardsQuery: 'boards' }));
vi.mock('src/redux/userScope/userScopeApi', () => ({
  useGetUserScopeHierarchyQuery: () => ({ currentData: mocks.scope }),
}));
vi.mock('src/redux/customQueryAndMutation', () => ({
  default: ({ currentQueryAndMutation }: { currentQueryAndMutation: string }) => ({
    data: currentQueryAndMutation === 'years' ? mocks.years : mocks.boards,
    isLoading: false,
  }),
}));
vi.mock('src/utils/driverBtnConfig', () => ({ setDriverNextEnabled: vi.fn() }));
vi.mock('src/utils/academicHierarchyUtils', () => ({
  getScopedAcademicData: (data: unknown) => data,
  getScopedAcademicYears: (data: unknown) => data,
  getGlobalAcademicSearchOptions: () => [],
  getValidGlobalAcademicSelection: () => null,
  getScopedSelectedAcademicOption: () => null,
}));

describe('Student-only global year confirmation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.scope.isAdmin = true;
    mocks.scope.accessibleHierarchy = [];
  });

  it('omits unassigned hierarchy years and selects the authorized year on Student entry', async () => {
    mocks.pathname = '/student/dashboard';
    mocks.scope.isAdmin = false;
    mocks.scope.accessibleHierarchy = [
      {
        academicYearId: 'year-a',
        academicYearName: '2026-2027',
        hasFullBoardAccess: false,
        boards: [],
      },
      {
        academicYearId: 'year-b',
        academicYearName: '2027-2028',
        hasFullBoardAccess: true,
        boards: [],
      },
    ];
    render(<GlobalAcademicSearch />);
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Academic Year' }));
    expect(await screen.findByRole('option', { name: '2027-2028' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: '2026-2027' })).not.toBeInTheDocument();
    await waitFor(() =>
      expect(mocks.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'globalState/setCurrentYear',
          payload: expect.objectContaining(mocks.years.items[1]),
        })
      )
    );
  });

  it.each(['/student', '/student/onboarding/setup', '/student/admissions/forms'])(
    'uses year-only copy on %s and preserves selection when cancelled',
    async (pathname) => {
      mocks.pathname = pathname;
      render(<GlobalAcademicSearch />);
      const selector = screen.getByRole('combobox', { name: 'Academic Year' });
      fireEvent.mouseDown(selector);
      fireEvent.click(await screen.findByRole('option', { name: '2027-2028' }));
      await waitFor(() =>
        expect(mocks.confirm).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Change academic year',
            confirmText: 'Change year',
          })
        )
      );
      expect(mocks.dispatch).not.toHaveBeenCalled();
      expect(
        screen.queryByRole('combobox', { name: 'Academic Year, Board and Medium' })
      ).not.toBeInTheDocument();
    }
  );

  it.each(['/finance/fee-collection', '/hr/dashboard'])(
    'leaves existing confirmation behavior unchanged on %s',
    async (pathname) => {
      mocks.pathname = pathname;
      render(<GlobalAcademicSearch />);
      fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Academic Year' }));
      fireEvent.click(await screen.findByRole('option', { name: '2027-2028' }));
      await waitFor(() =>
        expect(mocks.confirm).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Change Academic Year, Board and Medium',
            confirmText: undefined,
          })
        )
      );
      expect(mocks.dispatch).not.toHaveBeenCalled();
    }
  );
});
