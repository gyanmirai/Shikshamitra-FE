'use client';

import type { RootState } from 'src/redux/store';
import type { Board, Medium } from 'src/types/school';

import { Add } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import { useDispatch, useSelector } from 'react-redux';
import CustomSelect from 'src/components/custom-select';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Card, Button, Typography } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import ReasonApprovalForm from './Components/ConcessionRequestApprove';
import StudentConcessionTable from './Components/StudentConcessionTable';
import NewConcessionRequestForm from './Components/NewConcessionRequest';
import ViewConcessionRequest from '../ConcessionAdmin/ConcessionAdminViewForm';

import type { IStudentInfo } from './type';
import type { IViewConcessionRequestProps } from '../ConcessionAdmin/type';

const Concession = () => {
  //   const { currentYear } = useSelector((state: RootState) => state.globalState);
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  // Local state to store filtered boards based on academic year
  const [boards, setBoards] = useState([]);
  const [mediums, setMediums] = useState<Medium[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<string>('');
  const [selectedMedium, setSelectedMedium] = useState<string>('');
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
  const [selectedConcessionForView, setSelectedConcessionForView] =
    useState<IViewConcessionRequestProps | null>(null);

  // State to store th  e selected student concession data
  // null when no student is selected
  useEffect(() => {
    // Filter boards based on academic year ID from edit data
    setBoards(currentYear?.boards);
    const board = boards?.find((item: any) => item.id === selectedBoard);
    setMediums((board as unknown as Board)?.educationMediums || []);
  }, [boards, currentYear?.boards, selectedBoard]);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {addConcessionRequest.value ? (
        <CustomBreadcrumbs
          heading="Concession Request"
          description="View and manage student concession requests."
          links={[
            { name: 'Finance', href: '/finance/dashboard' },
            {
              name: 'Concession',
              href: '/finance/concession/concessionRequest',
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
            { name: 'Finance', href: '/finance/dashboard' },
            {
              name: 'Concession',
              href: '/finance/concession/concessionRequest',
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
          heading="Concession"
          description="View and manage student concession requests."
          links={[
            { name: 'Finance', href: '/finance/dashboard' },
            { name: 'Concession', href: '/finance/concession/concessionRequest' },
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

      {!addConcessionRequest.value && !viewConcessionRequest.value && (
        <Box sx={{ display: 'flex', gap: 2, mb: 1, ml: 1 }}>
          <CustomSelect
            label="Board"
            options={boards || []}
            labelKey="name"
            valueKey="id"
            value={selectedBoard}
            onChange={(value) => {
              setSelectedBoard(value as string);
              setSelectedMedium('');
            }}
            formControlProps={{ sx: { maxWidth: '248px', width: '100%' } }}
          />
          <CustomSelect
            label="Medium"
            options={mediums || []}
            labelKey="name"
            disabled={!selectedBoard}
            valueKey="id"
            value={selectedMedium}
            onChange={(value) => setSelectedMedium(value as string)}
            formControlProps={{ sx: { maxWidth: '248px', width: '100%' } }}
          />
        </Box>
      )}

      {/* Show table only when no dialog is open */}
      {!addConcessionRequest.value && !viewConcessionRequest.value && (
        <StudentConcessionTable
          selectedBoard={selectedBoard}
          selectedMedium={selectedMedium}
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
            addConcessionRequest.onTrue();
          }}
        />
      )}

      {/* Show add request form when add dialog is open */}
      {addConcessionRequest.value && (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
          <NewConcessionRequestForm
            open={addConcessionRequest.value}
            onClose={handleClose}
            student={selectedConcession as IStudentInfo}
          />
        </Card>
      )}

      {/* Show view request form when view dialog is open */}
      {viewConcessionRequest.value && (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
          <ViewConcessionRequest
            viewConcessionRequest={viewConcessionRequest}
            onClose={() => {
              viewConcessionRequest.onFalse();
              setSelectedConcession(null);
            }}
            student={selectedConcessionForView as unknown as IStudentInfo}
            onApprove={() => {
              onConfirmDialg.onTrue();
              setSelectedMode('Approve');
              // Handle approve logic
            }}
            onReject={() => {
              onConfirmDialg.onTrue();
              setSelectedMode('Reject');
              // Handle reject logic
            }}
            onMismatch={() => {
              // Handle mismatch logic
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
