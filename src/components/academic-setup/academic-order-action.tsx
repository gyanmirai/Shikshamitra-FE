import type { RootState } from 'src/redux/store';

import { Button } from '@mui/material';
import { useSelector } from 'react-redux';
import { useBoolean } from 'src/hooks/use-boolean';
import SwapVert from '@mui/icons-material/SwapVert';

import { AcademicOrderDialog } from './academic-order-dialog';
import { academicOrderKinds, academicOrderLabels } from './academic-order-model';

import type { AcademicSetupNode } from './academic-setup-model';

export function AcademicOrderAction({ node }: { node: AcademicSetupNode }) {
  const dialog = useBoolean();
  const kind = academicOrderKinds[node.type];
  const canEdit = useSelector((state: RootState) =>
    state.auth.permissions.some(
      (permission: { name: string; isGranted: boolean }) =>
        permission.name === 'InstituteSetup.AcademicSetup.Edit' && permission.isGranted
    )
  );
  if (!canEdit || !kind || (!dialog.value && (node.children?.length ?? 0) < 2)) return null;
  return (
    <>
      {(node.children?.length ?? 0) >= 2 && (
        <Button
          type="button"
          size="small"
          variant="outlined"
          color="inherit"
          startIcon={<SwapVert fontSize="small" />}
          onClick={dialog.onTrue}
        >
          Reorder {academicOrderLabels[kind].plural}
        </Button>
      )}
      {dialog.value && (
        <AcademicOrderDialog
          key={node.id}
          parentId={node.id}
          parentName={node.name}
          kind={kind}
          items={node.children ?? []}
          onClose={dialog.onFalse}
        />
      )}
    </>
  );
}
