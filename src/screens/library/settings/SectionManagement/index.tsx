'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { Add } from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { Box, Button, Typography } from '@mui/material';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import SectionForm from './Components/SectionManagementForm';
import SectionTable from './Components/SectionManagementTable';

import type { ISection } from './Components/type';

const SectionManagementScreen = () => {
  // Dialog control states
  const deleteSectionDialog = useBoolean(); // Controls delete confirmation dialog
  const addSectionDialog = useBoolean(); // Controls add/edit section dialog
  const [open, setOpen] = useState(false); // Controls table dialog state

  // Global state for tracking unsaved changes
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  // State to store currently selected section for edit/delete operations
  const [selectedSection, setSelectedSection] = useState<ISection | null>(null);

  const dispatch = useDispatch();

  /**
   * Handles closing of add/edit section dialog
   * @param _e - Event object
   * @param isSubmit - Boolean indicating if form was submitted
   */
  const handleClose = (_e: any, isSubmit?: boolean) => {
    // Helper function to reset state after dialog closes
    const resetState = () => {
      setTimeout(() => {
        setSelectedSection(null);
        dispatch(setIsChanges(false));
      }, 200);
    };

    // If form was submitted or user confirms leaving with unsaved changes
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      addSectionDialog.onFalse();
      resetState();
    }
    // If no unsaved changes, simply close dialog
    else if (!isChanges) {
      addSectionDialog.onFalse();
      setTimeout(() => {
        setSelectedSection(null);
      }, 200);
    }
  };

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Section Management"
        description="This screen displays all created transport routes with options to create new ones. It helps in organizing and managing student transportation efficiently across different locations."
        links={[
          { name: 'Library', href: '/library' },
          { name: 'Setting', href: '/library/settings/book-category' },
          { name: 'Section Management' },
        ]}
        action={
          <Button
            onClick={() => addSectionDialog.onTrue()}
            size="small"
            startIcon={<Add />}
            variant="contained"
          >
            Section
          </Button>
        }
        sx={{ px: 1, mb: 1 }}
      />

      <SectionTable
        onDelete={(data) => {
          setSelectedSection(data);
          deleteSectionDialog.onTrue();
        }}
        onEdit={(data) => {
          setSelectedSection(data);
          addSectionDialog.onTrue();
        }}
        open={open}
        onAddSection={addSectionDialog}
        setOpenDialog={setOpen}
        editData={selectedSection}
        setEditData={setSelectedSection}
      />

      <CustomDialog
        open={addSectionDialog.value}
        maxWidth="md"
        handleClose={() => {
          addSectionDialog.onFalse();
          setTimeout(() => {
            setSelectedSection(null);
          }, 200);
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {selectedSection ? 'Update Section' : 'Add Section'}
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title={
                selectedSection
                  ? 'Update existing section by entering its name and number of columns.'
                  : 'Create a new section by entering its name and number of columns.'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <SectionForm open={addSectionDialog} onClose={handleClose} editData={selectedSection} />
      </CustomDialog>

      <ConfirmDialog
        open={deleteSectionDialog.value}
        onClose={() => {
          setSelectedSection(null);
          deleteSectionDialog.onFalse();
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete section <strong>{selectedSection?.sectionName}</strong>?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => {
              deleteSectionDialog.onFalse();
              setSelectedSection(null);
              shikshaMitraToast.success({
                message: `Section: ${selectedSection?.sectionName} deleted successfully`,
              });
            }}
          >
            Yes
          </Button>
        }
      />
    </Box>
  );
};

export default SectionManagementScreen;
