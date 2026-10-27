import { useState } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { useGetAcademicHierarchyQuery } from 'src/redux/board/boardApi';
import {
  useGetSchoolIdentityQuery,
  useCopySchoolIdentityMutation,
} from 'src/redux/InstituteSetup/schoolIdentityApi';

import { identityError } from '../identity-form';

import type { IdentityContext } from '../types';

export function useIdentityCopy(target: IdentityContext, stamp: string, onClose: () => void) {
  const [selection, setSelection] = useState({ year: '', board: '', medium: '', organization: '' });
  const [error, setError] = useState('');
  const [copy, copying] = useCopySchoolIdentityMutation();
  const sourceHierarchy = useGetAcademicHierarchyQuery(selection.year, { skip: !selection.year });
  const boards = sourceHierarchy.currentData?.items ?? [];
  const context = {
    boardId: selection.board || undefined,
    mediumId: selection.medium || undefined,
    organizationId: selection.organization || undefined,
  };
  const query = useGetSchoolIdentityQuery(context, {
    skip: !selection.board || !boards.some((item) => item.id === selection.board),
  });
  const compatible = Boolean(
    selection.board &&
    target.boardId &&
    Boolean(selection.medium) === Boolean(target.mediumId) &&
    Boolean(selection.organization) === Boolean(target.organizationId)
  );
  const copySource = async () => {
    if (
      !target.boardId ||
      !compatible ||
      !query.currentData?.id ||
      !query.currentData.canManage ||
      query.isFetching ||
      sourceHierarchy.isFetching ||
      sourceHierarchy.isError ||
      copying.isLoading
    )
      return;
    try {
      await copy({
        sourceBoardId: selection.board,
        sourceMediumId: selection.medium || undefined,
        sourceOrganizationId: selection.organization || undefined,
        targetBoardId: target.boardId,
        targetMediumId: target.mediumId,
        targetOrganizationId: target.organizationId,
        targetConcurrencyStamp: stamp,
      }).unwrap();
      shikshaMitraToast.success({ message: 'School Identity overrides copied.' });
      onClose();
    } catch (failure) {
      setError(identityError(failure));
    }
  };
  return {
    selection,
    error,
    copying,
    sourceHierarchy,
    boards,
    context,
    query,
    compatible,
    copySource,
    selectSource: (year: string, board: string, medium: string, organization = '') => {
      setSelection({ year, board, medium, organization });
      setError('');
    },
  };
}
