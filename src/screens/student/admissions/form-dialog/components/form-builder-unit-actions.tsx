import MenuItem from '@mui/material/MenuItem';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { shikshaMitraToast } from 'src/components/toast';
import ThreeDotsActions from 'src/components/three-dots-actions';

import { FormBuilderDeleteUnit } from './form-builder-delete-unit';

type Props = {
  name: string;
  unit: 'step' | 'section' | 'field';
  onEdit: () => void;
  onDelete: () => void;
  onMove?: () => void;
  moreLabel?: string;
  disabled?: boolean;
  deleteDisabled?: boolean;
  deleteBlockedReason?: string;
};

// Match the existing admissions workflow-card actions while keeping deletion confirmation mounted.
export function FormBuilderUnitActions({
  name,
  unit,
  onEdit,
  onDelete,
  onMove,
  moreLabel,
  disabled,
  deleteDisabled,
  deleteBlockedReason,
}: Props) {
  const confirm = useBoolean();
  return (
    <>
      <ThreeDotsActions
        placement="top-right"
        moreLabel={moreLabel ?? `Actions For ${name} ${unit}`}
        sx={{ flexShrink: 0, '& .MuiIconButton-root': { width: 44, height: 44 } }}
        actions={({ popover }) => (
          <>
            <MenuItem
              disabled={disabled}
              onClick={() => {
                popover.onClose();
                onEdit();
              }}
            >
              <Iconify icon="mdi:pencil-outline" /> Edit
            </MenuItem>
            {onMove && (
              <MenuItem
                disabled={disabled}
                onClick={() => {
                  popover.onClose();
                  onMove();
                }}
              >
                <Iconify icon="mdi:transfer" /> Move to
              </MenuItem>
            )}
            <MenuItem
              disabled={disabled || deleteDisabled}
              sx={{ color: deleteBlockedReason ? 'text.secondary' : 'error.main' }}
              onClick={() => {
                popover.onClose();
                if (deleteBlockedReason)
                  shikshaMitraToast.warning({ message: deleteBlockedReason });
                else if (unit === 'field') onDelete();
                else confirm.onTrue();
              }}
            >
              <Iconify icon={deleteBlockedReason ? 'mdi:lock-outline' : 'mdi:delete-outline'} />{' '}
              Delete
            </MenuItem>
          </>
        )}
      />
      {unit !== 'field' && (
        <FormBuilderDeleteUnit
          name={name}
          unit={unit}
          onDelete={onDelete}
          open={confirm.value}
          onClose={confirm.onFalse}
          hideTrigger
        />
      )}
    </>
  );
}
