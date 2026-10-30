import type { RootState } from 'src/redux/store';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { hasGrantedPermission } from 'src/utils/permissions';
import { academicPermissions } from 'src/constants/academic-menu';
import { useGetAcademicInsightsQuery } from 'src/redux/academicAPI/academicInsightsApi';

export function useAcademicInsights() {
  const { currentYear, currentBoard, currentMedium } = useSelector((state: RootState) => state.globalState);
  const { user, sessionContext, permissions, permissionsInitialized, initializationVersion } =
    useSelector((state: RootState) => state.auth);
  const accessKey = `${sessionContext?.tenantId ?? ''}:${user?.sub ?? ''}:${initializationVersion}`;
  const academicYearId = currentYear?.id ?? '';
  const boardId = currentBoard?.id ?? '';
  const educationMediumId = currentMedium?.id ?? '';
  const contextKey = `${accessKey}:${academicYearId}:${boardId}:${educationMediumId}`;
  const [selection, setSelection] = useState({ contextKey, studentId: '' });
  const studentId = selection.contextKey === contextKey ? selection.studentId : '';
  const hasContext = Boolean(academicYearId && boardId && educationMediumId);
  const authorized = permissionsInitialized && Boolean(user?.sub && sessionContext?.tenantId) &&
    hasGrantedPermission(permissions, academicPermissions.root) &&
    hasGrantedPermission(permissions, 'Academics.Dashboard.View');
  const query = useGetAcademicInsightsQuery({ academicYearId, boardId, educationMediumId, accessKey,
    ...(studentId ? { studentId } : {}) }, { skip: !hasContext || !authorized });

  return {
    ...query, data: hasContext && authorized ? query.currentData : undefined,
    hasContext, authorized, permissionsInitialized, permissions, studentId,
    selectStudent: (id: string) => setSelection({ contextKey, studentId: id }),
    contextLabel: [currentYear?.name, currentBoard?.name, currentMedium?.name].filter(Boolean).join(' / '),
  };
}
