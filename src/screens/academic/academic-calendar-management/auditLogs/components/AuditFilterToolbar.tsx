import { useRef, useEffect } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { CALENDAR_AUDIT_ACTION_LABELS } from 'src/enums/academic-calendar';
import { Box, Stack, Button, TextField, IconButton, InputAdornment } from '@mui/material';

import type { AuditFilterState } from '../types/auditLogs.types';

const ACTION_OPTIONS = [
  { label: 'All actions', value: 'all' },
  ...Object.entries(CALENDAR_AUDIT_ACTION_LABELS).map(([value, label]) => ({ value, label })),
];

interface Props {
  filters: AuditFilterState;
  onChange: (filters: AuditFilterState) => void;
  onReset: () => void;
  onAdvanced: () => void;
  onSaved: () => void;
  canManageSavedFilters: boolean;
}

export default function AuditFilterToolbar({
  filters,
  onChange,
  onReset,
  onAdvanced,
  onSaved,
  canManageSavedFilters,
}: Props) {
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (
        event.key === '/' &&
        !event.ctrlKey &&
        !event.metaKey &&
        !target.closest('input, textarea, [contenteditable="true"], [role="dialog"]')
      ) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', focusSearch);
    return () => window.removeEventListener('keydown', focusSearch);
  }, []);
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'minmax(0, 1fr) minmax(0, 1fr)',
          lg: 'minmax(220px, 1fr) minmax(180px, 0.6fr) auto',
        },
        gap: 1,
        alignItems: 'center',
      }}
    >
      <TextField
        inputRef={searchRef}
        size="small"
        fullWidth
        label="Search this page"
        placeholder="Search audit logs ( / )"
        value={filters.search}
        onChange={(event) => onChange({ ...filters, search: event.target.value })}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="mdi:magnify" width={18} />
            </InputAdornment>
          ),
          endAdornment: filters.search ? (
            <InputAdornment position="end">
              <IconButton
                size="small"
                aria-label="Clear audit search"
                onClick={() => onChange({ ...filters, search: '' })}
              >
                <Iconify icon={GlobalIcons.cancel} width={16} />
              </IconButton>
            </InputAdornment>
          ) : null,
        }}
      />
      <CustomSelect
        label="Action"
        size="small"
        fullWidth
        value={filters.action || 'all'}
        options={ACTION_OPTIONS}
        onChange={(value) => onChange({ ...filters, action: value === 'all' ? '' : String(value) })}
      />
      <Stack
        direction="row"
        spacing={1}
        useFlexGap
        flexWrap="wrap"
        justifyContent="flex-end"
        sx={{ gridColumn: { sm: '1 / -1', lg: 'auto' } }}
      >
        <Button
          size="small"
          variant="outlined"
          color="inherit"
          startIcon={<Iconify icon={GlobalIcons.applyFilter} />}
          onClick={onAdvanced}
        >
          More filters
        </Button>
        {canManageSavedFilters && (
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            startIcon={<Iconify icon="mdi:bookmark-outline" />}
            onClick={onSaved}
            aria-label="Saved filters"
          >
            Saved
          </Button>
        )}
        <Button
          size="small"
          color="inherit"
          disabled={!Object.values(filters).some(Boolean)}
          startIcon={<Iconify icon={GlobalIcons.resetFilter} />}
          onClick={onReset}
          sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
        >
          Reset
        </Button>
        <IconButton
          size="small"
          aria-label="Reset audit filters"
          title="Reset audit filters"
          disabled={!Object.values(filters).some(Boolean)}
          onClick={onReset}
          sx={{ display: { xs: 'inline-flex', sm: 'none' } }}
        >
          <Iconify icon={GlobalIcons.resetFilter} width={18} />
        </IconButton>
      </Stack>
    </Box>
  );
}
