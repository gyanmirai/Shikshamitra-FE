import type { RootState } from 'src/redux/store';
import type { Standards, Organization } from 'src/types/school';

import { Button } from '@mui/material';
import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';

import { ClassForm } from './class-setup';
import { MediumForm } from './medium-form';
import { OrganizationForm } from './stage-form';
import { DivisionForm } from './division-setup';
import { NODE_TYPE_META } from './academic-setup-model';
import { AcademicFormDialog } from './academic-form-dialog';

import type { AcademicSetupNode } from './academic-setup-model';

export function AcademicSetupAddAction({
  node,
  onAddBoard,
}: {
  node: AcademicSetupNode;
  onAddBoard: () => void;
}) {
  const dialog = useBoolean();
  const canAdd = useSelector((state: RootState) =>
    state.auth.permissions.some(
      (permission: { name: string; isGranted: boolean }) =>
        permission.name === 'InstituteSetup.AcademicSetup.Add' && permission.isGranted
    )
  );
  if (!canAdd || node.type === 'Division') return null;

  const { addLabel } = NODE_TYPE_META[node.type];
  const childLabel = addLabel.replace(/^Add\s+/i, '');
  const form =
    node.type === 'Education Board' ? (
      <MediumForm handleClose={dialog.onFalse} editData={null} boardId={node.id} />
    ) : node.type === 'Medium' ? (
      <OrganizationForm handleClose={dialog.onFalse} editData={null} mediumId={node.id} />
    ) : node.type === 'Organization' ? (
      <ClassForm
        handleClose={dialog.onFalse}
        editData={null}
        organizationId={node.id}
        existingStandards={(node.data as Organization).standards}
      />
    ) : node.type === 'Standard' ? (
      <DivisionForm
        handleClose={dialog.onFalse}
        editData={null}
        classId={node.id}
        existingDivisions={(node.data as Standards).divisions}
      />
    ) : null;
  const kind =
    node.type === 'Education Board'
      ? 'medium'
      : node.type === 'Medium'
        ? 'stage'
        : node.type === 'Organization'
          ? 'standard'
          : 'division';

  return (
    <>
      <Button
        type="button"
        size="small"
        variant="contained"
        aria-label={addLabel}
        startIcon={<Iconify icon="mingcute:add-line" width={16} aria-hidden />}
        onClick={node.type === 'Academic Year' ? onAddBoard : dialog.onTrue}
      >
        {childLabel.replace(/^./, (letter) => letter.toUpperCase())}
      </Button>
      {form && (
        <AcademicFormDialog
          kind={kind}
          title={`Add ${childLabel.replace(/^./, (letter) => letter.toUpperCase())} to ${node.name}`}
          handleClose={dialog.onFalse}
          open={dialog.value}
        >
          {form}
        </AcademicFormDialog>
      )}
    </>
  );
}
