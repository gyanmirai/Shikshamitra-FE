import type { UseBooleanReturn } from 'src/hooks/useBoolean';

import React from 'react';
import { Iconify } from 'src/components/iconify';
import { MenuItem, MenuList } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';

import type { IInquiryResponse } from '../type';

interface InquiryActionsProps {
  row: IInquiryResponse;
  inquiryDialog: UseBooleanReturn;
  issueRegistrationFormDialog: UseBooleanReturn;
  followUpDialog: UseBooleanReturn;
  setEditData: (data: IInquiryResponse | null) => void;
}

/**
 * Purpose:
 * Renders the action menu for a single row in the Inquiry Table.
 *
 * Performance Notes:
 * - Isolated component to prevent table-wide re-renders on menu interaction.
 *
 * Architectural Notes:
 * - Encapsulates action logic (Edit, Notes, Issue Form) into a single functional unit.
 */
export const InquiryActions = ({
  row,
  inquiryDialog,
  issueRegistrationFormDialog,
  followUpDialog,
  setEditData,
}: InquiryActionsProps) => {
  const handleEdit = () => {
    setEditData(row);
    inquiryDialog.onTrue();
  };

  const handleNotes = (popoverClose: VoidFunction) => {
    setEditData(row);
    followUpDialog.onTrue();
    popoverClose();
  };

  const handleIssueForm = (popoverClose: VoidFunction) => {
    setEditData(row);
    issueRegistrationFormDialog.onTrue();
    popoverClose();
  };

  return (
    <ThreeDotsActions
      placement="right-center"
      showEditIcon
      handleEditClick={handleEdit}
      actions={({ popover }) => (
        <MenuList>
          <MenuItem onClick={() => handleNotes(popover.onClose)}>
            <Iconify icon="clarity:note-edit-line" />
            Notes
          </MenuItem>
          <MenuItem onClick={() => handleIssueForm(popover.onClose)}>
            <Iconify icon="clarity:form-line" />
            Issue Registration Form
          </MenuItem>
        </MenuList>
      )}
    />
  );
};
