import React from 'react';
import { LoadingButton } from '@mui/lab';
import { Box, Button } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';

interface IFormFooterProps {
  disabled?: boolean;
  isEdit?: boolean;
  loading?: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}

const FormFooter: React.FC<IFormFooterProps> = ({
  disabled,
  isEdit,
  loading,
  onCancel,
  onSubmit,
}) => (
  <Box
    sx={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      bgcolor: (theme) => theme.vars.palette.background.paper,
      backdropFilter: 'saturate(180%) blur(10px)',
      WebkitBackdropFilter: 'saturate(180%) blur(10px)',
      borderTop: '1px solid',
      borderColor: 'divider',
      px: { xs: 2, sm: 3 },
      py: 1.5,
      display: 'flex',
      gap: 1,
      justifyContent: 'flex-end',
      alignItems: 'center',
      zIndex: 10,
      boxShadow: (theme) =>
        `0 -6px 20px ${alpha(theme.palette.common.black, theme.palette.mode === 'dark' ? 0.4 : 0.06)}`,
    }}
  >
    <Button
      variant="text"
      size="small"
      startIcon={<Iconify icon={GlobalIcons.cancel} />}
      onClick={onCancel}
    >
      Cancel
    </Button>
    <LoadingButton
      variant="contained"
      size="small"
      disabled={disabled}
      loading={loading}
      startIcon={<Iconify icon={isEdit ? GlobalIcons.edit : GlobalIcons.submit} />}
      onClick={onSubmit}
    >
      {isEdit ? 'Update' : 'Submit'}
    </LoadingButton>
  </Box>
);

export default FormFooter;
