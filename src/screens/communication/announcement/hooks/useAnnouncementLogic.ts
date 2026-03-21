import type { RootState } from 'src/redux/store';

import { useState, useCallback } from 'react';
import { useBoolean } from 'src/hooks/useBoolean';
import { useDispatch, useSelector } from 'react-redux';
import { useConfirmWithUndo } from 'src/hooks/useConfirmWithUndo';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { setIsChanges } from 'src/redux/confirm-popup/confirmPopupSlice';
import {
  useGetAnnouncementsQuery,
  schoolWiseAnnouncementApi,
  useDeleteAnnouncementMutation,
  usePublishAnnouncementMutation,
} from 'src/redux/communication/announcement/schoolWiseAnnouncement';

import type { ISchoolWiseAnnouncement } from '../type';

// ----------------------------------------------------------------------

export const useAnnouncementLogic = () => {
  const dispatch = useDispatch();
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const { confirmWithUndo } = useConfirmWithUndo();

  // -- State --
  const [open, setOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<ISchoolWiseAnnouncement | null>(
    null
  );
  const [viewAnnouncement, setViewAnnouncement] = useState<ISchoolWiseAnnouncement | null>(null);
  const [removeAnnouncement, setRemoveAnnouncement] = useState<ISchoolWiseAnnouncement | null>(
    null
  );
  const [publishingAnnouncement, setPublishingAnnouncement] =
    useState<ISchoolWiseAnnouncement | null>(null);

  // -- Boolean Hooks --
  const viewDialog = useBoolean();
  const confirmDialog = useBoolean(); // For "Remove" reason form
  const publishModal = useBoolean();
  const deleteDialog = useBoolean();

  // -- API Queries & Mutations --
  const {
    data: announcementData,
    isLoading,
    refetch,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAnnouncementsQuery,
  });

  const [deleteAnnouncement, { isLoading: isDeleteLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteAnnouncementMutation,
  });

  const [publishAnnouncement, { isLoading: isPublishLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: usePublishAnnouncementMutation,
  });

  // -- Handlers --

  /**
   * Memoization Justification:
   * Used to reset all dialog states. Dependencies are static dispatch/setters mostly,
   * but needed as a stable reference for `onClose` props to prevent child re-renders.
   */
  const handleCloseDialog = useCallback(
    (_e?: React.SyntheticEvent | null, isSubmit?: boolean) => {
      const resetState = () => {
        // Delay for dialog transition to finish before clearing state
        setTimeout(() => {
          setEditingAnnouncement(null);
          setOpen(false);
          publishModal.onFalse();
          confirmDialog.onFalse();
          setPublishingAnnouncement(null);
          setRemoveAnnouncement(null);
          dispatch(setIsChanges(false));
        }, 200);
      };

      if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
        resetState();
      } else if (!isChanges) {
        resetState();
      }
    },
    [confirmDialog, dispatch, isChanges, publishModal]
  );

  const handleEdit = useCallback((row: ISchoolWiseAnnouncement) => {
    setOpen(true);
    setEditingAnnouncement(row);
  }, []);

  const handleCreate = useCallback(() => {
    setOpen(true);
    setEditingAnnouncement(null);
  }, []);

  const handleSwitchChange = useCallback((row: ISchoolWiseAnnouncement) => {
    setEditingAnnouncement(row);
  }, []);

  const handleDeleteClick = useCallback(
    (row: ISchoolWiseAnnouncement) => {
      deleteDialog.onTrue();
      setEditingAnnouncement(row);
    },
    [deleteDialog]
  );

  const handleRemoveClick = useCallback(
    (row: ISchoolWiseAnnouncement) => {
      confirmDialog.onTrue();
      setRemoveAnnouncement(row);
    },
    [confirmDialog]
  );

  const handleViewClick = useCallback(
    (row: ISchoolWiseAnnouncement) => {
      viewDialog.onTrue();
      setOpen(false);
      setViewAnnouncement(row);
    },
    [viewDialog]
  );

  const handlePublishClick = useCallback(
    (row: ISchoolWiseAnnouncement) => {
      publishModal.onTrue();
      setPublishingAnnouncement(row);
    },
    [publishModal]
  );

  const handleBackToDashboard = useCallback(() => {
    setOpen(false);
    setEditingAnnouncement(null);
  }, []);

  const handleViewBack = useCallback(() => {
    viewDialog.onFalse();
  }, [viewDialog]);

  // -- Action Commit Handlers --

  const handleDeleteCommit = useCallback(async () => {
    if (!editingAnnouncement) return;

    confirmWithUndo({
      item: editingAnnouncement,
      onOptimisticRemove: (dispatchFn, setDeleteIndex) =>
        dispatchFn(
          schoolWiseAnnouncementApi.util.updateQueryData(
            'getAnnouncements',
            undefined,
            (draft: any) => {
              const index = draft.items?.findIndex((b: any) => b.id === editingAnnouncement?.id);
              setDeleteIndex(index);
              if (index !== -1) {
                draft.items.splice(index, 1);
              }
            }
          )
        ),
      onUndoRestore: (dispatchFn, index) => refetch(),
      onCommit: () => deleteAnnouncement(editingAnnouncement.id),
    });
    deleteDialog.onFalse();
    setEditingAnnouncement(null);
  }, [confirmWithUndo, deleteAnnouncement, deleteDialog, editingAnnouncement, refetch]);

  const handlePublishCommit = useCallback(async () => {
    if (!publishingAnnouncement) return;

    confirmWithUndo({
      item: publishingAnnouncement,
      onOptimisticRemove: (dispatchFn, setDeleteIndex) =>
        dispatchFn(
          schoolWiseAnnouncementApi.util.updateQueryData(
            'getAnnouncements',
            undefined,
            (draft: any) => {
              const index = draft.items?.findIndex((b: any) => b.id === publishingAnnouncement?.id);
              setDeleteIndex(index);
              if (index !== -1) {
                draft.items.splice(index, 1);
              }
            }
          )
        ),
      onUndoRestore: (dispatchFn, index) => refetch(),
      onCommit: () => publishAnnouncement(publishingAnnouncement.id),
    });
    publishModal.onFalse();
    setPublishingAnnouncement(null);
  }, [confirmWithUndo, publishAnnouncement, publishModal, publishingAnnouncement, refetch]);

  return {
    state: {
      open,
      editingAnnouncement,
      viewAnnouncement,
      removeAnnouncement,
      publishingAnnouncement,
      announcementData,
      isLoading,
      isDeleteLoading,
      isPublishLoading,
    },
    dialogs: {
      viewDialog,
      confirmDialog,
      publishModal,
      deleteDialog,
    },
    handlers: {
      handleCloseDialog,
      handleEdit,
      handleCreate,
      handleSwitchChange,
      handleDeleteClick,
      handleRemoveClick,
      handleViewClick,
      handlePublishClick,
      handleBackToDashboard,
      handleViewBack,
      handleDeleteCommit,
      handlePublishCommit,
      setOpen, // Expose setOpen for AnnouncementTable
    },
  };
};
