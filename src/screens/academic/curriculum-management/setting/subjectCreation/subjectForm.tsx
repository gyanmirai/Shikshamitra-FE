'use client';

import React from 'react';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import ColorPickerCircle from 'src/components/static-color/colorPickerCircle';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  Box,
  Grid,
  Alert,
  Button,
  MenuItem,
  TextField,
  Typography,
  DialogActions,
} from '@mui/material';

import { useSubjectForm } from './hooks/useSubjectForm';

import type { ISubjectFormProps } from './type';

const SettingSubjectForm: React.FC<ISubjectFormProps> = ({ open, onClose, editData }) => {
  const { formik, isSaveLoading } = useSubjectForm({
    onClose,
    editData,
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={1}>
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" fontWeight={700}>
              Basic Details
            </Typography>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <ShakingTextField
              error={!!(formik.touched.subjectName && formik.errors.subjectName) || false}
            >
              <TextField
                fullWidth
                label="Subject Name *"
                name="subjectName"
                size="small"
                value={formik.values.subjectName}
                onChange={(e) => {
                  const value = e.target.value
                    .split(' ')
                    .map((word) =>
                      word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ''
                    )
                    .join(' ');
                  formik.setFieldValue('subjectName', value);
                }}
                error={formik.touched.subjectName && Boolean(formik.errors.subjectName)}
                helperText={formik.touched.subjectName && formik.errors.subjectName}
              />
            </ShakingTextField>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Display Name"
              name="displayName"
              size="small"
              value={formik.values.displayName}
              onChange={formik.handleChange}
              error={formik.touched.displayName && Boolean(formik.errors.displayName)}
              helperText={formik.touched.displayName && formik.errors.displayName}
              inputProps={{ maxLength: 50 }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              fullWidth
              label={
                <Box
                  component="span"
                  sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
                >
                  Subject Category *
                  <CustomTooltip
                    arrow
                    placement="right"
                    sx={{ textAlign: 'justify' }}
                    title="Grouping only. Academic rules are configured later."
                  >
                    <Box component="span" sx={{ display: 'inline-flex' }}>
                      <Iconify icon="lucide:info" width={14} height={14} color="info.main" />
                    </Box>
                  </CustomTooltip>
                </Box>
              }
              name="category"
              size="small"
              value={formik.values.category}
              onChange={formik.handleChange}
              error={formik.touched.category && Boolean(formik.errors.category)}
              helperText={formik.touched.category && formik.errors.category}
            >
              {subjectCategories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              fullWidth
              label="Subject Icon"
              name="icon"
              size="small"
              value={formik.values.icon}
              onChange={formik.handleChange}
              helperText="Optional"
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
          </Grid>

          <Grid size={{ xs: 12 }}>
            <ShakingTextField
              error={!!(formik.touched.subjectColor && formik.errors.subjectColor) || false}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 0.5 }}>
                <Typography
                  variant="subtitle2"
                  color={
                    formik.touched.subjectColor && formik.errors.subjectColor
                      ? 'error.main'
                      : 'text.primary'
                  }
                >
                  Subject Color *
                </Typography>
                <CustomTooltip
                  arrow
                  placement="right"
                  sx={{ textAlign: 'justify' }}
                  title="This subject color is used throughout the system to visually identify this subject."
                >
                  <Box component="span" sx={{ display: 'inline-flex' }}>
                    <Iconify
                      icon="lucide:info"
                      sx={{ cursor: 'pointer' }}
                      color="info.main"
                      width={18}
                      height={18}
                    />
                  </Box>
                </CustomTooltip>
              </Box>
              <ColorPickerCircle
                onSelect={(color: string) => formik.setFieldValue('subjectColor', color)}
                initialColor={formik.values.subjectColor}
              />
            </ShakingTextField>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              multiline
              minRows={2}
              label="Description"
              name="description"
              size="small"
              value={formik.values.description}
              onChange={formik.handleChange}
              error={formik.touched.description && Boolean(formik.errors.description)}
              helperText={formik.touched.description && formik.errors.description}
              inputProps={{ maxLength: 500 }}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" fontWeight={700}>
              Settings
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              fullWidth
              label="Status *"
              name="status"
              size="small"
              value={formik.values.status}
              onChange={formik.handleChange}
              error={formik.touched.status && Boolean(formik.errors.status)}
              helperText={formik.touched.status && formik.errors.status}
            >
              {['Active', 'Inactive', 'Archived'].map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              type="number"
              label="Sort Order"
              name="sortOrder"
              size="small"
              value={formik.values.sortOrder}
              onChange={formik.handleChange}
              error={formik.touched.sortOrder && Boolean(formik.errors.sortOrder)}
              helperText={formik.touched.sortOrder && formik.errors.sortOrder}
              inputProps={{ min: 1, max: 999999 }}
            />
          </Grid>

          {editData?.isUsed && (
            <Grid size={{ xs: 12 }}>
              <Alert severity="warning">
                This subject is already used in academic modules. Major changes may affect existing
                records.
              </Alert>
            </Grid>
          )}
        </Grid>
      </DialogScrollContent>

      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={() => onClose(null, false)}
          variant="outlined"
          size="small"
        >
          Cancel
        </Button>
        <LoadingButton
          size="small"
          variant="contained"
          loading={isSaveLoading}
          startIcon={
            <Iconify
              icon={editData ? GlobalIcons.edit : GlobalIcons.submit}
              width={editData ? 16 : 20}
              height={editData ? 16 : 20}
            />
          }
          onClick={(e: any) => formik.handleSubmit(e)}
          type="submit"
        >
          {editData ? 'Update' : 'Submit'}
        </LoadingButton>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default SettingSubjectForm;

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
