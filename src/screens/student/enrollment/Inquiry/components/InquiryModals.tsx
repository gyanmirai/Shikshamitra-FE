import React from 'react';
import { Box, Typography } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/custom-dialog';
import CustomTooltip from 'src/components/custom-tooltip';

import { CommunicationForm } from '../../follow-up';
import IssueRegistrationForm from '../../issue-registration-form/issueRegistrationForm';

import type { IInquiryResponse } from '../type';

interface InquiryModalsProps {
  followUpOpen: boolean;
  onCloseFollowUp: () => void;
  registrationOpen: boolean;
  onCloseRegistration: () => void;
  editData: IInquiryResponse | null;
}

/**
 * Purpose:
 * Renders the dialogs/modals used in the Inquiry screen.
 *
 * Performance Notes:
 * - Lazy loading contents could be an optimization here if these forms are heavy.
 * - Currently separate to reduce main component tree depth.
 *
 * Architectural Notes:
 * - Consolidates all "popover" interactions.
 */
export const InquiryModals = React.memo(
  ({
    followUpOpen,
    onCloseFollowUp,
    registrationOpen,
    onCloseRegistration,
    editData,
  }: InquiryModalsProps) => (
    <>
      <CustomDialog
        open={followUpOpen}
        handleClose={onCloseFollowUp}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Notes</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="Add and view communication notes and follow-ups related to students inquiries."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        maxWidth="sm"
      >
        <CommunicationForm
          handleCloseDialog={onCloseFollowUp}
          studentEnrollmentId={editData?.studentId || ''}
          selectedStudent={editData}
        />
      </CustomDialog>

      <CustomDialog
        open={registrationOpen}
        handleClose={onCloseRegistration}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Issue Registration Form</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="Generate and issue students registration forms with all necessary information and supporting documents."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <IssueRegistrationForm
          handleClose={onCloseRegistration}
          editData={editData as IInquiryResponse}
        />
      </CustomDialog>
    </>
  )
);

InquiryModals.displayName = 'InquiryModals';
