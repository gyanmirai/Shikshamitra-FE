import type { TextFieldProps } from '@mui/material';

import { memo, useState } from 'react';
import {
  Box,
  Menu,
  Stack,
  Button,
  Popover,
  Tooltip,
  Checkbox,
  MenuItem,
  TextField,
  IconButton,
  CircularProgress,
  FormControlLabel,
} from '@mui/material';

import { Iconify } from '../../iconify';
import { extractTextFromReactNode } from '../utils';

import type { IColumn, TableExportFormat } from '../types';

interface TableToolbarProps {
  exportLabel: string;
  isSearch: boolean;
  showColumns: boolean;
  showExport: boolean;
  showFullScreen: boolean;
  exportBusy: boolean;
  onCancelExport?: () => void;
  exportDisabled: boolean;
  exportDisabledReason?: string;
  exportFormats: TableExportFormat[];
  searchValue: string;
  onSearch: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClearSearch: () => void;
  columns: IColumn[];
  columnVisibility: Record<string, boolean>;
  onColumnVisibilityChange: (columnId: string, isVisible: boolean) => void;
  onResetColumns: () => void;
  onExport: (format: TableExportFormat) => void;
  searchFieldProps?: TextFieldProps;
  isFullScreen: boolean;
  onToggleFullScreen: () => void;
}

export const TableToolbar = memo(
  ({
    exportLabel,
    isSearch,
    showColumns,
    showExport,
    showFullScreen,
    exportBusy,
    onCancelExport,
    exportDisabled,
    exportDisabledReason,
    exportFormats,
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
    const [columnAnchor, setColumnAnchor] = useState<HTMLElement | null>(null);
    const [exportAnchor, setExportAnchor] = useState<HTMLElement | null>(null);
    const [columnSearch, setColumnSearch] = useState('');
    if (!isSearch && !showColumns && !showExport && !showFullScreen) return null;
    return (
      <Stack
        direction="row"
        spacing={1}
        useFlexGap
        alignItems="center"
        flexWrap="wrap"
        sx={{ p: 1, flexShrink: 0, borderBottom: 1, borderColor: 'divider' }}
      >
        {isSearch && (
          <TextField
            size="small"
            placeholder="Search..."
            value={searchValue}
            onChange={onSearch}
            {...searchFieldProps}
            inputProps={{ 'aria-label': 'Search table', ...searchFieldProps.inputProps }}
            InputProps={{
              startAdornment: (
                <Iconify
                  icon="solar:magnifer-linear"
                  width={18}
                  sx={{ mr: 1, color: 'text.secondary' }}
                />
              ),
              endAdornment: searchValue ? (
                <IconButton size="small" aria-label="Clear search" onClick={onClearSearch}>
                  <Iconify icon="mingcute:close-line" width={18} />
                </IconButton>
              ) : undefined,
              ...searchFieldProps.InputProps,
            }}
            sx={{ width: { xs: '100%', sm: 300 }, ...searchFieldProps.sx }}
          />
        )}
        <Stack direction="row" spacing={1} alignItems="center" sx={{ ml: 'auto !important' }}>
          {exportBusy && onCancelExport && (
            <Button size="small" color="inherit" onClick={onCancelExport}>
              Cancel export
            </Button>
          )}
          {showColumns && (
            <>
              <Button
                size="small"
                color="inherit"
                variant="soft"
                startIcon={<Iconify icon="solar:eye-bold" width={18} />}
                aria-haspopup="dialog"
                aria-expanded={Boolean(columnAnchor)}
                onClick={(event) => setColumnAnchor(event.currentTarget)}
              >
                Columns
              </Button>
              <Popover
                open={Boolean(columnAnchor)}
                anchorEl={columnAnchor}
                onClose={() => setColumnAnchor(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <Stack spacing={1} sx={{ p: 2, width: 280, maxWidth: '90vw' }}>
                  <TextField
                    size="small"
                    label="Search columns"
                    value={columnSearch}
                    onChange={(event) => setColumnSearch(event.target.value)}
                  />
                  <Box sx={{ maxHeight: 280, overflowY: 'auto' }}>
                    {columns
                      .filter((column) =>
                        extractTextFromReactNode(column.label)
                          .toLowerCase()
                          .includes(columnSearch.toLowerCase())
                      )
                      .map((column) => (
                        <FormControlLabel
                          key={column.id}
                          sx={{ display: 'flex', mx: 0 }}
                          label={column.label}
                          control={
                            <Checkbox
                              size="small"
                              checked={Boolean(columnVisibility[column.id])}
                              onChange={(event) =>
                                onColumnVisibilityChange(column.id, event.target.checked)
                              }
                            />
                          }
                        />
                      ))}
                  </Box>
                  <Button
                    size="small"
                    color="inherit"
                    sx={{ alignSelf: 'flex-end' }}
                    onClick={() => {
                      setColumnSearch('');
                      onResetColumns();
                    }}
                  >
                    Reset
                  </Button>
                </Stack>
              </Popover>
            </>
          )}
          {showExport && (
            <>
              <Tooltip title={exportDisabledReason || ''}>
                <span>
                  <Button
                    size="small"
                    color="inherit"
                    variant="soft"
                    disabled={exportDisabled || exportBusy}
                    startIcon={
                      exportBusy ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : (
                        <Iconify icon="solar:export-bold" width={18} />
                      )
                    }
                    aria-haspopup="menu"
                    aria-expanded={Boolean(exportAnchor)}
                    onClick={(event) => setExportAnchor(event.currentTarget)}
                  >
                    {exportBusy ? 'Preparing export' : exportLabel}
                  </Button>
                </span>
              </Tooltip>
              <Menu
                anchorEl={exportAnchor}
                open={Boolean(exportAnchor)}
                onClose={() => setExportAnchor(null)}
              >
                {exportFormats.map((format) => (
                  <MenuItem
                    key={format}
                    onClick={() => {
                      setExportAnchor(null);
                      onExport(format);
                    }}
                  >
                    <Iconify
                      icon={
                        format === 'excel' ? 'file-icons:microsoft-excel' : 'solar:document-bold'
                      }
                      sx={{ mr: 1 }}
                    />
                    {format === 'excel' ? 'Excel' : 'PDF'}
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}
          {showFullScreen && (
            <Tooltip title={isFullScreen ? 'Exit full screen' : 'Full screen'}>
              <IconButton
                size="small"
                aria-label={isFullScreen ? 'Exit full screen' : 'Full screen'}
                onClick={onToggleFullScreen}
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
            </Tooltip>
          )}
        </Stack>
      </Stack>
    );
  }
);
