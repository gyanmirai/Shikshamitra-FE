import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import React, { useRef, useState, useEffect } from 'react';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { Box, Grid, Button, TextField, Typography, DialogActions } from '@mui/material';

import { getSectionInitialValues } from './SectionManagementInitialValues';
import { sectionManagementValidationSchema } from './SectionManagementValidationSchema';

import type { ISectionFormProps } from './type';

const SectionManagementForm: React.FC<ISectionFormProps> = ({ onClose, editData }) => {
  const [shelfCount, setShelfCount] = useState(editData?.numberOfColumns || 0);
  const [editingShelfIndex, setEditingShelfIndex] = useState<number | null>(null);
  const [shelfNames, setShelfNames] = useState<string[]>([]);
  const shelfInputRef = useRef<HTMLInputElement>(null);

  const formik = useFormik({
    initialValues: getSectionInitialValues(editData),
    validationSchema: sectionManagementValidationSchema,
    onSubmit: (values) => {
      if (editData) {
        shikshaMitraToast.success({
          message: `${values.sectionName} Section updated successfully`,
        });
      } else {
        shikshaMitraToast.success({
          message: `${values.sectionName} Section added successfully`,
        });
      }
      onClose(null, true);
    },
  });

  // Update shelf display when number of columns changes
  useEffect(() => {
    if (formik.values.numberOfColumns && !Number.isNaN(Number(formik.values.numberOfColumns))) {
      setShelfCount(Number(formik.values.numberOfColumns));
    } else {
      setShelfCount(0);
    }
  }, [formik.values.numberOfColumns]);

  // Set focus on the input field when editing mode is activated
  useEffect(() => {
    if (editingShelfIndex !== null && shelfInputRef.current) {
      shelfInputRef.current.focus();
    }
  }, [editingShelfIndex]);

  // Handle shelf name editing
  const handleShelfClick = (index: number) => {
    setEditingShelfIndex(index);
  };

  const handleShelfNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (editingShelfIndex === null) return;

    const newShelfNames = [...shelfNames];
    newShelfNames[editingShelfIndex] = event.target.value;
    setShelfNames(newShelfNames);
  };

  const saveShelfName = () => {
    setEditingShelfIndex(null);
  };

  const handleShelfNameKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      saveShelfName();
    }
  };

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={2}>
          {/* Section Name */}
          <Grid size={{ xs: 6 }}>
            <ShakingTextField
              error={!!(formik.touched.sectionName && formik.errors.sectionName) || false}
            >
              <TextField
                fullWidth
                label="Section Name *"
                name="sectionName"
                size="small"
                value={formik.values.sectionName}
                onChange={(e) => {
                  let value = e.target.value
                    .replace(/[^a-zA-Z0-9\s]/g, '') // Allow letters, numbers, spaces
                    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
                    .replace(/^\d+/, '') // Remove leading numbers
                    .trimStart(); // Remove leading spaces
                  value = value
                    .split(' ')
                    .map((word) =>
                      word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ''
                    )
                    .join(' ');

                  formik.setFieldValue('sectionName', value);
                }}
                error={formik.touched.sectionName && Boolean(formik.errors.sectionName)}
                helperText={formik.touched.sectionName && formik.errors.sectionName}
              />
            </ShakingTextField>
          </Grid>

          {/* Number of Shelves/Columns */}
          <Grid size={{ xs: 6 }}>
            <ShakingTextField
              error={!!(formik.touched.numberOfColumns && formik.errors.numberOfColumns) || false}
            >
              <TextField
                fullWidth
                type="number"
                label="Numbers of Shelf *"
                name="numberOfColumns"
                size="small"
                value={formik.values.numberOfColumns}
                onChange={(e) => {
                  const { value } = e.target;
                  if (/^\d*$/.test(value) && Number(value) <= 50) {
                    formik.setFieldValue('numberOfColumns', value);
                  }
                }}
                error={formik.touched.numberOfColumns && Boolean(formik.errors.numberOfColumns)}
                helperText={formik.touched.numberOfColumns && formik.errors.numberOfColumns}
                InputProps={{ inputProps: { min: 0, max: 50 } }}
              />
            </ShakingTextField>
          </Grid>
        </Grid>

        {/* Visual representation of shelves */}
        {Array.from({ length: Math.min(shelfCount, 50) }).map((_, index) => (
          <Box
            key={index}
            sx={{
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              p: 1.5,
              my: 1.5,
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
            onDoubleClick={() => handleShelfClick(index)}
          >
            {editingShelfIndex === index ? (
              <TextField
                inputRef={shelfInputRef}
                size="small"
                value={shelfNames[index] || `Shelf ${index + 1}`}
                onChange={handleShelfNameChange}
                onBlur={saveShelfName}
                onKeyDown={handleShelfNameKeyDown}
                autoFocus
                fullWidth
                variant="outlined"
                InputProps={{
                  sx: {
                    color: 'primary.main',
                    fontWeight: 600,
                  },
                }}
              />
            ) : (
              <Typography
                color="primary"
                fontWeight="600"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {shelfNames[index] || `Shelf ${index + 1}`}
              </Typography>
            )}
          </Box>
        ))}
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
          {editData ? 'Update' : 'Save'}
        </Button>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default SectionManagementForm;
