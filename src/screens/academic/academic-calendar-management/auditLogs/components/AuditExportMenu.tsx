'use client';

import { useRef, useState } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { Box, Menu, Stack, Switch, MenuItem, Typography, FormControlLabel } from '@mui/material';

import { exportAuditLogs } from '../utils/auditExport';

import type { AuditLog } from '../types/auditLogs.types';

type Props = { anchorEl: HTMLElement | null; open: boolean; onClose: () => void; logs: AuditLog[] };

export default function AuditExportMenu({ anchorEl, open, onClose, logs }: Props) {
  const [exporting, setExporting] = useState(false);
  const [withDiff, setWithDiff] = useState(true);
  const busy = useRef(false);
  const download = async (format: string) => {
    if (busy.current) return;
    busy.current = true;
    setExporting(true);
    try {
      await exportAuditLogs(format, logs, withDiff);
      shikshaMitraToast.success({ message: `Downloaded ${logs.length} displayed audit logs.` });
      onClose();
    } catch (error) {
      shikshaMitraToast.error({
        message: error instanceof Error ? error.message : 'Audit export failed. Please retry.',
      });
    } finally {
      busy.current = false;
      setExporting(false);
    }
  };
  return (
    <Menu anchorEl={anchorEl} open={open} onClose={() => !exporting && onClose()}>
      <Box sx={{ px: 2, py: 1 }}>
        <Typography variant="subtitle2">Export Displayed Audit Logs</Typography>
        <Typography variant="caption" color="text.secondary">
          {logs.length} filtered rows on this page
        </Typography>
      </Box>
      {['excel', 'pdf', 'csv'].map((format) => (
        <MenuItem
          key={format}
          disabled={exporting || !logs.length}
          onClick={() => download(format)}
        >
          Export displayed logs as {format === 'excel' ? 'Excel' : format.toUpperCase()}
        </MenuItem>
      ))}
      <Stack sx={{ px: 2, py: 1 }}>
        <FormControlLabel
          label="Include diff details"
          control={
            <Switch
              size="small"
              checked={withDiff}
              disabled={exporting}
              onChange={(event) => setWithDiff(event.target.checked)}
            />
          }
        />
        {exporting && (
          <Typography role="status" variant="caption">
            Preparing download...
          </Typography>
        )}
      </Stack>
    </Menu>
  );
}
