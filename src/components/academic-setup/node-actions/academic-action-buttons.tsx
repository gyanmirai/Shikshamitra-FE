import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { Stack, Button } from '@mui/material';
import { Iconify } from 'src/components/iconify';

type AcademicActionButtonsProps = {
  recordName: string;
  recordType: string;
  addLabel?: string;
  onAdd?: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export const AcademicActionButtons = ({
  recordName,
  recordType,
  addLabel,
  onAdd,
  onEdit,
  onDelete,
}: AcademicActionButtonsProps) => {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const granted = (action: string) =>
    permissions.some(
      (permission: { name: string; isGranted: boolean }) =>
        permission.name === `InstituteSetup.AcademicSetup.${action}` && permission.isGranted
    );
  const childLabel = addLabel
    ?.replace(/^Add\s+/i, '')
    .replace(/^./, (letter) => letter.toUpperCase());
  return (
    <Stack
      role="group"
      aria-label={`Actions for ${recordType} ${recordName}`}
      direction="row"
      spacing={1}
      alignItems="center"
      useFlexGap
      flexWrap="wrap"
      sx={{ justifyContent: 'flex-end' }}
    >
      {granted('Edit') && (
        <Button
          type="button"
          size="small"
          variant="outlined"
          color="inherit"
          aria-label={`Edit ${recordType} ${recordName}`}
          startIcon={<Iconify icon="solar:pen-bold" width={16} aria-hidden />}
          onClick={onEdit}
        >
          Edit
        </Button>
      )}
      {granted('Delete') && (
        <Button
          type="button"
          size="small"
          variant="outlined"
          color="error"
          aria-label={`Delete ${recordType} ${recordName}`}
          startIcon={<Iconify icon="solar:trash-bin-trash-bold" width={16} aria-hidden />}
          onClick={onDelete}
        >
          Delete
        </Button>
      )}
      {addLabel && onAdd && granted('Add') ? (
        <Button
          type="button"
          size="small"
          variant="contained"
          aria-label={addLabel}
          startIcon={<Iconify icon="mingcute:add-line" width={16} aria-hidden />}
          onClick={onAdd}
        >
          {childLabel}
        </Button>
      ) : null}
    </Stack>
  );
};
