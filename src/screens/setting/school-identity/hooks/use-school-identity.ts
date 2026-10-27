import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useGetSchoolIdentityQuery } from 'src/redux/InstituteSetup/schoolIdentityApi';

import { identityTab, identityHref } from '../identity-navigation';
import { useIdentityPermissions } from './use-identity-permissions';
import { useIdentityAcademicContext } from './use-identity-academic-context';

export function useSchoolIdentity() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const permissions = useIdentityPermissions();
  const tab = identityTab(params);
  const yearId = params.get('academicYearId') ?? '';
  const boardId = params.get('boardId') ?? '';
  const mediumId = params.get('mediumId') ?? '';
  const organizationId = params.get('organizationId') ?? '';
  const { yearsQuery, boardsQuery, years, boards, selectedYear, currentBoard, currentMedium } =
    useIdentityAcademicContext({ canView: permissions.canView, tab, yearId, boardId });
  const context =
    tab === 1
      ? {
          boardId: boardId || undefined,
          mediumId: mediumId || undefined,
          organizationId: organizationId || undefined,
        }
      : {};
  const selectedBoard = boards.find(
    (board) => board.id === boardId && board.academicYearId === selectedYear
  );
  const selectedMedium = selectedBoard?.educationMediums?.find((medium) => medium.id === mediumId);
  const valid =
    tab === 0 ||
    Boolean(
      selectedBoard &&
      (!mediumId || selectedMedium) &&
      (!organizationId ||
        selectedMedium?.educationMediumStages?.some((item) => item.id === organizationId))
    );
  const query = useGetSchoolIdentityQuery(context, { skip: !permissions.canView || !valid });
  const canManage =
    query.currentData?.canManage === true &&
    (tab === 0 ? permissions.canManageDefaults : permissions.canManageOverrides);
  const selectContext = (year: string, board: string, medium: string, organization = '') => {
    router.push(
      identityHref(pathname, params, {
        scope: 'overrides',
        academicYearId: year,
        boardId: board,
        mediumId: medium,
        organizationId: organization,
      }),
      { scroll: false }
    );
  };
  const tabHref = (value: number) =>
    identityHref(pathname, params, { scope: value === 0 ? 'defaults' : 'overrides' });
  const setTab = (value: number) => router.push(tabHref(value), { scroll: false });
  const selectCurrentContext = () => {
    if (!currentBoard?.id || !currentBoard.academicYearId) return;
    selectContext(currentBoard.academicYearId, currentBoard.id, currentMedium?.id ?? '');
  };
  return {
    permissions,
    tab,
    setTab,
    tabHref,
    currentBoard,
    selectCurrentContext,
    boardId,
    mediumId,
    organizationId,
    selectedYear,
    selectContext,
    yearsQuery,
    boardsQuery,
    years,
    boards,
    context,
    valid,
    query,
    canManage,
  };
}
export type SchoolIdentityWorkspace = ReturnType<typeof useSchoolIdentity>;
