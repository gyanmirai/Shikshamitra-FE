import React from 'react';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Button, DialogActions } from '@mui/material';

interface IncomeFormActionsProps {
  onClose: (e: any, isSubmit?: boolean) => void;
  isLoading: boolean;
  isEdit: boolean;
  onSubmit: () => void;
}

const IncomeFormActions: React.FC<IncomeFormActionsProps> = ({
  onClose,
  isLoading,
  isEdit,
  onSubmit,
}) => (
  <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
    <Button
      variant="outlined"
      size="small"
      onClick={() => onClose(null, false)}
      startIcon={<Iconify icon={GlobalIcons.cancel} />}
    >
      Cancel
    </Button>
    <LoadingButton
      startIcon={
        <Iconify icon={isEdit ? GlobalIcons.edit : GlobalIcons.submit} width={16} height={16} />
      }
      type="button"
      size="small"
      variant="contained"
      loading={isLoading}
      disabled={isLoading}
      onClick={onSubmit}
    >
      {isEdit ? 'Update' : 'Submit'}
    </LoadingButton>
  </DialogActions>
);

/**
 * Memoization Justification:
 * Actions area doesn't need to re-render when form fields change,
 * only when loading state or edit mode changes.
 */
export default React.memo(IncomeFormActions);
