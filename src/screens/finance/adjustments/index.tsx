'use client';

import type { RootState } from 'src/redux/store';

import { useState } from 'react';
import { Add } from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector, useDispatch } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Card, Button, Typography } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { useLazyGetFeeAdjustmentQuery } from 'src/redux/finance/adjustments/adjustmentApi';

import { useAdjustment } from './hooks/useAdjustment';
import AdjustmentForm from './components/AdjustmentForm';
import AdjustmentView from './components/AdjustmentView';
import AdjustmentTable from './components/AdjustmentTable';
import ApplyAdjustmentDialog from './components/ApplyAdjustmentDialog';
import { mapDetailToAdjustmentRequest } from './utils/mapAdjustmentDetail';
import { AdjustmentTabEnum, AdjustmentStatusEnum } from './enums/adjustment.enum';
import AdjustmentApproveRejectForm from './components/AdjustmentApproveRejectForm';

import type { AdjustmentRequest } from './types/adjustment.types';
import type { IAdjustmentFullFormValues } from './types/adjustmentFormValues';

const Adjustments = () => {
  const [activeTab, setActiveTab] = useState(AdjustmentTabEnum.Pending);
  const [selectedAdjustment, setSelectedAdjustment] = useState<AdjustmentRequest | null>(null);

  const addDialog = useBoolean();
  const viewDialog = useBoolean();
  const confirmDialog = useBoolean();
  const applyDialog = useBoolean();

  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  const currentUserId = user?.id ?? '';
  const currentUserName = user?.name ?? user?.userName ?? 'User';

  const { tabCounts, createAdjustment, rejectAdjustment, refetch } = useAdjustment(activeTab);

  const [fetchDetail] = useLazyGetFeeAdjustmentQuery();

  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are you sure to leave this page?'))) {
      addDialog.onFalse();
      viewDialog.onFalse();
      setSelectedAdjustment(null);
      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      addDialog.onFalse();
      viewDialog.onFalse();
      setSelectedAdjustment(null);
    }
  };

  const handleConfirmClose = async (_e: any, isSubmit?: boolean, notes?: string) => {
    if (isSubmit && selectedAdjustment) {
      try {
        await rejectAdjustment(selectedAdjustment.id, currentUserName, notes ?? '');
        shikshaMitraToast.success({ message: 'Adjustment request rejected.' });
        confirmDialog.onFalse();
        viewDialog.onFalse();
        setSelectedAdjustment(null);
        refetch();
      } catch (err: any) {
        shikshaMitraToast.error({
          message: err?.data?.error?.message || 'Failed to reject adjustment.',
        });
      }
    } else {
      confirmDialog.onFalse();
    }
  };

  const handleFormSubmit = async (values: IAdjustmentFullFormValues) => {
    try {
      await createAdjustment(values);
      shikshaMitraToast.success({ message: 'Adjustment request submitted successfully.' });
      handleClose(null, true);
      refetch();
    } catch (err: any) {
      shikshaMitraToast.error({
        message: err?.data?.error?.message || 'Failed to submit adjustment request.',
      });
    }
  };

  const handleView = async (row: AdjustmentRequest) => {
    try {
      const detail = await fetchDetail(row.id).unwrap();
      setSelectedAdjustment(mapDetailToAdjustmentRequest(detail));
      viewDialog.onTrue();
    } catch (err: any) {
      shikshaMitraToast.error({
        message: err?.data?.error?.message || 'Failed to load adjustment details.',
      });
    }
  };

  const canApprove =
    (selectedAdjustment?.status === AdjustmentStatusEnum.Pending ||
      selectedAdjustment?.status === AdjustmentStatusEnum.PartiallyApplied) &&
    selectedAdjustment.requestedByUserId !== currentUserId;

  const renderBreadcrumbs = () => {
    if (addDialog.value) {
      return (
        <CustomBreadcrumbs
          heading="Create Adjustment"
          description="Fill in the adjustment details against the student's paid fee records."
          links={[
            { name: 'Finance', href: '/finance/dashboard' },
            {
              name: 'Adjustments',
              href: '/finance/adjustments',
              onClick() {
                addDialog.onFalse();
                setSelectedAdjustment(null);
              },
            },
            { name: 'Create Adjustment' },
          ]}
          isBack={addDialog.value}
          onBack={() => handleClose(null, false)}
        />
      );
    }

    if (viewDialog.value) {
      return (
        <CustomBreadcrumbs
          heading="View Adjustment"
          description="Review the adjustment request details and take an approval action."
          links={[
            { name: 'Finance', href: '/finance/dashboard' },
            {
              name: 'Adjustments',
              href: '/finance/adjustments',
              onClick() {
                viewDialog.onFalse();
                setSelectedAdjustment(null);
              },
            },
            { name: 'View Adjustment' },
          ]}
          isBack={viewDialog.value}
          onBack={() => {
            viewDialog.onFalse();
            setSelectedAdjustment(null);
          }}
        />
      );
    }

    return (
      <CustomBreadcrumbs
        heading="Adjustments"
        description="Manage fee adjustment requests — create, review, and approve or reject adjustments against paid student fees."
        links={[{ name: 'Finance', href: '/finance/dashboard' }, { name: 'Adjustments' }]}
        action={
          <Button
            size="small"
            variant="contained"
            startIcon={<Add />}
            sx={{ px: '32px' }}
            onClick={() => {
              addDialog.onTrue();
            }}
          >
            New Adjustment
          </Button>
        }
      />
    );
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {renderBreadcrumbs()}

      {!addDialog.value && !viewDialog.value && (
        <AdjustmentTable
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabCounts={tabCounts}
          onCreateAdjustment={() => addDialog.onTrue()}
          onView={handleView}
        />
      )}

      {addDialog.value && (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
          <AdjustmentForm onCancel={handleClose} onSubmit={handleFormSubmit} />
        </Card>
      )}

      {viewDialog.value && selectedAdjustment && (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
          <AdjustmentView
            student={selectedAdjustment}
            onClose={() => {
              viewDialog.onFalse();
              setSelectedAdjustment(null);
            }}
            onApprove={() => {
              applyDialog.onTrue();
            }}
            onReject={() => {
              confirmDialog.onTrue();
            }}
            showApprove={canApprove}
            showReject={selectedAdjustment.status === AdjustmentStatusEnum.Pending}
          />
        </Card>
      )}

      <ApplyAdjustmentDialog
        open={applyDialog.value}
        approvedBy={currentUserName}
        adjustment={selectedAdjustment}
        onClose={() => {
          applyDialog.onFalse();
        }}
        onApplied={async () => {
          applyDialog.onFalse();
          viewDialog.onFalse();
          setSelectedAdjustment(null);
          refetch();
        }}
      />

      <CustomDialog
        open={confirmDialog.value}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Reject Adjustment</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="Reject this adjustment request. A rejection reason is required."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        handleClose={() => {
          confirmDialog.onFalse();
        }}
        maxWidth="xs"
      >
        <AdjustmentApproveRejectForm mode="Reject" onClose={handleConfirmClose} />
      </CustomDialog>
    </Box>
  );
};

export default Adjustments;
