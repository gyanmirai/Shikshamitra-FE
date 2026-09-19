import { Box, MenuItem, MenuList } from '@mui/material';
import CustomTooltip from 'src/components/custom-tooltip';
import { Archive, Restore, RemoveCircle } from '@mui/icons-material';

import { SubjectAssignmentStatus } from '../../enum/subjectType';

import type { ISubjectFormValues } from '../type';

type Props = {
  row: ISubjectFormValues;
  onClose: () => void;
  canAdd: boolean;
  canDelete: boolean;
  onDelete: (row: ISubjectFormValues) => void;
  onArchive?: (row: ISubjectFormValues) => void;
  onRestore?: (row: ISubjectFormValues) => void;
};

export function SubjectTableActionsMenu({
  row,
  onClose,
  canAdd,
  canDelete,
  onDelete,
  onArchive,
  onRestore,
}: Props) {
  const removeDisabled = row.canDelete === false;
  const isArchived = row.status === SubjectAssignmentStatus.Archived;
  const removeDisabledReason =
    row.deleteDisabledReason ||
    'This subject is already used in another module. Remove those references before removing it.';

  return (
    <MenuList disablePadding dense>
      {isArchived && canAdd && (
        <MenuItem
          onClick={() => {
            onRestore?.(row);
            onClose();
          }}
        >
          <Restore sx={{ width: 18, height: 18, color: 'success.main', mr: 1 }} />
          Reactivate
        </MenuItem>
      )}
      {!isArchived && canDelete && SubjectAssignmentStatus.Draft !== row.status && (
        <MenuItem
          onClick={() => {
            onArchive?.(row);
            onClose();
          }}
        >
          <Archive sx={{ width: 18, height: 18, color: 'warning.main', mr: 1 }} />
          Archive
        </MenuItem>
      )}
      {canDelete && (
        <CustomTooltip
          title={removeDisabled ? removeDisabledReason : 'Remove'}
          arrow
          placement="left"
        >
          <Box component="span" sx={{ display: 'block' }}>
            <MenuItem
              disabled={removeDisabled}
              onClick={() => {
                if (removeDisabled) return;
                onDelete(row);
                onClose();
              }}
              sx={{ color: removeDisabled ? 'text.disabled' : 'error.main' }}
            >
              <RemoveCircle sx={{ width: 18, height: 18, mr: 1 }} />
              Remove
            </MenuItem>
          </Box>
        </CustomTooltip>
      )}
    </MenuList>
  );
}
