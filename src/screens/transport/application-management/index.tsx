'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { Add } from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/useBoolean';
import { useDispatch, useSelector } from 'react-redux';
import CustomDialog from 'src/components/custom-dialog';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Card, Button, Typography } from '@mui/material';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirm-popup/confirmPopupSlice';
import { useGetTransportMembersQuery } from 'src/redux/transport/vehicle-management/member-manage-api';

// import TransportRequestForm from './transport-request-form';
import TransportRequestTable from './components/TransportRequestTable';
import TransportApplicationStepper from './components/TransportRequestForm';
import TransportReasonForm from './components/transport-application-details/TransportReasonForm';
import ChangeStopRequestForm from './components/transport-application-details/ChangeRequestForm';
import TransportApplicationDetail from './components/transport-application-details/TransportApplicationDetail';

import type { ITransportApplicationPayload } from './type';

const TransportRequests = () => {
  const dispatch = useDispatch();
  const confirmDialog = useBoolean();
  const viewDialog = useBoolean();
  const onConfirmDialog = useBoolean();
  const [selectedMode, setSelectedMode] = useState('');
  const [openForm, setOpenForm] = useState(false);
  const [editingRequest, setEditingRequest] = useState<ITransportApplicationPayload | null>(null);
  const changeStopDialog = useBoolean();
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  // Fetch data
  const { data: requestData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetTransportMembersQuery,
  });

  const handleReasonDialogClose = (_e: any, isSubmit?: boolean) => {
    const reset = () => {
      setTimeout(() => {
        onConfirmDialog.onFalse();
        setSelectedMode('');
        dispatch(setIsChanges(false));
      }, 200);
    };

    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      reset();
    } else if (!isChanges) {
      reset();
    }
  };

  // Close dialog
  const handleClose = (_e: any, isSubmit?: boolean) => {
    const reset = () => {
      setTimeout(() => {
        viewDialog.onFalse();
        onConfirmDialog.onFalse();
        setSelectedMode('');
        setEditingRequest(null);
        setOpenForm(false);
        dispatch(setIsChanges(false));
      }, 200);
    };

    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      reset();
    } else if (!isChanges) {
      reset();
    }
  };

  return (
    <Box height="100%" display="flex" flexDirection="column">
      {openForm ? (
        <CustomBreadcrumbs
          heading={editingRequest ? 'Update Transport Request' : 'Add Transport Request'}
          description={
            editingRequest
              ? 'Modify the transport request details such as route, pickup point, and timing.'
              : 'Create a new transport request for student or staff pickup and drop.'
          }
          links={[
            { name: 'Transport', href: '/transport/dashboard' },
            { name: 'Application Management' },
            { name: editingRequest ? 'Update Transport Request' : 'Add Transport Request' },
          ]}
          isBack
          onBack={() => handleClose(null, false)}
        />
      ) : viewDialog.value ? (
        <CustomBreadcrumbs
          heading="Review Application"
          description="This modal allows you to assign a transport route to the selected student."
          links={[
            { name: 'Transport', href: '/transport/dashboard' },
            { name: 'Application Management' },
            { name: 'Review Application' },
          ]}
          isBack
          onBack={() => handleClose(null, false)}
        />
      ) : (
        <CustomBreadcrumbs
          heading="Application Management"
          description="View and manage all transport requests from students or staff. Approve, hold, or reject requests as needed."
          links={[
            { name: 'Transport', href: '/transport/dashboard' },
            { name: 'Application Management' },
          ]}
          action={
            <Button
              size="small"
              startIcon={<Add />}
              variant="contained"
              onClick={() => setOpenForm(true)}
              sx={{ px: '32px' }}
            >
              Transport Application
            </Button>
          }
          sx={{ px: 1 }}
        />
      )}

      {openForm ? (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
          <TransportApplicationStepper selectedApplication={editingRequest} onClose={handleClose} />
        </Card>
      ) : viewDialog.value ? (
        <Card sx={{ height: '100%', boxShadow: 'none' }}>
          <TransportApplicationDetail
            selectedApplication={editingRequest}
            onApprove={() => {
              setSelectedMode('Approve');
              onConfirmDialog.onTrue();
            }}
            onReject={() => {
              setSelectedMode('Reject');
              onConfirmDialog.onTrue();
            }}
            onHold={() => {
              setSelectedMode('Hold');
              onConfirmDialog.onTrue();
            }}
          />
        </Card>
      ) : (
        <TransportRequestTable
          data={requestData || []}
          onDelete={(row) => {
            confirmDialog.onTrue();
            setEditingRequest(row);
          }}
          onView={(row) => {
            viewDialog.onTrue();
            setEditingRequest(row);
          }}
          onChangeStop={(row) => {
            setEditingRequest(row);
            changeStopDialog.onTrue();
          }}
        />
      )}

      <ConfirmDialog
        open={confirmDialog.value}
        onClose={() => {
          setEditingRequest(null);
          confirmDialog.onFalse();
        }}
        title="Remove"
        content={
          <>
            Are you sure you want to remove transport request for{' '}
            <strong>{editingRequest?.name}</strong>?
          </>
        }
        action={
          <Button
            // startIcon={<Iconify icon={GlobalIcons.delete} />}
            variant="contained"
            color="error"
            size="small"
            onClick={() => {
              confirmDialog.onFalse();
              shikshaMitraToast.success({
                message: `Transport request for "${editingRequest?.name}" removed successfullly`,
              });
              setEditingRequest(null);
            }}
          >
            Yes
          </Button>
        }
      />

      <CustomDialog
        open={onConfirmDialog.value}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {selectedMode === 'Approve'
                ? 'Approve Application'
                : selectedMode === 'Reject'
                  ? 'Reject Application'
                  : 'Hold Application'}
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title={
                selectedMode === 'Approve'
                  ? 'Approve the transport application to confirm route assignment.'
                  : selectedMode === 'Reject'
                    ? 'Reject the transport application with a reason.'
                    : 'Hold the transport application for further review.'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        handleClose={() => {
          onConfirmDialog.onFalse();
          setSelectedMode('');
        }}
        maxWidth="xs"
      >
        <TransportReasonForm onClose={handleReasonDialogClose} mode={selectedMode} />
      </CustomDialog>

      <CustomDialog
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Change Stop Request</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="Request a stop change for the selected route with arrival and departure times"
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        open={changeStopDialog.value}
        maxWidth="md"
        handleClose={() => {
          changeStopDialog.onFalse();
          setEditingRequest(null);
        }}
      >
        <ChangeStopRequestForm
          onClose={() => {
            changeStopDialog.onFalse();
            setEditingRequest(null);
          }}
          selectedApplication={editingRequest}
        />
      </CustomDialog>
    </Box>
  );
};

export default TransportRequests;
