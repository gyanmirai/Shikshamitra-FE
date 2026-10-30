import MenuItem from '@mui/material/MenuItem';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import ThreeDotsActions from 'src/components/three-dots-actions';

import { FormBuilderDeleteUnit } from './form-builder-delete-unit';

type Props = {
  name: string;
  unit: 'step' | 'section' | 'field';
  onEdit: () => void;
  onDelete: () => void;
  disabled?: boolean;
  deleteDisabled?: boolean;
};

// Match the existing admissions workflow-card actions while keeping deletion confirmation mounted.
export function FormBuilderUnitActions({
  name,
  unit,
  onEdit,
  onDelete,
  disabled,
  deleteDisabled,
}: Props) {
  const confirm = useBoolean();
  return (
    <>
      <ThreeDotsActions
        placement="top-right"
        moreLabel={`Actions for ${name} ${unit}`}
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
            <MenuItem
              disabled={disabled || deleteDisabled}
              sx={{ color: 'error.main' }}
              onClick={() => {
                popover.onClose();
                if (unit === 'field') onDelete();
                else confirm.onTrue();
              }}
            >
              <Iconify icon="mdi:delete-outline" /> Delete
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
