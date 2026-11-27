'use client';

import type { FC } from 'react';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Box, Stack, Button, Typography } from '@mui/material';
import { ConfirmDialog } from 'src/components/confirm-dialog';

export interface IDownstreamUsageWarningProps {
  open: boolean;
  itemName: string;
  itemType?: string; // e.g., 'Charge Category', 'Income Category'
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * Dialog warning that appears when updating an item that is already used downstream
 * Informs user that changes will affect other parts of the system
 */
export const DownstreamUsageWarning: FC<IDownstreamUsageWarningProps> = ({
  open,
  itemName,
  itemType = 'Item',
  onConfirm,
  onCancel,
  isLoading = false,
}) => (
  <ConfirmDialog
    open={open}
    title="Item is Already in Use"
    onClose={onCancel}
    disableBackdropClick={false}
    icon={<Iconify icon={GlobalIcons.info} width={24} sx={{ color: 'text.secondary' }} />}
    content={
      <Stack spacing={1.5}>
        <Box
          sx={{
            p: 1.5,
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            bgcolor: 'action.hover',
            overflowWrap: 'anywhere',
          }}
        >
          <Typography variant="caption" component="div" color="text.secondary">
            {itemType}
          </Typography>
          <Typography variant="subtitle2" component="div">
            {itemName}
          </Typography>
        </Box>
        <Typography variant="body2">Changes will appear wherever this item is used.</Typography>
        <Typography variant="subtitle2" component="p">
          Do you want to continue?
        </Typography>
      </Stack>
    }
    action={
      <Button
        type="button"
        size="small"
        variant="contained"
        color="inherit"
        onClick={onConfirm}
        loading={isLoading}
        startIcon={<Iconify icon={GlobalIcons.edit} width={18} />}
      >
        Continue Update
      </Button>
    }
  />
);

export default DownstreamUsageWarning;
