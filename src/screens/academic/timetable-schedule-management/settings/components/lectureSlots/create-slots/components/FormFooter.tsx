import React from 'react';
import { Box, Button } from '@mui/material';
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
        flexShrink: 0,
        bgcolor: (theme) => theme.vars.palette.background.paper,
        borderTop: '1px solid',
        borderColor: 'divider',
        px: { xs: 2, sm: 3 },
        py: 1.5,
        display: 'flex',
        gap: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
      }}
    >
      <Button
        variant="outlined"
        color="inherit"
        size="small"
        startIcon={<Iconify icon={GlobalIcons.cancel} width={18} />}
        disabled={loading}
        onClick={onCancel}
      >
        Cancel
      </Button>
      <Button
        aria-label={isEdit ? 'Submit lecture slot changes' : 'Submit lecture slots'}
        variant="contained"
        size="small"
        disabled={disabled}
        loading={loading}
        color="inherit"
        startIcon={<Iconify icon={GlobalIcons.submit} width={18} />}
        onClick={onSubmit}
      >
        Submit
      </Button>
    </Box>
  );

export default FormFooter;
