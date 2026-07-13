'use client';

import React from 'react';
import { LoadingButton } from '@mui/lab';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import { Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';
import ColorPickerCircle from 'src/components/static-color/colorPickerCircle';
import {
  Box,
  Chip,
  Drawer,
  Button,
  Divider,
  MenuItem,
  TextField,
  IconButton,
  Typography,
} from '@mui/material';

import { useSubjectAddDrawer } from './hooks/useSubjectAddDrawer';

interface SubjectAddDrawerProps {
  open: boolean;
  onClose: () => void;
}

const SubjectAddDrawer: React.FC<SubjectAddDrawerProps> = ({ open, onClose }) => {
  const {
    rows,
    isSaving,
    showErrors,
    addRow,
    updateRow,
    removeRow,
    getDuplicateError,
    resetAndClose,
    handleSave,
  } = useSubjectAddDrawer({ onClose });

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={resetAndClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 440 }, display: 'flex', flexDirection: 'column' },
      }}
    >
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
          const nameError = nameEmpty ? 'Subject name is required' : dupError;
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
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'space-between',
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
                    sx={{ p: 0.25, ml: 'auto' }}
                  >
                    <CloseIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                )}
              </Box>

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

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 1.25,
                  mb: 1.5,
                }}
              >
                <TextField
                  size="small"
                  fullWidth
                  label="Display Name"
                  value={row.displayName}
                  disabled={isSaving}
                  onChange={(e) => updateRow(row.tempId, 'displayName', e.target.value)}
                  inputProps={{ maxLength: 50 }}
                />
                <TextField
                  select
                  size="small"
                  fullWidth
                  label="Category"
                  value={row.category}
                  disabled={isSaving}
                  onChange={(e) => updateRow(row.tempId, 'category', e.target.value)}
                >
                  {subjectCategories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' },
                  gap: 1.25,
                  mb: 1.5,
                }}
              >
                <TextField
                  select
                  size="small"
                  fullWidth
                  label="Icon"
                  value={row.icon}
                  disabled={isSaving}
                  onChange={(e) => updateRow(row.tempId, 'icon', e.target.value)}
                >
                  <MenuItem value="">None</MenuItem>
                  {subjectIcons.map((icon) => (
                    <MenuItem key={icon.value} value={icon.value}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Iconify icon={icon.icon} width={16} height={16} />
                        {icon.label}
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  size="small"
                  fullWidth
                  label="Status"
                  value={row.status}
                  disabled={isSaving}
                  onChange={(e) => updateRow(row.tempId, 'status', e.target.value)}
                >
                  {['Active', 'Inactive', 'Archived'].map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  size="small"
                  fullWidth
                  type="number"
                  label="Sort Order"
                  value={row.sortOrder}
                  disabled={isSaving}
                  inputProps={{ min: 0 }}
                  onChange={(e) => updateRow(row.tempId, 'sortOrder', e.target.value)}
                />
              </Box>

              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Class-wise codes, teachers, exam rules, and elective grouping are configured later.
              </Typography>

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

const subjectCategories = [
  'General',
  'Language',
  'Scholastic',
  'Co-Scholastic',
  'Activity',
  'Practical',
];

const subjectIcons = [
  { value: 'book', label: 'Book', icon: 'lucide:book-open' },
  { value: 'calculator', label: 'Calculator', icon: 'lucide:calculator' },
  { value: 'flask', label: 'Flask', icon: 'lucide:flask-conical' },
  { value: 'monitor', label: 'Monitor', icon: 'lucide:monitor' },
  { value: 'music', label: 'Music', icon: 'lucide:music' },
  { value: 'trophy', label: 'Trophy', icon: 'lucide:trophy' },
  { value: 'palette', label: 'Palette', icon: 'lucide:palette' },
];
