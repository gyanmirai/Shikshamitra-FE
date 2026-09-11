'use client';

import type { RootState } from 'src/redux/store';

import { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { Box, Card, Button } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector, useDispatch } from 'react-redux';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { financePermissions } from 'src/constants/finance-menu';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { useGenerateFeeStructureMutation } from 'src/redux/finance/financeFeeStructure';

import FeeStructureTable from './Components/FeeStructureTable';
import FeeStructureEditForm from './Components/FeeStructureEditForm';

import type { IFeeStructure } from './type';

export default function FeeStructure() {
  const [selected, setSelected] = useState<IFeeStructure | null>(null);
  const confirmClose = useBoolean();
  const workspace = useBoolean();
  const dispatch = useDispatch();
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const { permissions } = useSelector((state: RootState) => state.auth);
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const [generate, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useGenerateFeeStructureMutation,
  });
  const close = () => {
    setSelected(null);
    workspace.onFalse();
    confirmClose.onFalse();
    dispatch(setIsChanges(false));
  };
  const requestClose = () => {
    if (isChanges) confirmClose.onTrue();
    else close();
  };
  const open = (data: IFeeStructure) => {
    setSelected(data);
    workspace.onTrue();
  };
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <CustomBreadcrumbs
        heading={selected ? 'Manage Fee Structure' : 'Fee Structure'}
        description={
          selected
            ? 'Configure class fees, published Payment Terms and policy versions. Review readiness before publication.'
            : 'Manage class fee configurations and protected revisions for the selected academic year.'
        }
        isBack={!!selected}
        onBack={requestClose}
        links={[
          { name: 'Finance' },
          { name: 'Fees' },
          { name: 'Settings' },
          { name: 'Fee Structure' },
        ]}
        action={
          !selected &&
          hasGrantedPermission(
            permissions,
            financePermissions.fees.settings.feeStructureActions.create
          ) && (
            <LoadingButton
              size="small"
              variant="contained"
              loading={isLoading}
              disabled={!currentYear?.id}
              onClick={async () => {
                try {
                  await generate({ academicYearId: currentYear.id }).unwrap();
                  shikshaMitraToast.success({ message: 'Board and medium workspaces are ready.' });
                } catch {
                  /* Shared mutation hook displays the server error. */
                }
              }}
            >
              Refresh academic workspaces
            </LoadingButton>
          )
        }
      />
      {selected ? (
        <Card sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <FeeStructureEditForm editData={selected} onClose={requestClose} />
        </Card>
      ) : (
        <FeeStructureTable
          addFeeStructure={workspace}
          editData={selected}
          setEditData={setSelected}
          onEdit={open}
          onView={open}
        />
      )}
      <ConfirmDialog
        open={confirmClose.value}
        onClose={confirmClose.onFalse}
        title="Discard unsaved changes?"
        content="Your unsaved Fee Structure changes will be lost when you leave this workspace."
        action={
          <Button size="small" color="error" variant="contained" onClick={close}>
            Discard & leave
          </Button>
        }
      />
    </Box>
  );
}
