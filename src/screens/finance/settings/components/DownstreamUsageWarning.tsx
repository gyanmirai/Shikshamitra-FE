'use client';

import React from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import {
  Box,
  Button,
  Dialog,
  Divider,
  Typography,
  DialogTitle,
  DialogActions,
  DialogContent,
} from '@mui/material';

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
export const DownstreamUsageWarning: React.FC<IDownstreamUsageWarningProps> = ({
  open,
  itemName,
  itemType = 'item',
  onConfirm,
  onCancel,
  isLoading = false,
}) => (
  <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
    <DialogTitle>
      <Box display="flex" alignItems="center" gap={1}>
        <Iconify icon="lucide:alert-circle" color="warning.main" width={24} height={24} />
        <Typography variant="h6">Item is Already in Use</Typography>
      </Box>
    </DialogTitle>
    <Divider />
    <DialogContent>
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" paragraph>
          The {itemType} <strong>{itemName}</strong> is currently being used in other parts of the
          system.
        </Typography>
        <Typography variant="body2" paragraph>
          If you proceed with the update, the changes will be reflected wherever this {itemType} is
          used.
        </Typography>
        <Typography variant="body2" color="warning.main" sx={{ fontWeight: 600 }}>
          Do you want to continue?
        </Typography>
      </Box>
    </DialogContent>
    <DialogActions>
      <Button
        variant="outlined"
        onClick={onCancel}
        disabled={isLoading}
        size="small"
        startIcon={<Iconify icon={GlobalIcons.cancel} width={16} height={16} />}
      >
        Cancel
      </Button>
      <Button
        size="small"
        variant="contained"
        color="warning"
        onClick={onConfirm}
        disabled={isLoading}
        loading={isLoading}
        startIcon={<Iconify icon={GlobalIcons.edit} width={20} height={20} />}
      >
        Continue Update
      </Button>
    </DialogActions>
  </Dialog>
);

export default DownstreamUsageWarning;
