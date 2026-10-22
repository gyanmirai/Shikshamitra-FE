'use client';

import type { RootState } from 'src/redux/store';

import { useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useFinanceFormClose } from 'src/hooks/use-finance-form-close';
import { useDispatch, useSelector } from 'react-redux';
import { hasGrantedPermission } from 'src/utils/permissions';
import { financePermissions } from 'src/constants/finance-menu';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Card, Stack, Button, DialogActions } from '@mui/material';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { useGetFeeCategoriesQuery } from 'src/redux/feeCategory/feeCategoryApi';

import FeeCategoryForm from './Components/FeeCategoryForm';
import FeeCategoryView from './Components/FeeCategoryView';
import FeeCategoryTable from './Components/FeeCategoryTable';

import type { IFeeCategory } from './Components/type';

const FeeCategoryCreation = () => {
  const [archiveView, setArchiveView] = useState<'current' | 'archived'>('current');
  // Dialog control states
  const addFeeCategoryDialog = useBoolean(); // Controls add/edit fee category dialog
  const viewFeeCategoryDialog = useBoolean(); // Controls view details dialog

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

  // State to store currently selected fee category for edit/delete/view operations
  const [selectedFeeCategory, setSelectedFeeCategory] = useState<IFeeCategory | null>(null);

  const dispatch = useDispatch();

  const handleCloseDetails = () => {
    viewFeeCategoryDialog.onFalse();
    setSelectedFeeCategory(null);
  };

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
    <Box sx={{ height: 1, minHeight: 0, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Fee Category"
        description="Organize fee heads into categories and manage their status."
        links={[
          { name: 'Finance', href: '/finance/dashboard' },
          { name: 'Fees', href: '/finance/fee-collection' },
          { name: 'Settings' },
          { name: 'Fee Category' },
        ]}
        action={
          canAdd && archiveView === 'current' ? (
            <Button
              onClick={() => {
                setSelectedFeeCategory(null);
                dispatch(setIsChanges(false));
                addFeeCategoryDialog.onTrue();
              }}
              aria-label="Add Fee Category"
              size="small"
              startIcon={<Iconify icon={GlobalIcons.addIcon} />}
              variant="contained"
            >
              Fee Category
            </Button>
          ) : undefined
        }
      />

      <Card sx={{ p: 1, mb: 1, flexShrink: 0 }}>
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
      </Card>

      <Box sx={{ flex: 1, minHeight: 0, minWidth: 0, overflow: 'hidden' }}>
        <FeeCategoryTable
          key={archiveView}
          archived={archiveView === 'archived'}
          onAddFeeCategory={addFeeCategoryDialog}
          setEditData={setSelectedFeeCategory}
          onView={(data) => {
            setSelectedFeeCategory(data);
            viewFeeCategoryDialog.onTrue();
          }}
        />
      </Box>

      {confirmation}
      {addFeeCategoryDialog.value && (
        <FeeCategoryForm
          open={addFeeCategoryDialog}
          onClose={handleClose}
          editData={selectedFeeCategory}
          onBusyChange={setFormBusy}
        />
      )}

      {/* View Details Dialog */}
      <CustomDialog
        open={viewFeeCategoryDialog.value}
        handleClose={handleCloseDetails}
        maxWidth="md"
        title="View Fee Category Details"
        titleInfo="View this fee category, its mapped fee heads, and their concession settings."
        hasForm={false}
        guardUnsavedChanges={false}
      >
        <DialogScrollContent sx={{ p: 2 }} scrollBarProps={{ sx: { flex: 1, minHeight: 0 } }}>
          {selectedFeeCategory?.id && <FeeCategoryView id={selectedFeeCategory.id} />}
        </DialogScrollContent>
        <DialogActions>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
            onClick={handleCloseDetails}
          >
            Close
          </Button>
        </DialogActions>
      </CustomDialog>
    </Box>
  );
};

export default FeeCategoryCreation;
