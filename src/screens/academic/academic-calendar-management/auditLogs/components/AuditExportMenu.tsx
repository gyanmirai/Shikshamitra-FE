'use client';

import { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { Iconify } from 'src/components/iconify';
import { alpha, useTheme } from '@mui/material/styles';
import { shikshaMitraToast } from 'src/components/toast';
import {
  Box,
  Menu,
  Stack,
  Switch,
  MenuItem,
  Typography,
  ListItemIcon,
  ListItemText,
  FormControlLabel,
} from '@mui/material';

interface Props {
  /** Anchor element for the menu (from button click). */
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
}

const FORMATS = [
  {
    key: 'excel',
    label: 'Export Current View as Excel',
    icon: 'mdi:file-excel-outline',
    color: 'success.main',
  },
  {
    key: 'pdf',
    label: 'Export Current View as PDF',
    icon: 'mdi:file-pdf-box',
    color: 'error.main',
  },
  { key: 'csv', label: 'Export as CSV', icon: 'mdi:file-delimited-outline', color: 'info.main' },
];

const OPTIONS = [
  { key: 'selected', label: 'Export Selected Logs Only', icon: 'mdi:checkbox-multiple-outline' },
  { key: 'full', label: 'Export Full Audit Trail', icon: 'mdi:folder-zip-outline' },
  { key: 'withDiff', label: 'Include Diff Details', icon: 'mdi:compare-horizontal' },
  { key: 'weekly', label: 'Export Weekly Audit Report', icon: 'mdi:calendar-export' },
];

/** Export dropdown menu with format + options. */
const AuditExportMenu = ({ anchorEl, open, onClose }: Props) => {
  const theme = useTheme();
  const [exporting, setExporting] = useState(false);
  const [withDiff, setWithDiff] = useState(true);

  const handleExport = (format: string) => {
    setExporting(true);
    // Mock export — replace with real API call to /audit-logs/export
    setTimeout(() => {
      setExporting(false);
      onClose();
      shikshaMitraToast.success({
        message: `Preparing ${format.toUpperCase()} audit report${withDiff ? ' with diff details' : ''}...`,
      });
    }, 1200);
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            mt: 1,
            minWidth: 320,
            p: 0,
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: theme.shadows[8],
          },
        },
      }}
    >
      <Box sx={{ p: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Stack direction="row" alignItems="center" gap={1}>
          <Iconify icon="mdi:download" width={16} color="primary.main" />
          <Typography variant="subtitle2" fontWeight={700}>
            Export Audit Logs
          </Typography>
        </Stack>
      </Box>

      {/* Formats */}
      <Box sx={{ p: 0.75 }}>
        {FORMATS.map((f) => (
          <MenuItem
            key={f.key}
            onClick={() => handleExport(f.key)}
            disabled={exporting}
            sx={{ borderRadius: 1, py: 1 }}
          >
            <ListItemIcon>
              <Iconify icon={f.icon} width={20} sx={{ color: f.color }} />
            </ListItemIcon>
            <ListItemText
              primary={f.label}
              primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
            />
          </MenuItem>
        ))}
      </Box>

      {/* Options */}
      <Box sx={{ p: 1.25, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Typography
          variant="caption"
          color="text.secondary"
          fontWeight={700}
          sx={{ mb: 0.5, display: 'block' }}
        >
          Options
        </Typography>
        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={withDiff}
              onChange={(e) => setWithDiff(e.target.checked)}
            />
          }
          label={
            <Stack direction="row" alignItems="center" gap={1}>
              <Iconify icon="mdi:compare-horizontal" width={14} color="text.secondary" />
              <Typography variant="caption">Include diff details</Typography>
            </Stack>
          }
          sx={{ m: 0 }}
        />
      </Box>

      {/* Quick options (non-functional placeholders for future) */}
      <Box sx={{ p: 0.75, borderTop: `1px solid ${theme.palette.divider}` }}>
        {OPTIONS.slice(0, 2).map((o) => (
          <MenuItem
            key={o.key}
            onClick={() => handleExport(o.key === 'full' ? 'zip' : 'excel')}
            disabled={exporting}
            sx={{ borderRadius: 1, py: 0.75 }}
          >
            <ListItemIcon>
              <Iconify icon={o.icon} width={18} color="text.secondary" />
            </ListItemIcon>
            <ListItemText
              primary={o.label}
              primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
            />
          </MenuItem>
        ))}
      </Box>

      {exporting && (
        <Box
          sx={{
            p: 1.5,
            borderTop: `1px solid ${theme.palette.divider}`,
            backgroundColor: alpha(theme.palette.primary.main, 0.03),
          }}
        >
          <LoadingButton
            loading
            fullWidth
            variant="outlined"
            color="primary"
            sx={{ borderRadius: 1.5 }}
          >
            Preparing audit report...
          </LoadingButton>
        </Box>
      )}
    </Menu>
  );
};

export default AuditExportMenu;
