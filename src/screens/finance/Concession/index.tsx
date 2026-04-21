'use client';

import type { RootState } from 'src/redux/store';

import { useState } from 'react';
import { Add } from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import { useDispatch, useSelector } from 'react-redux';
import CustomTooltip from 'src/components/custom-tooltip';
import { financePaths } from 'src/constants/finance-menu';
import { Box, Card, Button, Typography } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import ReasonApprovalForm from './Components/ConcessionRequestApprove';
import StudentConcessionTable from './Components/StudentConcessionTable';
import NewConcessionRequestForm from './Components/NewConcessionRequest';
import ViewConcessionRequest from '../ConcessionAdmin/ConcessionAdminViewForm';

import type { IStudentInfo } from './type';

const Concession = () => {
  // Redux state and dispatch
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  // Redux dispatch function for dispatching actions to update the store
  const dispatch = useDispatch();
  // Boolean state to control the visibility of add concession request modal/form
  const addConcessionRequest = useBoolean();
  const viewConcessionRequest = useBoolean();
  const onViewAllConcession = useBoolean();

  const [selectedConcession, setSelectedConcession] = useState<IStudentInfo | null>(null);

  const onConfirmDialg = useBoolean();
  const [selectedMode, setSelectedMode] = useState('');

  // Board/medium state lifted here so it survives form open/close cycles
  const [selectedBoard, setSelectedBoard] = useState<string>('');
  const [selectedMedium, setSelectedMedium] = useState<string>('');

  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are u sure to leave this page ?'))) {
      addConcessionRequest.onFalse();
      viewConcessionRequest.onFalse();
      setSelectedConcession(null);
      dispatch(setIsChanges(false));
      onConfirmDialg.onFalse();
      setSelectedMode('');
    } else if (!isChanges) {
      addConcessionRequest.onFalse();
      viewConcessionRequest.onFalse();
      setSelectedConcession(null);
      onConfirmDialg.onFalse();
      setSelectedMode('');
    }
  };

  // State to store th  e selected student concession data
  // null when no student is selected
  const [selectedConcessionForView, setSelectedConcessionForView] = useState<IStudentInfo | null>(
    null
  );

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {addConcessionRequest.value ? (
        <CustomBreadcrumbs
          heading="Concession Request"
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
            { name: 'Concession Request' },
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
            <Button
              onClick={() => addConcessionRequest.onTrue()}
              size="small"
              startIcon={<Add />}
              variant="contained"
              sx={{ px: '32px' }}
            >
              Request Concession
            </Button>
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
          onApprove={(data) => {
            onConfirmDialg.onTrue();
            setSelectedMode('Approve');
            setSelectedConcession(data);
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
          selectedBoard={selectedBoard}
          selectedMedium={selectedMedium}
          onBoardChange={(val) => {
            setSelectedBoard(val);
            setSelectedMedium('');
          }}
          onMediumChange={setSelectedMedium}
        />
      )}

      {/* Show add request form when add dialog is open */}
      {addConcessionRequest.value && (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
          <NewConcessionRequestForm
            open={addConcessionRequest.value}
            onClose={handleClose}
            student={selectedConcession as IStudentInfo}
            editData={selectedConcession as any}
          />
        </Card>
      )}

      {/* Show view request form when view dialog is open */}
      {viewConcessionRequest.value && (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
          <ViewConcessionRequest
            student={selectedConcessionForView}
            onClose={() => {
              viewConcessionRequest.onFalse();
              setSelectedConcessionForView(null);
            }}
          />
        </Card>
      )}

      {/* Approve Concession Dialog */}
      <CustomDialog
        open={onConfirmDialg.value}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {selectedMode === 'Approve' ? 'Approve Concession' : 'Reject Concession'}
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title={
                selectedMode === 'Approve'
                  ? "Approve the student's concession request"
                  : "Reject the student's concession request"
              }
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
    </Box>
  );
};

export default Concession;
