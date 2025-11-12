'use client';

import { useFormik } from 'formik';
import React, { useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { Box, Chip, Grid, Button, TextField, DialogActions } from '@mui/material';

import { getIncomeCategoryInitialValues } from './IncomeCategoryInitialValues';
import { incomeCategoryValidationSchema } from './IncomeCategoryValidationSchema';

import type { IIncomeCategoryFormProps } from './type';

const IncomeCategoryForm: React.FC<IIncomeCategoryFormProps> = ({ open, onClose, editData }) => {
  const [tag, setTag] = useState('');

  const formik = useFormik({
    initialValues: getIncomeCategoryInitialValues(editData),
    validationSchema: incomeCategoryValidationSchema,
    onSubmit: (values) => {
      if (editData) {
        shikshaMitraToast.success({
          message: `${values.incomeCategoryName} Income Category updated successfully`,
        });
      } else {
        shikshaMitraToast.success({
          message: `${values.incomeCategoryName} Income Category added successfully`,
        });
      }
      onClose(null, true);
    },
  });

  const handleKeyDown = (e: any) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = tag.trim();
      if (trimmed && !formik.values.tags.includes(trimmed)) {
        formik.setFieldValue('tags', [...formik.values.tags, trimmed]);
        setTag('');
      }
    }
  };

  const handleDelete = (deleteTag: any) => {
    formik.setFieldValue(
      'tags',
      formik.values.tags.filter((t: string) => t !== deleteTag)
    );
  };
  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={2}>
          {/* Income Category Name */}
          <Grid size={12}>
            <ShakingTextField
              error={
                !!(formik.touched.incomeCategoryName && formik.errors.incomeCategoryName) || false
              }
            >
              <TextField
                fullWidth
                label="Income Category Name *"
                name="incomeCategoryName"
                size="small"
                value={formik.values.incomeCategoryName}
                onChange={(e) => {
                  const value = e.target.value
                    .replace(/[^a-zA-Z\s]/g, '')
                    .split(' ')
                    .map((word) =>
                      word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ''
                    )
                    .join(' ');
                  formik.setFieldValue('incomeCategoryName', value);
                }}
                error={
                  formik.touched.incomeCategoryName && Boolean(formik.errors.incomeCategoryName)
                }
                helperText={formik.touched.incomeCategoryName && formik.errors.incomeCategoryName}
              />
            </ShakingTextField>
          </Grid>

          {/* Description */}
          <Grid size={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              name="description"
              size="small"
              value={formik.values.description}
              onChange={formik.handleChange}
            />
          </Grid>

          <Grid size={12}>
            <ShakingTextField error={!!(formik.touched.tags && formik.errors.tags) || false}>
              <TextField
                fullWidth
                size="small"
                label="Tags"
                placeholder="Type a tag and press Enter"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                onKeyDown={handleKeyDown}
                InputProps={{
                  startAdornment: (
                    <Box
                      sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 0.5,
                        alignItems: 'center',
                        maxWidth: '100%',
                      }}
                    >
                      {formik.values.tags.map((t: string, index: number) => (
                        <Chip key={index} label={t} onDelete={() => handleDelete(t)} size="small" />
                      ))}
                    </Box>
                  ),
                }}
                error={formik.touched.tags && Boolean(formik.errors.tags)}
                helperText={
                  formik.touched.tags && typeof formik.errors.tags === 'string'
                    ? formik.errors.tags
                    : undefined
                }
                sx={{
                  '& .MuiInputBase-root': {
                    flexWrap: 'wrap',
                    alignItems: 'flex-start',
                    minHeight: 'auto',
                    pt: '10px',
                  },
                  '& .MuiInputBase-input': {
                    flexGrow: 1,
                    minWidth: '80px',
                    mb: '4px',
                  },
                }}
              />
            </ShakingTextField>
          </Grid>
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
        <Button
          startIcon={
            <Iconify
              icon={editData ? GlobalIcons.edit : GlobalIcons.submit}
              width={editData ? 16 : 20}
              height={editData ? 16 : 20}
            />
          }
          type="submit"
          variant="contained"
          size="small"
          onClick={(e: any) => formik.handleSubmit(e)}
        >
          {editData ? 'Update' : 'Submit'}
        </Button>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default IncomeCategoryForm;
