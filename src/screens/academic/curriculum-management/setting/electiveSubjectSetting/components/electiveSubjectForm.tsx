'use client';

import React from 'react';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import { ResponsiveMultiSelect } from 'src/components/responsiveMultiSelect';
import ColorPickerCircle from 'src/components/static-color/colorPickerCircle';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  Box,
  Grid,
  Button,
  Divider,
  MenuItem,
  TextField,
  Typography,
  DialogActions,
} from '@mui/material';

import { useElectiveSubjectForm } from '../hooks/useElectiveSubjectForm';

import type { IElectiveSubjectFormProps } from '../type';

const SettingElectiveSubjectForm: React.FC<IElectiveSubjectFormProps> = ({
  open,
  onClose,
  editData,
}) => {
  const { formik, subjectData, isSubjectLoading, isSaveLoading } = useElectiveSubjectForm({
    onClose,
    editData,
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2">Basic Details</Typography>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <ShakingTextField error={!!(formik.touched.name && formik.errors.name)}>
              <TextField
                fullWidth
                label="Elective Group Name *"
                name="name"
                onChange={(e) => {
                  const value = e.target.value
                    .split(' ')
                    .map((word) =>
                      word
                        .split('/')
                        .map((part) =>
                          part ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase() : ''
                        )
                        .join('/')
                    )
                    .join(' ');
                  formik.setFieldValue('name', value);
                }}
                size="small"
                value={formik.values.name}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
            </ShakingTextField>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Group Type *"
              name="groupType"
              value={formik.values.groupType}
              onChange={formik.handleChange}
              error={formik.touched.groupType && Boolean(formik.errors.groupType)}
              helperText={formik.touched.groupType && formik.errors.groupType}
            >
              {groupTypeOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <ShakingTextField error={!!(formik.touched.color && formik.errors.color) || false}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 0.5 }}>
                <Typography
                  variant="subtitle2"
                  color={
                    formik.touched.color && formik.errors.color ? 'error.main' : 'text.primary'
                  }
                >
                  Elective Group Color *
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
                onSelect={(color: string) => formik.setFieldValue('color', color)}
                initialColor={formik.values.color}
              />
            </ShakingTextField>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              multiline
              minRows={2}
              size="small"
              label="Description"
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Divider />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2">Subject Selection</Typography>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <ResponsiveMultiSelect
              label="Select Subjects *"
              options={subjectData || []}
              isLoading={isSubjectLoading}
              value={formik.values.subjectIds}
              getOptionLabel={(opt: any) => opt?.name}
              getOptionValue={(opt: any) => opt?.id}
              onChange={(selected: string[]) => {
                formik.setFieldValue('subjectIds', selected);
              }}
              error={!!(formik.touched.subjectIds && formik.errors.subjectIds)}
              helperText={
                Array.isArray(formik.errors.subjectIds)
                  ? formik.errors.subjectIds.join(', ')
                  : (formik.touched.subjectIds && formik.errors.subjectIds) || undefined
              }
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Divider />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2">Settings</Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Status"
              name="status"
              value={formik.values.status}
              onChange={formik.handleChange}
            >
              {['Active', 'Inactive', 'Archived'].map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Sort Order"
              name="sortOrder"
              value={formik.values.sortOrder}
              onChange={formik.handleChange}
              error={formik.touched.sortOrder && Boolean(formik.errors.sortOrder)}
              helperText={formik.touched.sortOrder && formik.errors.sortOrder}
              inputProps={{ min: 0 }}
            />
          </Grid>
        </Grid>
      </DialogScrollContent>

      <DialogActions>
        <Button
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          size="small"
          onClick={() => onClose(null, false)}
          variant="outlined"
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
          {editData ? 'Update Group' : 'Save Group'}
        </LoadingButton>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default SettingElectiveSubjectForm;

const groupTypeOptions = [
  'Language',
  'Skill Subject',
  'Optional Subject',
  'Vocational Subject',
  'Activity Subject',
  'Stream Elective',
  'Custom',
];
