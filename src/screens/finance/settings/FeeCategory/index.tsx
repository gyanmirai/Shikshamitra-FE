'use client';

import type { RootState } from 'src/redux/store';

import { useState } from 'react';
import { Add } from '@mui/icons-material';
import { Box, Card, Stack, Button } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';

import { useBoolean } from 'src/hooks/use-boolean';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { hasGrantedPermission } from 'src/utils/permissions';
import { financePermissions } from 'src/constants/finance-menu';
import { useFinanceFormClose } from 'src/hooks/use-finance-form-close';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { useGetFeeCategoriesQuery } from 'src/redux/feeCategory/feeCategoryApi';

import FeeCategoryForm from './Components/FeeCategoryForm';
import FeeCategoryTable from './Components/FeeCategoryTable';

import type { IFeeCategory } from './Components/type';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';

const FeeCategoryCreation = () => {
  const [archiveView, setArchiveView] = useState<'current' | 'archived'>('current');
  // Dialog control states
  const addFeeCategoryDialog = useBoolean(); // Controls add/edit fee category dialog

  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canAdd = hasGrantedPermission(
    permissions,
    financePermissions.fees.settings.feeCategoryActions.add
  );
  const academicYearId = currentYear?.id ?? '';
  const { data: archivedSummary } = useGetFeeCategoriesQuery(
    {
      academicYearId,
      page: 1,
      pageSize: 1,
      isActive: false,
    },
    { skip: !academicYearId }
  );

  // Global state for tracking unsaved changes
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  // State to store currently selected fee category for edit/delete/view operations
  const [selectedFeeCategory, setSelectedFeeCategory] = useState<IFeeCategory | null>(null);

  const dispatch = useDispatch();

  /**
   * Handles closing of add/edit fee category dialog
   * @param _e - Event object
   * @param isSubmit - Boolean indicating if form was submitted
   */
  const [formBusy, setFormBusy] = useState(false);
  const { handleClose, confirmation } = useFinanceFormClose(
    addFeeCategoryDialog.value,
    () => {
      addFeeCategoryDialog.onFalse();
      setSelectedFeeCategory(null);
    },
    formBusy
  );

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomTooltip
        arrow
        placement="right"
        sx={{ textAlign: 'justify' }}
        title="View detailed information about this fee category including mapped fee heads and concession rules."
      >
        <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
      </CustomTooltip>

      <CustomBreadcrumbs
        description="Organize fee heads into categories and manage their status."
        heading="Fee Category"
        links={[
          { name: 'Finance', href: '/finance/dashboard' },
          { name: 'Fees', href: '/finance/fee-collection' },
          { name: 'Settings' },
          { name: 'Fee Category' },
        ]}
      />

      <Card sx={{ p: 1, mb: 1.5 }}>
        <Stack direction="row" alignItems="center" flexWrap="wrap" gap={1}>
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant={archiveView === 'current' ? 'contained' : 'outlined'}
              onClick={() => setArchiveView('current')}
            >
              Current
            </Button>
            <Button
              size="small"
              variant={archiveView === 'archived' ? 'contained' : 'outlined'}
              onClick={() => setArchiveView('archived')}
            >
              Archived ({archivedSummary?.totalCount ?? 0})
            </Button>
          </Stack>
          {canAdd && archiveView === 'current' && (
            <Button
              onClick={() => {
                setSelectedFeeCategory(null);
                dispatch(setIsChanges(false));
                addFeeCategoryDialog.onTrue();
              }}
              aria-label="Add Fee Category"
              size="small"
              startIcon={<Add />}
              variant="contained"
              sx={{ ml: 'auto', px: 4 }}
            >
              Fee Category
            </Button>
          )}
        </Stack>
      </Card>

      <FeeCategoryTable
        key={archiveView}
        archived={archiveView === 'archived'}
        onAddFeeCategory={addFeeCategoryDialog}
        setEditData={setSelectedFeeCategory}
      />

      {confirmation}
      {addFeeCategoryDialog.value && (
        <FeeCategoryForm
          open={addFeeCategoryDialog}
          onClose={handleClose}
          editData={selectedFeeCategory}
          onBusyChange={setFormBusy}
        />
      )}
    </Box>
  );
};

export default FeeCategoryCreation;
