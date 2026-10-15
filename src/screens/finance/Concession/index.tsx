'use client';

import type { RootState } from 'src/redux/store';

import { useState } from 'react';
import { Add } from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import { useDispatch, useSelector } from 'react-redux';
import CustomTooltip from 'src/components/custom-tooltip';
import { hasGrantedPermission } from 'src/utils/permissions';
import { Box, Card, Button, Typography } from '@mui/material';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { financePaths, financePermissions } from 'src/constants/finance-menu';
import { useFinanceAcademicFilters } from 'src/screens/finance/hooks/useFinanceAcademicFilters';

import ConcessionRequestForm from './Components/ConcessionRequestForm';
import ReasonApprovalForm from './Components/ConcessionRequestApprove';
import StudentConcessionTable from './Components/StudentConcessionTable';
import ViewConcessionRequest from '../ConcessionAdmin/ConcessionAdminViewForm';

import type { IStudentInfo } from './type';

const Concession = () => {
  // Redux state and dispatch
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canAdd = hasGrantedPermission(permissions, financePermissions.fees.concessionActions.add);
  // Redux dispatch function for dispatching actions to update the store
  const dispatch = useDispatch();
  // Boolean state to control the visibility of add concession request modal/form
  const addConcessionRequest = useBoolean();
  const viewConcessionRequest = useBoolean();
  const onViewAllConcession = useBoolean();
  const academicFilters = useFinanceAcademicFilters();

  const [selectedConcession, setSelectedConcession] = useState<IStudentInfo | null>(null);

  const onConfirmDialg = useBoolean();
  const confirmClose = useBoolean();
  const [selectedMode, setSelectedMode] = useState('');

  const completeClose = () => {
    addConcessionRequest.onFalse();
    viewConcessionRequest.onFalse();
    setSelectedConcession(null);
    dispatch(setIsChanges(false));
    onConfirmDialg.onFalse();
    confirmClose.onFalse();
    setSelectedMode('');
  };

  const handleClose = (_e?: unknown, isSubmit?: boolean) => {
    if (!isSubmit && isChanges) {
      confirmClose.onTrue();
      return;
    }

    completeClose();
  };

  // State to store the selected student concession data
  // null when no student is selected
  const [selectedConcessionForView, setSelectedConcessionForView] = useState<IStudentInfo | null>(
    null
  );

  return (
    <Box
      sx={{
        height: '100%',
        minHeight: 0,
        overflow:
          !addConcessionRequest.value && !viewConcessionRequest.value ? 'hidden' : undefined,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {addConcessionRequest.value ? (
        <CustomBreadcrumbs
          heading={
            selectedConcession?.sourceRequestId
              ? 'Replacement Concession Request'
              : selectedConcession
                ? 'Update Concession Request'
                : 'Concession Request'
          }
          description="View and manage student concession requests."
          links={[
            { name: 'Finance', href: financePaths.dashboard },
            { name: 'Fees', href: financePaths.concession },
            {
              name: 'Concessions',
              href: financePaths.concession,
              onClick(e) {
                handleClose(null, false);
              },
            },
            {
              name: selectedConcession?.sourceRequestId
                ? 'Replacement Concession Request'
                : selectedConcession
                  ? 'Update Concession Request'
                  : 'Concession Request',
            },
          ]}
          isBack
          onBack={() => {
            handleClose(null, false);
          }}
        />
      ) : viewConcessionRequest.value ? (
        <CustomBreadcrumbs
          heading="View Concession"
          description="View and manage student concession requests."
          links={[
            { name: 'Finance', href: financePaths.dashboard },
            { name: 'Fees', href: financePaths.concession },
            {
              name: 'Concessions',
              href: financePaths.concession,
              onClick(e) {
                viewConcessionRequest.onFalse();
                setSelectedConcessionForView(null);
              },
            },
            { name: 'View Concession' },
          ]}
          isBack
          onBack={() => {
            handleClose(null, false);
          }}
        />
      ) : (
        <CustomBreadcrumbs
          heading="Concessions"
          description="View and manage student concession requests."
          links={[
            { name: 'Finance', href: financePaths.dashboard },
            { name: 'Fees', href: financePaths.concession },
            { name: 'Concessions', href: financePaths.concession },
          ]}
          action={
            canAdd ? (
              <Button
                onClick={() => addConcessionRequest.onTrue()}
                size="small"
                startIcon={<Add />}
                variant="contained"
                sx={{ px: '32px' }}
              >
                Request Concession
              </Button>
            ) : undefined
          }
        />
      )}

      {/* Show table only when no dialog is open */}
      {!addConcessionRequest.value && !viewConcessionRequest.value && (
        <StudentConcessionTable
          onRequestConcession={(data) => {
            setSelectedConcession(data);
            addConcessionRequest.onTrue();
          }}
          onViewConcession={(data) => {
            setSelectedConcessionForView(data);
            viewConcessionRequest.onTrue();
          }}
          onViewAllConcession={(data) => {
            setSelectedConcession(data);
            onViewAllConcession.onTrue();
          }}
          onReject={(data) => {
            onConfirmDialg.onTrue();
            setSelectedMode('Reject');
            setSelectedConcession(data);
          }}
          onAddConcession={() => {
            setSelectedConcession(null);
            addConcessionRequest.onTrue();
          }}
          onEditConcession={(data) => {
            setSelectedConcession(data);
            addConcessionRequest.onTrue();
          }}
          academicFilters={academicFilters}
        />
      )}

      {/* Show add request form when add dialog is open */}
      {addConcessionRequest.value && (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
          <ConcessionRequestForm
            open={addConcessionRequest.value}
            onClose={handleClose}
            student={selectedConcession as IStudentInfo}
            editData={selectedConcession as any}
            defaultBoardId={academicFilters.selectedBoard}
            defaultMediumId={academicFilters.selectedMedium}
            defaultStandardId={
              academicFilters.selectedStandardId !== 'All Classes'
                ? academicFilters.selectedStandardId
                : ''
            }
            defaultDivisionId={
              academicFilters.selectedDivisionId !== 'All Divisions'
                ? academicFilters.selectedDivisionId
                : ''
            }
          />
        </Card>
      )}

      {/* Show view request form when view dialog is open */}
      {viewConcessionRequest.value && (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
          <ViewConcessionRequest
            student={selectedConcessionForView}
            onEdit={() => {
              setSelectedConcession(selectedConcessionForView);
              viewConcessionRequest.onFalse();
              addConcessionRequest.onTrue();
            }}
            onClose={() => {
              viewConcessionRequest.onFalse();
              setSelectedConcessionForView(null);
            }}
          />
        </Card>
      )}

      {/* Rejection reason dialog. Approval always uses the fee-head allocation review. */}
      <CustomDialog
        open={onConfirmDialg.value}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Reject Concession</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="Reject the student's concession request"
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        handleClose={() => {
          onConfirmDialg.onFalse();
          setSelectedMode('');
          setSelectedConcession(null);
        }}
        maxWidth="xs"
      >
        <ReasonApprovalForm
          onClose={handleClose}
          mode={selectedMode}
          selectedConcession={selectedConcession}
        />
      </CustomDialog>
      <ConfirmDialog
        open={confirmClose.value}
        onClose={confirmClose.onFalse}
        title="Discard unsaved changes?"
        content="Your unsaved concession request changes will be lost when you leave this form."
        icon="warning"
        action={
          <Button
            startIcon={<Iconify icon="mdi:exit-to-app" />}
            color="error"
            variant="contained"
            onClick={completeClose}
          >
            Discard & leave
          </Button>
        }
      />
    </Box>
  );
};

export default Concession;
