'use client';

import type { RootState } from 'src/redux/store';
import type { Board, Medium } from 'src/types/school';

import { Add } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Button, Typography } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import CustomTooltip from 'src/components/custom-tooltip';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { useGetConcessionsQuery } from 'src/redux/finance/ConcessionManagement/concessionApi';

import ReasonApprovalForm from './Components/ConcessionRequestApprove';
import StudentConcessionTable from './Components/StudentConcessionTable';
import NewConcessionRequestForm from './Components/NewConcessionRequest';
import ViewStudentAllConcession from './Components/ViewStudentAllConcession';
import ViewConcessionRequest from '../ConcessionAdmin/ConcessionAdminViewForm';

import type { IStudentInfo } from './type';
import type { IViewConcessionRequestProps } from '../ConcessionAdmin/type';

const Concession = () => {
  //   const { currentYear } = useSelector((state: RootState) => state.globalState);
  const {
    currentYear,
    currentBoard,
    currentMedium: medium,
    setCurrentMedium: setMedium,
  } = useSelector((state: RootState) => state.globalState);

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
  const onConfirmDialg = useBoolean();
  const [selectedMode, setSelectedMode] = useState('');

  const { data: concessionData, isLoading: boardLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetConcessionsQuery,
  });

  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are u sure to leave this page ?'))) {
      addConcessionRequest.onFalse();
      setSelectedConcession(null);
      dispatch(setIsChanges(false));
      onConfirmDialg.onFalse();
      setSelectedMode('');
    } else if (!isChanges) {
      addConcessionRequest.onFalse();
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
  const [selectedConcession, setSelectedConcession] = useState<IStudentInfo | null>(null);
  useEffect(() => {
    // Filter boards based on academic year ID from edit data
    setBoards(currentYear?.boards);
    const board = boards?.find((item: any) => item.id === selectedBoard);
    setMediums((board as unknown as Board)?.educationMediums || []);
  }, [boards, currentYear?.boards, selectedBoard]);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Concession"
        description="View and manage student concession requests."
        links={[
          { name: 'Finance', href: '/finance/dashboard' },
          { name: 'Concession', href: '/finance/concession-type' },
        ]}
        action={
          <Button
            onClick={() => addConcessionRequest.onTrue()}
            size="small"
            startIcon={<Add />}
            variant="contained"
          >
            Request Concession
          </Button>
        }
        sx={{ px: 1, mb: 2 }}
      />
      <Box sx={{ display: 'flex', gap: 2, mb: 2, ml: 1 }}>
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
      <StudentConcessionTable
        data={concessionData}
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
      />

      <CustomDialog
        open={addConcessionRequest.value}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Request Concession</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="Submit a concession request by specifying details for the selected student."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        handleClose={() => {
          setSelectedConcession(null);
          addConcessionRequest.onFalse();
        }}
        maxWidth="sm"
      >
        <NewConcessionRequestForm
          open={addConcessionRequest.value}
          onClose={handleClose}
          student={selectedConcession as IStudentInfo}
        />
      </CustomDialog>

      <CustomDialog
        open={onViewAllConcession.value}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">{`${selectedConcession?.studentName}'s Concession History`}</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="View complete history of concession requests and their status for this student"
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        handleClose={() => {
          setSelectedConcession(null);
          onViewAllConcession.onFalse();
        }}
        maxWidth="md"
      >
        {selectedConcession && <ViewStudentAllConcession data={selectedConcession} />}
      </CustomDialog>

      <CustomDialog
        open={viewConcessionRequest.value}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">View Concession</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="Review the student’s concession request and take action to approve or reject it."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        handleClose={() => {
          setSelectedConcession(null);
          viewConcessionRequest.onFalse();
        }}
        maxWidth="sm"
      >
        <ViewConcessionRequest
          viewConcessionRequest={viewConcessionRequest}
          onClose={() => {
            viewConcessionRequest.onFalse();
            setSelectedConcession(null);
          }}
          student={selectedConcessionForView as unknown as IStudentInfo}
          documents={selectedConcessionForView?.documents}
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
      </CustomDialog>

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
        <ReasonApprovalForm onClose={handleClose} mode={selectedMode} />
      </CustomDialog>
    </Box>
  );
};

export default Concession;
