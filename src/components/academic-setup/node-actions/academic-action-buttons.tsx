import { Button } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';

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
}: AcademicActionButtonsProps) => (
  <>
    {addLabel && onAdd ? (
      <Button
        type="button"
        size="small"
        variant="contained"
        startIcon={<Iconify icon="mingcute:add-line" aria-hidden />}
        onClick={onAdd}
        sx={{ minHeight: 36, px: 1.5, whiteSpace: 'nowrap' }}
      >
        {addLabel}
      </Button>
    ) : null}
    <ThreeDotsActions
      showEditIcon
      showDeleteIcon
      showThreeDots={false}
      editLabel={`Edit ${recordType} ${recordName}`}
      deleteLabel={`Delete ${recordType} ${recordName}`}
      handleEditClick={onEdit}
      handleDeleteClick={onDelete}
      sx={{
        gap: 0.25,
        '& .MuiIconButton-root': { width: 36, height: 36, p: 0.75 },
      }}
    />
  </>
);
