'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import { Box, Button, Typography } from '@mui/material';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { useConfirmWithUndo } from 'src/hooks/useConfirmWithUndo';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  librarySettingsApi,
  useGetSectionManagementQuery,
  useDeleteSectionManagementMutation,
} from 'src/redux/library/settingApi';

import ViewShelfData from './Components/ViewShelfForm';
import SectionForm from './Components/SectionManagementForm';
import SectionTable from './Components/SectionManagementTable';

import type { ISection } from './Components/type';

const SectionManagementScreen = () => {
  // Dialog control states
  const deleteSectionDialog = useBoolean();
  const addSectionDialog = useBoolean();
  const viewShelfDialog = useBoolean();
  const [open, setOpen] = useState(false);

  const { currentYear } = useSelector((state: RootState) => state.globalState);

  // Global state for tracking unsaved changes
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  // State to store currently selected section for edit/delete/view operations
  const [selectedSection, setSelectedSection] = useState<ISection | null>(null);

  // Delete section mutation hook
  const [deleteSectionManagement, { isLoading: isDeleteLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteSectionManagementMutation,
  });

  /* Get Section Management */
  const {
    data: sectionData,
    isLoading: sectionsLoading,
    refetch,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSectionManagementQuery,
    params: {
      academicYearId: currentYear?.id,
    },
    options: {
      skip: !currentYear?.id,
    },
  });

  console.log(sectionData, '<---->');

  // Undo functionality hook
  const { confirmWithUndo } = useConfirmWithUndo();

  /**
   * Handles closing of add/edit section dialog
   */
  const handleClose = (_e: any, isSubmit?: boolean) => {
    const resetState = () => {
      setTimeout(() => {
        setSelectedSection(null);
      }, 200);
    };

    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      addSectionDialog.onFalse();
      resetState();
    } else if (!isChanges) {
      addSectionDialog.onFalse();
      setTimeout(() => {
        setSelectedSection(null);
      }, 200);
    }
  };

  /**
   * Handles closing of view shelf dialog
   */
  // const handleViewDialogClose = () => {
  //   setSelectedSection(null);
  //   viewShelfDialog.onFalse();
  // };

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
            sx={{ px: '32px' }}
          >
            Section
          </Button>
        }
        sx={{ px: 1 }}
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
        onView={(data) => {
          setSelectedSection(data);
          viewShelfDialog.onTrue();
        }}
        isLoading={sectionsLoading}
        data={sectionData?.items || []}
        open={open}
        onAddSection={addSectionDialog}
        setOpenDialog={setOpen}
        editData={selectedSection}
        setEditData={setSelectedSection}
      />

      {/* Add/Edit Section Dialog */}
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

      {/* View Shelves Dialog */}
      <CustomDialog
        open={viewShelfDialog.value}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">View Shelves</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="This modal displays all shelves under a particular section, allowing users to view detailed shelf information and manage book placement."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        handleClose={() => {
          setSelectedSection(null);
          viewShelfDialog.onFalse();
        }}
        maxWidth="md"
      >
        <ViewShelfData sectionData={selectedSection} />
      </CustomDialog>

      {/* Delete Section Dialog */}
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
          <LoadingButton
            loading={isDeleteLoading}
            variant="contained"
            color="error"
            size="small"
            onClick={async () => {
              confirmWithUndo({
                item: selectedSection,
                onOptimisticRemove: (dispatchFn, setDeleteIndex) =>
                  dispatchFn(
                    librarySettingsApi.util.updateQueryData(
                      'getSectionManagement',
                      { academicYearId: currentYear?.id },
                      (draft: any) => {
                        const index = draft?.items?.findIndex(
                          (s: any) => s.id === selectedSection?.id
                        );
                        setDeleteIndex(index);
                        if (index !== -1) {
                          draft.items.splice(index, 1);
                        }
                      }
                    )
                  ),
                onUndoRestore: () => refetch(),
                onCommit: () =>
                  deleteSectionManagement({
                    sectionId: selectedSection?.id || '',
                    academicYearId: currentYear?.id,
                  }),
              });
              deleteSectionDialog.onFalse();
              setSelectedSection(null);
            }}
          >
            Yes
          </LoadingButton>
        }
      />
    </Box>
  );
};

export default SectionManagementScreen;
