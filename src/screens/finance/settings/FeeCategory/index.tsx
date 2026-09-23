'use client';

import type { RootState } from 'src/redux/store';

import { Add } from '@mui/icons-material';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import React, { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { Box, Card, Stack, Button, Typography } from '@mui/material';
import CustomTooltip from 'src/components/custom-tooltip';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { hasGrantedPermission } from 'src/utils/permissions';
import { financePermissions } from 'src/constants/finance-menu';
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
  const [open, setOpen] = useState(false); // Controls table dialog state

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

  const [queryParams, setQueryParams] = useState({ page: 1, pageSize: 10, search: '' });

  const handleServerPagination = useCallback((page: number, rowsPerPage: number) => {
    setQueryParams((prev) => ({ ...prev, page, pageSize: rowsPerPage }));
  }, []);

  const handleServerSearch = useCallback((search: string) => {
    setQueryParams((prev) => ({ ...prev, search, page: 1 }));
  }, []);

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
  const handleClose = (_e: any, isSubmit?: boolean) => {
    // Helper function to reset state after dialog closes
    const resetState = () => {
      setTimeout(() => {
        setSelectedFeeCategory(null);
        dispatch(setIsChanges(false));
      }, 200);
    };

    // If form was submitted or user confirms leaving with unsaved changes
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      addFeeCategoryDialog.onFalse();
      resetState();
    }
    // If no unsaved changes, simply close dialog
    else if (!isChanges) {
      addFeeCategoryDialog.onFalse();
      setTimeout(() => {
        setSelectedFeeCategory(null);
      }, 200);
    }
  };

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Fee Category"
        description="Manage all fee categories such as Academic, Hostel. Use the actions to edit or delete existing categories. Click ‘Add Fee Category’ to create a new one."
        links={[
          { name: 'Finance', href: '/finance/dashboard' },
          { name: 'Fees', href: '/finance/fee-collection' },
          { name: 'Settings' },
          { name: 'Fee Category' },
        ]}
        action={
          canAdd && archiveView === 'current' ? (
            <Button
              onClick={() => addFeeCategoryDialog.onTrue()}
              size="small"
              startIcon={<Add />}
              variant="contained"
              sx={{ px: '32px' }}
            >
              Fee Category
            </Button>
          ) : undefined
        }
      />

      <Card sx={{ p: 1, mb: 1.5 }}>
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
            endIcon={
              <Label color="default" variant="soft">
                {archivedSummary?.totalCount ?? 0}
              </Label>
            }
          >
            Archived
          </Button>
        </Stack>
      </Card>

      <FeeCategoryTable
        key={archiveView}
        archived={archiveView === 'archived'}
        open={open}
        onAddFeeCategory={addFeeCategoryDialog}
        setOpenDialog={setOpen}
        editData={selectedFeeCategory}
        setEditData={setSelectedFeeCategory}
        onServerPagination={handleServerPagination}
        onServerSearch={handleServerSearch}
        onView={(data) => {
          setSelectedFeeCategory(data);
          viewFeeCategoryDialog.onTrue();
        }}
      />

      {/* Add/Edit Dialog */}
      <CustomDialog
        open={addFeeCategoryDialog.value}
        handleClose={() => {
          addFeeCategoryDialog.onFalse();
          setTimeout(() => {
            setSelectedFeeCategory(null);
          }, 200);
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {selectedFeeCategory ? 'Update Fee Category' : 'Add Fee Category'}
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title={
                selectedFeeCategory
                  ? 'Update existing fee category by entering its name (e.g., Academic, Transport, Hostel).'
                  : 'Create a new fee category by entering its name (e.g., Academic, Transport, Hostel).'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        maxWidth="md"
      >
        <FeeCategoryForm
          open={addFeeCategoryDialog}
          onClose={handleClose}
          editData={selectedFeeCategory}
        />
      </CustomDialog>

      {/* View Details Dialog */}
      <CustomDialog
        open={viewFeeCategoryDialog.value}
        handleClose={() => {
          viewFeeCategoryDialog.onFalse();
          setTimeout(() => {
            setSelectedFeeCategory(null);
          }, 200);
        }}
        maxWidth="md"
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">View Fee Category Details</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="View detailed information about this fee category including mapped fee heads and concession rules."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        {selectedFeeCategory?.id && <FeeCategoryView id={selectedFeeCategory.id} />}
      </CustomDialog>
    </Box>
  );
};

export default FeeCategoryCreation;
