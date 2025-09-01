'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Add } from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { useGetMembersQuery } from 'src/redux/memberManagement/memberManagementApi';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import CustomTooltip from 'src/components/custom-tooltip';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import MemberForm from './Components/MemberManageForm';
import ChangeStatusForm from './Components/ChangeStatusForm';
import MakeReservationForm from './Components/MakeReservationForm';
import MemberManagementTable from './Components/MemberManagementTable';

const MemberManagement = ({ showBreadCumb = true }: { showBreadCumb?: boolean }) => {
  // State to control member form visibility
  const [open, setOpen] = useState(false);
  const { data: memberData, isLoading: memberLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetMembersQuery,
  });

  // State to store currently selected member for editing
  const [selectedMember, setSelectedMember] = useState<any | null>(null);

  // State to store currently selected status
  const [selectedStatus, setSelectedStatus] = useState<any | null>(null);

  // Redux selector to track unsaved changes
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  // Boolean hook to control delete confirmation dialog
  const deleteDialog = useBoolean();
  // Boolean hook to control add member dialog
  const addMemberDialog = useBoolean();

  // Boolean hook to control change status dialog
  const changeStatusDialog = useBoolean();

  // Redux dispatch hook for state management
  const dispatch = useDispatch();

  // Boolean hook to control detail view dialog
  const viewDialog = useBoolean();

  // Boolean hook to control make reservation dialog
  const makeReservationDialog = useBoolean();

  /**
   * Handles closing the member form with confirmation if there are unsaved changes
   */
  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      setOpen(false);
      addMemberDialog.onFalse();
      changeStatusDialog.onFalse();
      makeReservationDialog.onFalse();
      dispatch(setIsChanges(false));
      setSelectedMember(null);
      setSelectedStatus(null);
    } else if (!isChanges) {
      setOpen(false);
      addMemberDialog.onFalse();
      changeStatusDialog.onFalse();
      makeReservationDialog.onFalse();
      setSelectedMember(null);
      setSelectedStatus(null);
    }
  };

  /**
   * Handle make reservation action
   */
  const handleMakeReservation = (member: any) => {
    setSelectedMember(member);
    makeReservationDialog.onTrue();
  };

  /**
   * Handle change status action
   */
  const handleChangeStatus = (member: any) => {
    setSelectedStatus(member);
    changeStatusDialog.onTrue();
  };

  return (
    <Box height="100%" display="flex" flexDirection="column">
      {showBreadCumb &&
        (open ? (
          <CustomBreadcrumbs
            heading="Member Management"
            description={
              selectedMember?.name
                ? 'Update existing member details such as name, contact information, membership type, and status.'
                : 'Add a new member by entering details like name, contact information, membership type, and status.'
            }
            links={[{ name: 'Library', href: '/library/dashboard' }, { name: 'Member Management' }]}
            sx={{ px: 1 }}
            isBack
            onBack={() => {
              handleClose(null, false);
            }}
          />
        ) : (
          <CustomBreadcrumbs
            heading="Member Management"
            description="View and manage all created fee structures. Use the actions to view details, make changes, or delete a structure. Click 'Create New Fee Structure' to define a new one for any board, medium or class."
            links={[{ name: 'Library', href: '/library/dashboard' }, { name: 'Member Management' }]}
            sx={{ px: 1 }}
            action={
              <Button
                startIcon={<Add />}
                variant="contained"
                size="small"
                onClick={() => {
                  setSelectedMember(null);
                  addMemberDialog.onTrue();
                }}
              >
                Member
              </Button>
            }
          />
        ))}

      <MemberManagementTable
        data={memberData}
        onView={(data) => {
          viewDialog.onTrue();
          setSelectedMember(data);
        }}
        onEdit={(data) => {
          // Show view instead of edit
          viewDialog.onTrue();
          setSelectedMember(data);
        }}
        onDelete={(data) => {
          setSelectedMember(data);
          deleteDialog.onTrue();
        }}
        onMakeReservation={handleMakeReservation}
        onChangeStatus={handleChangeStatus}
      />

      {/* Add Member Dialog */}
      <CustomDialog
        handleClose={() => {
          addMemberDialog.onFalse();
          setSelectedMember(null);
        }}
        open={addMemberDialog.value}
        maxWidth="sm"
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Add Member</Typography>
            <CustomTooltip
              arrow
              placement="right"
              title="Form to record and request student fee refunds."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <MemberForm open={addMemberDialog.value} onClose={handleClose} />
      </CustomDialog>

      <CustomDialog
        handleClose={() => {
          changeStatusDialog.onFalse();
          setSelectedStatus(null);
        }}
        open={changeStatusDialog.value}
        maxWidth="sm"
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Change Status</Typography>
            <CustomTooltip
              arrow
              placement="right"
              title="Upload your bank statement to begin reconciliation. Provide statement details and attach the file for processing."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <ChangeStatusForm open={changeStatusDialog.value} onClose={handleClose} />
      </CustomDialog>

      {/* Make Reservation Dialog */}
      <CustomDialog
        handleClose={() => {
          makeReservationDialog.onFalse();
          setSelectedMember(null);
        }}
        open={makeReservationDialog.value}
        maxWidth="md"
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Make Reservation</Typography>
            <CustomTooltip
              arrow
              placement="right"
              title="Form to record and request student fee refunds."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <MakeReservationForm
          open={makeReservationDialog.value}
          onClose={handleClose}
          selectedMember={selectedMember}
        />
      </CustomDialog>

      {/* View Details */}
      <CustomDialog
        title="View Member"
        open={viewDialog.value}
        handleClose={() => {
          viewDialog.onFalse();
          setSelectedMember(null);
        }}
        maxWidth="md"
      >
        Member details content here
      </CustomDialog>
    </Box>
  );
};

export default MemberManagement;
