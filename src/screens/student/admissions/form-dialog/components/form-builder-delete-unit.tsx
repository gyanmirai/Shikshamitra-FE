import Button from '@mui/material/Button';
import { Iconify } from 'src/components/iconify';
import IconButton from '@mui/material/IconButton';
import { useBoolean } from 'src/hooks/use-boolean';
import { ConfirmDialog } from 'src/components/confirm-dialog';

type Props = {
  name: string;
  unit: 'step' | 'section';
  onDelete: () => void;
  open?: boolean;
  onClose?: () => void;
  hideTrigger?: boolean;
};

export function FormBuilderDeleteUnit({ name, unit, onDelete, open, onClose, hideTrigger }: Props) {
  const confirm = useBoolean();
  const close = onClose ?? confirm.onFalse;
  return (
    <>
      {!hideTrigger && (
        <IconButton
          size="small"
          aria-label={unit === 'step' ? `Delete ${name} step` : `Delete ${name}`}
          onClick={confirm.onTrue}
          sx={{ width: 44, height: 44, color: 'text.secondary' }}
        >
          <Iconify icon="mdi:delete-outline" width={20} />
        </IconButton>
      )}
      <ConfirmDialog
        open={open ?? confirm.value}
        onClose={close}
        title={`Delete ${unit}?`}
        content={
          <>
            This removes <strong>{name}</strong> and all its{' '}
            {unit === 'step' ? 'sections and fields' : 'fields'} from this draft.
            {unit === 'section' &&
              ' In a step form, removing the last section of a step removes that step too.'}
          </>
        }
        action={
          <Button
            size="small"
            variant="contained"
            color="error"
            onClick={() => {
              close();
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
