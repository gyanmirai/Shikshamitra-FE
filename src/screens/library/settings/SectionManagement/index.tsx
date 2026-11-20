'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { Box, Button } from '@mui/material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
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

  // Undo functionality hook
  const { confirmWithUndo } = useConfirmWithUndo();

  /**
   * Handles closing of add/edit section dialog
   */
  const handleClose = () => {
    addSectionDialog.onFalse();
    setSelectedSection(null);
  };

  /**
   * Handles closing of view shelf dialog
   */
  // const handleViewDialogClose = () => {
  //   setSelectedSection(null);
  //   viewShelfDialog.onFalse();
  // };

  return (
    <Box
      data-testid="library-settings-sections-page"
      height="100%"
      display="flex"
      flexDirection="column"
    >
      <CustomBreadcrumbs
        heading="Section Management"
        description="Review and configure permanent Library sections and their shelf names."
        links={[
          { name: 'Library', href: '/library' },
          { name: 'Setting', href: '/library/settings/book-category' },
          { name: 'Section Management' },
        ]}
        action={
          <Button
            data-testid="library-settings-section-add-button"
            onClick={() => {
              setSelectedSection(null);
              addSectionDialog.onTrue();
            }}
            size="small"
            aria-label="Add section"
            startIcon={<Iconify icon={GlobalIcons.addIcon} />}
            variant="contained"
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
      {addSectionDialog.value && (
        <SectionForm
          key={selectedSection?.id ?? 'new'}
          open
          onClose={handleClose}
          editData={selectedSection}
        />
      )}

      {/* View Shelves Dialog */}
      <CustomDialog
        open={viewShelfDialog.value}
        hasForm={false}
        title="View Shelves"
        titleInfo="Review the saved section and shelf identities. Physical occupancy and row counts are unavailable."
        handleClose={() => {
          setSelectedSection(null);
          viewShelfDialog.onFalse();
        }}
        maxWidth="md"
      >
        <ViewShelfData
          sectionData={selectedSection}
          onClose={() => {
            setSelectedSection(null);
            viewShelfDialog.onFalse();
          }}
        />
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
