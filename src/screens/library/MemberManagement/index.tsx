'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector, useDispatch } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import CustomTooltip from 'src/components/custom-tooltip';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { useGetMembersQuery } from 'src/redux/memberManagement/memberManagementApi';

import MemberForm from './Components/MemberManageForm';
import MemberManagementTable from './Components/MemberManagementTable';
import MemberDetailedViewComponent from './Components/MemberDetailedViewComponent';

const MemberManagement = ({ showBreadCumb = true }: { showBreadCumb?: boolean }) => {
  // State to control member form visibility
  const [open, setOpen] = useState(false);
  const { data: memberData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetMembersQuery,
  });

  // State to store currently selected member for editing
  const [selectedMember, setSelectedMember] = useState<any | null>(null);

  // State to store currently selected status
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  return (
    <Box height="100%" display="flex" flexDirection="column">
      {showBreadCumb &&
        (open ? (
          <CustomBreadcrumbs
            heading="Library Members"
            description={
              selectedMember?.name
                ? 'Update existing member details such as name, contact information, membership type, and status.'
                : 'Add a new member by entering details like name, contact information, membership type, and status.'
            }
            links={[{ name: 'Library', href: '/library/dashboard' }, { name: 'Library Members' }]}
            sx={{ px: 1 }}
            isBack
            onBack={() => {
              handleClose(null, false);
            }}
          />
        ) : (
          <CustomBreadcrumbs
            heading="Library Members"
            description="This screen displays the list of all library members along with their details, and provides an option to add new members."
            links={[{ name: 'Library', href: '/library/dashboard' }, { name: 'Library Members' }]}
            sx={{ px: 1 }}
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
              title="This modal allows the librarian to fill in all required details and register a new member in the library system."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <MemberForm open={addMemberDialog.value} onClose={handleClose} />
      </CustomDialog>

      {/* View Details */}
      <CustomDialog
        handleClose={() => {
          viewDialog.onFalse();
          setSelectedMember(null);
        }}
        open={viewDialog.value}
        maxWidth="lg"
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Member Details</Typography>
            <CustomTooltip
              arrow
              placement="right"
              title="This modal displays the detailed profile of a specific member, including their personal information, currently issued books, reserved books, and fines & charges history."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <MemberDetailedViewComponent
          member={selectedMember}
          onClose={() => {
            viewDialog.onFalse();
            setSelectedMember(null);
          }}
        />
      </CustomDialog>
    </Box>
  );
};

export default MemberManagement;
