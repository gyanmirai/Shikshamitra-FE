import React from 'react';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { Box, Button, Popover, Checkbox, TextField, FormControlLabel } from '@mui/material';

import type { IColumn } from '../type';

interface ColumnVisibilityProps {
  columns: IColumn[];
  columnVisibility: { [key: string]: boolean };
  columnSearchTerm: string;
  onColumnSearchChange: (value: string) => void;
  onColumnVisibilityChange: (columnId: string, visible: boolean) => void;
  onReset: () => void;
}

export const ColumnVisibility: React.FC<ColumnVisibilityProps> = ({
  columns,
  columnVisibility,
  columnSearchTerm,
  onColumnSearchChange,
  onColumnVisibilityChange,
  onReset,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  return (
    <Box sx={{ ml: 2 }}>
      <Button
        size="small"
        startIcon={<RemoveRedEyeIcon />}
        onClick={(event) => setAnchorEl(event.currentTarget)}
      >
        Columns
      </Button>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <Box
          sx={{
            p: 2,
            width: 250,
            display: 'flex',
            flexDirection: 'column',
            height: '400px',
          }}
        >
          <TextField
            fullWidth
            size="small"
            label="Search columns"
            value={columnSearchTerm}
            onChange={(e) => onColumnSearchChange(e.target.value)}
            sx={{ mb: 2, flexShrink: '0', background: 'white', zIndex: '1' }}
          />
          <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
            {columns
              .filter(
                (column) =>
                  typeof column?.label === 'string' &&
                  column.label.trim() &&
                  column.label.toLowerCase().includes(columnSearchTerm.toLowerCase())
              )
              .map((column) => (
                <FormControlLabel
                  key={column.id}
                  sx={{ ml: 0 }}
                  control={
                    <Checkbox
                      checked={columnVisibility[column.id]}
                      onChange={(e) => onColumnVisibilityChange(column.id, e.target.checked)}
                    />
                  }
                  label={column.label}
                />
              ))}
          </Box>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button size="small" onClick={onReset}>
              Reset
            </Button>
          </Box>
        </Box>
      </Popover>
    </Box>
  );
};
