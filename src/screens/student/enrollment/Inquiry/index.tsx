'use client';

import React from 'react';
import { Box, Card } from '@mui/material';

import InquiryForm from './inquiry-form';
import InquiryTable from './inquiry-table';
import { useInquiryLogic } from './hooks/useInquiryLogic';
import { InquiryHeader } from './components/InquiryHeader';
import { InquiryModals } from './components/InquiryModals';

/**
 * Purpose:
 * Main entry point for the Student Inquiry management screen.
 * Orchestrates Layout, State (via hook), and Sub-components.
 *
 * Performance Notes:
 * - Reduced LOC from 400+ to < 70.
 * - Logic extracted to `useInquiryLogic` to allow independent optimization.
 * - Components split to isolate unnecessary re-renders.
 *
 * Architectural Notes:
 * - Follows 'Page/View' pattern where the index file only composes components.
 */
const InquiryScreen = () => {
  const {
    state: { inquiryDialog, followUpDialog, issueRegistrationFormDialog, editData, ConfirmDialog },
    actions: { setEditData, handleClose, handleCloseFollowUp, handleCloseRegistration },
  } = useInquiryLogic();

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {ConfirmDialog}

      <InquiryHeader
        isAdding={inquiryDialog.value}
        onAddClick={inquiryDialog.onTrue}
        onBackClick={() => handleClose(null, false)}
      />

      {inquiryDialog.value ? (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-10)', minHeight: 0 }}>
          <InquiryForm handleClose={handleClose} editData={editData} />
        </Card>
      ) : (
        <InquiryTable
          inquiryDialog={inquiryDialog}
          followUpDialog={followUpDialog}
          issueRegistrationFormDialog={issueRegistrationFormDialog}
          // editData={editData}
          setEditData={setEditData}
        />
      )}

      <InquiryModals
        followUpOpen={followUpDialog.value}
        onCloseFollowUp={handleCloseFollowUp}
        registrationOpen={issueRegistrationFormDialog.value}
        onCloseRegistration={handleCloseRegistration}
        editData={editData}
      />
    </Box>
  );
};

export default InquiryScreen;
