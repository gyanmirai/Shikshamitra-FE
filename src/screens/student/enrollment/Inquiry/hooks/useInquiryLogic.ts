import type { RootState } from 'src/redux/store';

import { useState } from 'react';
import { useBoolean } from 'src/hooks/useBoolean';
import { useDispatch, useSelector } from 'react-redux';
import { useConfirmDialog } from 'src/hooks/useConfirmDialog';
import { setIsChanges } from 'src/redux/confirm-popup/confirmPopupSlice';

import type { IInquiryResponse } from '../type';

/**
 * Purpose:
 * Encapsulates all state and logic for the InquiryScreen to separate concerns.
 *
 * Performance Notes:
 * - Uses specific Redux selectors to minimize re-renders.
 * - Handles dialog states efficiently.
 *
 * Architectural Notes:
 * - Follows the 'Separation of Concerns' principle.
 * - Allows for easier testing of logic independent of UI.
 */
export const useInquiryLogic = () => {
  const [showConfirm, ConfirmDialog] = useConfirmDialog();
  const inquiryDialog = useBoolean();
  const followUpDialog = useBoolean();
  const issueRegistrationFormDialog = useBoolean();

  // State to store inquiry data being edited
  const [editData, setEditData] = useState<null | IInquiryResponse>(null);

  // Redux state
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();

  /**
   * Handles closing the inquiry dialog with modification check.
   */
  const handleClose = async (_e?: unknown, isSubmit?: boolean) => {
    if (
      isSubmit ||
      (isChanges &&
        (await showConfirm({
          title: 'Alert',
          message: 'Are you sure you want to leave this page?',
          icon: 'warning',
        })))
    ) {
      dispatch(setIsChanges(false));
      inquiryDialog.onFalse();
      setEditData(null);
    } else if (!isChanges) {
      inquiryDialog.onFalse();
      setEditData(null);
    }
  };

  /**
   * Clears edit data and closes follow-up dialog.
   */
  const handleCloseFollowUp = () => {
    setEditData(null);
    followUpDialog.onFalse();
  };

  /**
   * Clears edit data and closes registration form dialog.
   */
  const handleCloseRegistration = () => {
    setEditData(null);
    issueRegistrationFormDialog.onFalse();
  };

  return {
    state: {
      inquiryDialog,
      followUpDialog,
      issueRegistrationFormDialog,
      editData,
      ConfirmDialog,
    },
    actions: {
      setEditData,
      handleClose,
      handleCloseFollowUp,
      handleCloseRegistration,
    },
  };
};
