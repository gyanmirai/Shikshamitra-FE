import React from 'react';
import { Box, Menu, Button, MenuItem } from '@mui/material';

import { Iconify } from '../../iconify';

interface TableExportProps {
  onExport: (format: string) => void;
}

export const TableExport: React.FC<TableExportProps> = ({ onExport }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  return (
    <Box>
      <Button
        startIcon={<Iconify icon="solar:export-bold" />}
        size="small"
        onClick={(event) => setAnchorEl(event.currentTarget)}
      >
        Export
      </Button>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={() => onExport('excel')}>
          <Iconify icon="solar:document-bold" />
          &nbsp; Export as Excel
        </MenuItem>
        <MenuItem onClick={() => onExport('pdf')}>
          <Iconify icon="solar:document-bold" />
          &nbsp; Export as PDF
        </MenuItem>
      </Menu>
    </Box>
  );
};
