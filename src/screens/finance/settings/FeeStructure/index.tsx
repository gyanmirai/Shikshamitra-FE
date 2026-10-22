'use client';

import type { RootState } from 'src/redux/store';

import { useState } from 'react';
import { Box } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector, useDispatch } from 'react-redux';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { financePermissions } from 'src/constants/finance-menu';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { useGenerateFeeStructureMutation } from 'src/redux/finance/financeFeeStructure';

import FeeStructureTable from './Components/FeeStructureTable';
import FeeStructureWorkspaceDialog from './Components/FeeStructureWorkspaceDialog';

import type { IFeeStructure } from './type';

export default function FeeStructure() {
  const [selected, setSelected] = useState<IFeeStructure | null>(null);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const workspace = useBoolean();
  const dispatch = useDispatch();
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const { permissions } = useSelector((state: RootState) => state.auth);
  const [generate, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useGenerateFeeStructureMutation,
  });
  const close = () => {
    setSelected(null);
    setIsViewOnly(false);
    workspace.onFalse();
    dispatch(setIsChanges(false));
  };
  const openEdit = (data: IFeeStructure) => {
    setSelected(data);
    setIsViewOnly(false);
    workspace.onTrue();
  };
  const openView = (data: IFeeStructure) => {
    setSelected(data);
    setIsViewOnly(true);
    workspace.onTrue();
  };
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <CustomBreadcrumbs
        description="Manage class fee configurations and protected revisions for the selected academic year."
        heading="Fee Structure"

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
              startIcon={<Iconify icon={GlobalIcons.refresh} />}
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
      {!selected && (
        <FeeStructureTable
          addFeeStructure={workspace}
          editData={selected}
          setEditData={setSelected}
          onEdit={openEdit}
          onView={openView}
        />
      )}
      {selected && (
        <FeeStructureWorkspaceDialog editData={selected} viewOnly={isViewOnly} onClose={close} />
      )}
    </Box>
  );
}
