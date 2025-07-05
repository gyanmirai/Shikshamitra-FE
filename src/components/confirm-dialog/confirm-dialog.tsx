import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import { Close } from '@mui/icons-material';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { Box, Divider, useTheme, IconButton, Typography } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { Iconify } from '../iconify';

import type { ConfirmDialogProps } from './types';

// ----------------------------------------------------------------------

export function ConfirmDialog({
  title,
  content,
  action,
  open,
  onClose,
  ...other
}: ConfirmDialogProps) {
  const theme = useTheme();

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose} {...other}>
      <Box display="flex" justifyContent="space-between">
        <Typography variant="h6" pl={3} pt={1}>
          {title}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: theme.palette.grey[500],
            pr: 1,
          }}
        >
          <Close />
        </IconButton>
      </Box>
      {/* <DialogTitle sx={{ pb: 2 }}>{title}</DialogTitle> */}

      <Divider />
      {content && (
        <DialogContent sx={{ typography: 'body2', p: 2, py: 2.5 }}> {content} </DialogContent>
      )}
      {/* <Divider /> */}

      <DialogActions>
        <Button
          variant="outlined"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          color="inherit"
          onClick={onClose}
          size="small"
        >
          Cancel
        </Button>
        {action}
      </DialogActions>
    </Dialog>
  );
}
