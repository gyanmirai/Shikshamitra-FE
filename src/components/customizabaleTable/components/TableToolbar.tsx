import React, { useState } from 'react';
import { varAlpha } from 'src/theme/styles';
import { useTheme } from '@mui/material/styles';
import {
  Clear as ClearIcon,
  Search as SearchIcon,
  RemoveRedEye as RemoveRedEyeIcon,
} from '@mui/icons-material';
import {
  Box,
  Menu,
  Button,
  Popover,
  Checkbox,
  MenuItem,
  TextField,
  IconButton,
  FormControlLabel,
} from '@mui/material';

import { Iconify } from '../../iconify';
import CustomTooltip from '../../custom-tooltip';

import type { IColumn } from '../types';

interface TableToolbarProps {
  isSearch: boolean;
  isFilter: boolean;
  searchValue: string;
  onSearch: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClearSearch: () => void;
  columns: IColumn[];
  columnVisibility: Record<string, boolean>;
  onColumnVisibilityChange: (columnId: string, isVisible: boolean) => void;
  onResetColumns: () => void;
  onExport: (format: string) => void;
  searchFieldProps?: any;
  isFullScreen: boolean;
  onToggleFullScreen: () => void;
}

/**
 * Memoization Justification:
 * Toolbar contains inputs and complex interactions.
 * Memoizing usage in parent prevents re-renders when only table data updates.
 */
export const TableToolbar = React.memo(
  ({
    isSearch,
    isFilter,
    searchValue,
    onSearch,
    onClearSearch,
    columns,
    columnVisibility,
    onColumnVisibilityChange,
    onResetColumns,
    onExport,
    searchFieldProps = {},
    isFullScreen,
    onToggleFullScreen,
  }: TableToolbarProps) => {
    const theme = useTheme();
    // Fullscreen state is now managed by parent
    const [anchorColumnEl, setColumnAnchorEl] = useState<null | HTMLElement>(null);
    const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);
    const [columnSearchTerm, setColumnSearchTerm] = useState('');

    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          p: 2.5,
          gap: 2,
          flexShrink: 0,
          borderBottom: `1px dashed ${varAlpha(theme.vars.palette.grey['500Channel'], 0.2)}`,
          flexWrap: 'wrap',
        }}
      >
        {isSearch && (
          <TextField
            variant="outlined"
            size="small"
            value={searchValue}
            onChange={onSearch}
            placeholder="Search..."
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: 'text.disabled', mr: 1, fontSize: 20 }} />,
              endAdornment: searchValue && (
                <IconButton size="small" onClick={onClearSearch} edge="end">
                  <ClearIcon sx={{ fontSize: 18 }} />
                </IconButton>
              ),
              sx: {
                borderRadius: 1.5,
                bgcolor: varAlpha(theme.vars.palette.grey['500Channel'], 0.04),
                fontSize: '14px',
                '& fieldset': {
                  border: `1px solid ${varAlpha(theme.vars.palette.grey['500Channel'], 0.2)}`,
                },
                '&:hover fieldset': {
                  borderColor: `${varAlpha(theme.vars.palette.grey['500Channel'], 0.4)} !important`,
                },
              },
            }}
            sx={{
              maxWidth: '300px',
              width: '100%',
              '& .MuiInputBase-root': {
                pr: 1,
              },
            }}
            {...searchFieldProps}
          />
        )}

        {isFilter && (
          <Box flexGrow={1} display="flex" justifyContent="flex-end" alignItems="center" gap={1}>
            <Box sx={{ ml: 2 }}>
              <Button
                variant="soft"
                color="inherit"
                size="small"
                startIcon={<RemoveRedEyeIcon sx={{ width: 18, height: 18 }} />}
                onClick={(event) => setColumnAnchorEl(event.currentTarget)}
                sx={{
                  borderRadius: 1,
                  color: 'text.secondary',
                  fontWeight: 600,
                }}
              >
                Columns
              </Button>
              <Popover
                open={Boolean(anchorColumnEl)}
                anchorEl={anchorColumnEl}
                onClose={() => setColumnAnchorEl(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{
                  paper: {
                    sx: {
                      width: 280,
                      p: 2,
                      borderRadius: 1.5,
                      boxShadow: theme.customShadows?.dropdown || '0px 5px 20px rgba(0,0,0,0.1)',
                    },
                  },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '400px',
                  }}
                >
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search columns..."
                    value={columnSearchTerm}
                    onChange={(e) => setColumnSearchTerm(e.target.value)}
                    sx={{
                      mb: 2,
                      flexShrink: '0',
                      '& .MuiInputBase-root': { borderRadius: 1.5 },
                    }}
                  />
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      flex: 1,
                      overflowY: 'auto',
                      gap: 1,
                    }}
                  >
                    {columns
                      .filter((column) => {
                        if (typeof column?.label !== 'string') return false;
                        const lbl = column.label as string;
                        return (
                          lbl.trim() && lbl.toLowerCase().includes(columnSearchTerm.toLowerCase())
                        );
                      })
                      .map((column) => (
                        <FormControlLabel
                          key={column.id}
                          sx={{
                            ml: 0,
                            mr: 0,
                            justifyContent: 'space-between',
                            flexDirection: 'row-reverse',
                            '& .MuiTypography-root': { fontSize: '14px', fontWeight: 500 },
                          }}
                          control={
                            <Checkbox
                              checked={!!columnVisibility[column.id]}
                              size="small"
                              disableRipple
                              onChange={(e) =>
                                onColumnVisibilityChange(column.id, e.target.checked)
                              }
                            />
                          }
                          label={column.label}
                        />
                      ))}
                  </Box>
                  <Box
                    sx={{
                      mt: 2,
                      display: 'flex',
                      justifyContent: 'flex-end',
                      pt: 2,
                      borderTop: `1px dashed ${theme.vars.palette.divider}`,
                    }}
                  >
                    <Button
                      size="small"
                      color="inherit"
                      onClick={() => {
                        setColumnSearchTerm('');
                        onResetColumns();
                      }}
                    >
                      Reset
                    </Button>
                  </Box>
                </Box>
              </Popover>
            </Box>

            <Box>
              <Button
                startIcon={<Iconify icon="solar:export-bold" width={18} />}
                size="small"
                variant="soft"
                color="inherit"
                onClick={(event) => setExportAnchorEl(event.currentTarget)}
                sx={{
                  borderRadius: 1,
                  color: 'text.secondary',
                  fontWeight: 600,
                }}
              >
                Export
              </Button>
              <Menu
                anchorEl={exportAnchorEl}
                open={Boolean(exportAnchorEl)}
                onClose={() => setExportAnchorEl(null)}
                slotProps={{
                  paper: { sx: { width: 160, borderRadius: 1.5, mt: 1 } },
                }}
              >
                <MenuItem
                  onClick={() => {
                    onExport('excel');
                    setExportAnchorEl(null);
                  }}
                >
                  <Iconify icon="solar:document-bold" />
                  &nbsp; Export as Excel
                </MenuItem>

                <MenuItem
                  onClick={() => {
                    onExport('pdf');
                    setExportAnchorEl(null);
                  }}
                >
                  <Iconify icon="solar:document-bold" />
                  &nbsp; Export as PDF
                </MenuItem>

                <MenuItem
                  onClick={() => {
                    onExport('print');
                    setExportAnchorEl(null);
                  }}
                >
                  <Iconify icon="solar:printer-bold" />
                  &nbsp; Print
                </MenuItem>
              </Menu>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', p: 0, gap: 1 }}>
              <CustomTooltip
                arrow
                placement="top"
                title={isFullScreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                <IconButton
                  onClick={async () => {
                    if (!document.fullscreenElement) {
                      try {
                        await document.documentElement.requestFullscreen();
                      } catch (e) {
                        console.error('Fullscreen failed', e);
                      }
                    } else if (document.exitFullscreen) {
                      await document.exitFullscreen();
                    }
                    onToggleFullScreen();
                  }}
                  sx={{
                    color: 'text.secondary',
                    bgcolor: varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
                    borderRadius: 1,
                    p: 0.75,
                    '&:hover': {
                      bgcolor: varAlpha(theme.vars.palette.grey['500Channel'], 0.16),
                    },
                  }}
                >
                  <Iconify
                    width={20}
                    icon={
                      isFullScreen
                        ? 'solar:minimize-square-3-outline'
                        : 'solar:maximize-square-3-outline'
                    }
                  />
                </IconButton>
              </CustomTooltip>
            </Box>
          </Box>
        )}
      </Box>
    );
  }
);
