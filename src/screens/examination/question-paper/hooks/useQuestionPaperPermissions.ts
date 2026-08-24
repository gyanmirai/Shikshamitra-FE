import { useSelector } from 'react-redux';

import type { RootState } from 'src/redux/store';

import { academicPermissions } from 'src/constants/academic-menu';
import { hasGrantedPermission } from 'src/utils/permissions';

export function useQuestionPaperPermissions() {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const permission = academicPermissions.examination.questionPapers;

  return {
    canView: hasGrantedPermission(permissions, `${permission}.View`),
    canAdd: hasGrantedPermission(permissions, `${permission}.Add`),
    canDelete: hasGrantedPermission(permissions, `${permission}.Delete`),
  };
}
