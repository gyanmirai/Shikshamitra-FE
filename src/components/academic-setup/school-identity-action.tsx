import type { RootState } from 'src/redux/store';
import type { AcademicSetupNode } from './academic-setup-model';

import { useSelector } from 'react-redux';
import Button from '@mui/material/Button';
import { RouterLink } from 'src/routes/components';
import { hasGrantedPermission } from 'src/utils/permissions';
import { instituteSetupPaths, instituteSetupPermissions } from 'src/constants/institute-setup';

export function SchoolIdentityAction({ node }: { node: AcademicSetupNode }) {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  if (!['Education Board', 'Medium'].includes(node.type) || !hasGrantedPermission(permissions, instituteSetupPermissions.schoolIdentity)) return null;
  const boardId = node.type === 'Education Board' ? node.id : node.parentsData.board?.id;
  if (!boardId) return null;
  const query = new URLSearchParams({ boardId });
  if (node.parentsData.year?.id) query.set('academicYearId', node.parentsData.year.id);
  if (node.type === 'Medium') query.set('mediumId', node.id);
  return <Button component={RouterLink} href={`${instituteSetupPaths.schoolIdentity}?${query}`} sx={{ minHeight: 44 }}>School Identity</Button>;
}
