'use client';

import type { Medium } from 'src/types/school';
import type { RootState } from 'src/redux/store';

import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import React, { useMemo, useState, useCallback } from 'react';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';
import ColorPickerCircle from 'src/components/static-color/colorPickerCircle';
import {
  Box,
  Chip,
  Drawer,
  Button,
  Divider,
  TextField,
  IconButton,
  Typography,
} from '@mui/material';
import {
  useAddSubjectMutation,
  useGetCoreSubjectsByMediumQuery,
} from 'src/redux/academicAPI/CurriculumManagementApi/Setting/Core-SubjectApi';

import type { IPendingRow } from './type';

// ─────────────────────────────────────────────────────────────
interface SubjectAddDrawerProps {
  open: boolean;
  onClose: () => void;
}

const SubjectAddDrawer: React.FC<SubjectAddDrawerProps> = ({ open, onClose }) => {
  const { currentMedium } = useSelector((state: RootState) => state.globalState);

  const { data: existingSubjects } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetCoreSubjectsByMediumQuery,
    params: { academicMediumId: (currentMedium as Medium)?.id },
    options: { skip: !(currentMedium as Medium)?.id },
  });

  const [addSubject, { isLoading: isSaving }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddSubjectMutation,
  });

  const [rows, setRows] = useState<IPendingRow[]>([
    { tempId: `temp-${Date.now()}`, name: '', color: '' },
  ]);
  const [showErrors, setShowErrors] = useState(false);

  // Lowercase set of existing names for O(1) duplicate look-ups
  const existingNames = useMemo(
    () => new Set((existingSubjects || []).map((s: any) => s.name.trim().toLowerCase())),
    [existingSubjects]
  );

  // ── Row helpers ──
  const addRow = useCallback(() => {
    setRows((prev) => [
      ...prev,
      { tempId: `temp-${Date.now()}-${Math.random()}`, name: '', color: '' },
    ]);
  }, []);

  const updateRow = useCallback((tempId: string, field: 'name' | 'color', value: string) => {
    setRows((prev) => prev.map((r) => (r.tempId === tempId ? { ...r, [field]: value } : r)));
  }, []);

  const removeRow = useCallback((tempId: string) => {
    setRows((prev) => {
      const next = prev.filter((r) => r.tempId !== tempId);
      // Always keep at least one empty row
      return next.length === 0 ? [{ tempId: `temp-${Date.now()}`, name: '', color: '' }] : next;
    });
  }, []);

  // Returns an error string if the name is a duplicate, null otherwise
  const getDuplicateError = useCallback(
    (name: string, tempId: string): string | null => {
      const trimmed = name.trim().toLowerCase();
      if (!trimmed) return null;
      if (existingNames.has(trimmed)) return 'Subject already exists';
      const countInList = rows.filter(
        (r) => r.tempId !== tempId && r.name.trim().toLowerCase() === trimmed
      ).length;
      return countInList > 0 ? 'Duplicate in this list' : null;
    },
    [existingNames, rows]
  );

  // ── Close & reset ──
  const resetAndClose = useCallback(() => {
    onClose();
    // Reset after the drawer close animation finishes
    setTimeout(() => {
      setRows([{ tempId: `temp-${Date.now()}`, name: '', color: '' }]);
      setShowErrors(false);
    }, 300);
  }, [onClose]);

  // ── Save ──
  const handleSave = async () => {
    const hasError = rows.some(
      (r) => !r.name.trim() || !r.color || !!getDuplicateError(r.name, r.tempId)
    );
    if (hasError) {
      setShowErrors(true);
      shikshaMitraToast.error({ message: 'Please fix all errors before saving.' });
      return;
    }
    setShowErrors(false);
    try {
      await Promise.all(
        rows.map((row) =>
          (addSubject as any)({
            academicMediumId: (currentMedium as Medium).id,
            body: {
              name: row.name.trim(),
              color: row.color,
              educationMediumId: (currentMedium as Medium).id,
            },
          }).unwrap()
        )
      );
      shikshaMitraToast.success({
        message:
          rows.length === 1
            ? `"${rows[0].name.trim()}" added successfully`
            : `${rows.length} subjects added successfully`,
      });
      resetAndClose();
    } catch (error) {
      console.error('Failed to save subjects', error);
    }
  };

  // ─────────────────────────────────────────────────────────
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={resetAndClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 440 },
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* ── Header ── */}
      <Box
        sx={{
          px: 2.5,
          py: 1.75,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'divider',
          flexShrink: 0,
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="h6" fontWeight={600}>
            Add Subjects
          </Typography>
          <CustomTooltip
            arrow
            placement="bottom"
            title="Add one or more subjects at once. Duplicate subject names are not allowed."
          >
            <Iconify icon="lucide:info" color="info.main" sx={{ cursor: 'pointer' }} />
          </CustomTooltip>
          <Chip
            label={rows.length}
            size="small"
            color="primary"
            sx={{ height: 20, fontSize: '11px', fontWeight: 700 }}
          />
        </Box>
        <IconButton size="small" onClick={resetAndClose} disabled={isSaving}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* ── Scrollable body ── */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          px: 2.5,
          py: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {rows.map((row, index) => {
          const nameEmpty = showErrors && !row.name.trim();
          const dupError = row.name.trim() ? getDuplicateError(row.name, row.tempId) : null;
          const nameError: string | null = nameEmpty ? 'Subject name is required' : dupError;
          const colorError = showErrors && !row.color;

          return (
            <Box
              key={row.tempId}
              sx={{
                p: 2,
                borderRadius: 1.5,
                border: '1px solid',
                borderColor: nameError || colorError ? 'error.light' : 'divider',
                bgcolor: 'background.paper',
                transition: 'border-color 0.2s',
              }}
            >
              {/* Card header: index label + remove button */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 1.5,
                  minHeight: 24,
                }}
              >
                <Typography
                  variant="caption"
                  color="text.disabled"
                  fontWeight={600}
                  fontSize="11px"
                >
                  Subject {index + 1}
                </Typography>
                {rows.length > 1 && (
                  <IconButton
                    size="small"
                    color="error"
                    disabled={isSaving}
                    onClick={() => removeRow(row.tempId)}
                    sx={{ p: 0.25, ml: 1 }}
                  >
                    <CloseIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                )}
              </Box>

              {/* Subject name */}
              <TextField
                size="small"
                fullWidth
                label="Subject Name *"
                placeholder="e.g. Mathematics"
                value={row.name}
                autoFocus={index === rows.length - 1 && index > 0}
                error={Boolean(nameError)}
                helperText={nameError || ' '}
                disabled={isSaving}
                onChange={(e) => {
                  const val = e.target.value
                    .split(' ')
                    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : ''))
                    .join(' ');
                  updateRow(row.tempId, 'name', val);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addRow();
                  }
                }}
                inputProps={{ maxLength: 100 }}
                sx={{ mb: 1.5 }}
              />

              {/* Color picker */}
              <Box>
                <Typography
                  variant="caption"
                  fontWeight={600}
                  color={colorError ? 'error.main' : 'text.secondary'}
                  sx={{ display: 'block', mb: 0.75 }}
                >
                  Subject Color *
                  {colorError && (
                    <Typography
                      component="span"
                      variant="caption"
                      color="error.main"
                      sx={{ ml: 0.5 }}
                    >
                      — Required
                    </Typography>
                  )}
                </Typography>
                <ColorPickerCircle
                  onSelect={(color) => updateRow(row.tempId, 'color', color)}
                  initialColor={row.color}
                />
              </Box>
            </Box>
          );
        })}

        {/* ── Add another subject — dashed CTA ── */}
        <Box
          onClick={!isSaving ? addRow : undefined}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.75,
            py: 1.5,
            border: '1.5px dashed',
            borderColor: 'primary.light',
            borderRadius: 1.5,
            cursor: isSaving ? 'default' : 'pointer',
            color: 'primary.main',
            typography: 'body2',
            fontWeight: 500,
            opacity: isSaving ? 0.5 : 1,
            transition: 'all 0.2s',
            '&:hover': !isSaving ? { bgcolor: 'action.hover', borderColor: 'primary.main' } : {},
          }}
        >
          <AddIcon fontSize="small" />
          Add Another Subject
        </Box>
      </Box>

      {/* ── Footer ── */}
      <Divider />
      <Box
        sx={{
          px: 2.5,
          py: 1.75,
          display: 'flex',
          gap: 1.5,
          justifyContent: 'flex-end',
          flexShrink: 0,
        }}
      >
        <Button variant="outlined" size="small" onClick={resetAndClose} disabled={isSaving}>
          Cancel
        </Button>
        <LoadingButton
          loading={isSaving}
          variant="contained"
          size="small"
          onClick={handleSave}
          startIcon={<Iconify icon="mingcute:check-fill" />}
        >
          Save{rows.length > 1 ? ` (${rows.length})` : ''}
        </LoadingButton>
      </Box>
    </Drawer>
  );
};

export default SubjectAddDrawer;
