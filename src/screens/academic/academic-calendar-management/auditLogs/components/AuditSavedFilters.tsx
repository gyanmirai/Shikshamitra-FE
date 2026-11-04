import { useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  Box,
  Stack,
  Button,
  TextField,
  IconButton,
  Typography,
  DialogActions,
} from '@mui/material';

import { EMPTY_FILTERS, DEFAULT_SAVED_FILTERS } from '../constants/auditLogs.constants';

import type { AuditFilterState, SavedAuditFilter } from '../types/auditLogs.types';

const STORAGE_KEY = 'audit-saved-filters';

export default function AuditSavedFilters({
  filters,
  onApply,
  onClose,
}: {
  filters: AuditFilterState;
  onApply: (filters: AuditFilterState) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState<SavedAuditFilter[]>(() => {
    try {
      const raw: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      return Array.isArray(raw)
        ? raw.filter(
            (item): item is SavedAuditFilter =>
              item &&
              typeof item.id === 'string' &&
              typeof item.name === 'string' &&
              typeof item.filters === 'object' &&
              item.filters !== null &&
              item.id !== 'preset-critical-month'
          )
        : DEFAULT_SAVED_FILTERS;
    } catch {
      return DEFAULT_SAVED_FILTERS;
    }
  });
  const persist = (next: SavedAuditFilter[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setSaved(next);
      setError('');
      return true;
    } catch {
      setError('Presets could not be saved on this device. Please try again.');
      return false;
    }
  };
  const save = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Enter a preset name.');
      return;
    }
    if (saved.some((item) => item.name.toLowerCase() === trimmed.toLowerCase())) {
      setError('A preset with this name already exists.');
      return;
    }
    if (persist([...saved, { id: `sf-${Date.now()}`, name: trimmed, filters: { ...filters } }])) {
      setName('');
    }
  };
  return (
    <CustomDialog
      open
      handleClose={onClose}
      title="Saved Filters"
      titleInfo="Presets are saved on this device. Only Action applies to the full history; other criteria apply to the current page."
      maxWidth="sm"
      hasForm={false}
    >
      <DialogScrollContent>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <TextField
              fullWidth
              size="small"
              label="Preset name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <Button
              size="small"
              variant="contained"
              color="inherit"
              sx={{ flexShrink: 0 }}
              disabled={!name.trim()}
              onClick={save}
            >
              Save preset
            </Button>
          </Stack>
          {error && (
            <Typography role="alert" variant="body2" color="error.main">
              {error}
            </Typography>
          )}
          {saved.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              No saved presets yet.
            </Typography>
          )}
          {saved.map((preset) => (
            <Stack key={preset.id} direction="row" spacing={1} alignItems="center">
              <Box sx={{ flex: 1, minWidth: 0, overflowWrap: 'anywhere' }}>
                <Typography variant="body2">{preset.name}</Typography>
              </Box>
              <Button
                size="small"
                variant="outlined"
                color="inherit"
                aria-label={`Apply ${preset.name}`}
                onClick={() => {
                  const {
                    riskLevel: _risk,
                    source: _source,
                    ...criteria
                  } = preset.filters as AuditFilterState & { riskLevel?: string; source?: string };
                  onApply({ ...EMPTY_FILTERS, ...criteria });
                  onClose();
                  shikshaMitraToast.success({ message: `Applied "${preset.name}" filter preset` });
                }}
              >
                Apply
              </Button>
              <IconButton
                size="small"
                aria-label={`Delete preset ${preset.name}`}
                title={`Delete preset ${preset.name}`}
                onClick={() => persist(saved.filter((item) => item.id !== preset.id))}
              >
                <Iconify icon={GlobalIcons.delete} width={16} />
              </IconButton>
            </Stack>
          ))}
        </Stack>
      </DialogScrollContent>
      <DialogActions>
        <Button size="small" variant="outlined" color="inherit" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}
