import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import { Iconify } from 'src/components/iconify';
import IconButton from '@mui/material/IconButton';
import { useBoolean } from 'src/hooks/use-boolean';
import { ConfirmDialog } from 'src/components/confirm-dialog';

type Props = {
  name: string;
  unit: 'step' | 'section';
  canDelete: boolean;
  onDelete: () => void;
};

export function FormBuilderDeleteUnit({ name, unit, canDelete, onDelete }: Props) {
  const confirm = useBoolean();
  return (
    <>
      <Tooltip title={canDelete ? `Delete ${name}` : `Keep at least one ${unit}`}>
        <span>
          <IconButton
            aria-label={`Delete ${name}`}
            disabled={!canDelete}
            onClick={confirm.onTrue}
            sx={{ width: 44, height: 44, color: 'text.secondary' }}
          >
            <Iconify icon="mdi:delete-outline" width={20} />
          </IconButton>
        </span>
      </Tooltip>
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={`Delete ${unit}?`}
        content={
          <>
            This removes <strong>{name}</strong> and all its{' '}
            {unit === 'step' ? 'sections and fields' : 'fields'} from this draft.
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              confirm.onFalse();
              onDelete();
            }}
          >
            Delete {unit}
          </Button>
        }
      />
    </>
  );
}
