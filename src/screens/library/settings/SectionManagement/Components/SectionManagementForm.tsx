import type { RootState } from 'src/redux/store';

import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import React, { useRef, useState, useEffect } from 'react';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { Box, Grid, Button, TextField, Typography, DialogActions } from '@mui/material';
import {
  useAddSectionManagementMutation,
  useUpdateSectionManagementMutation,
} from 'src/redux/library/settingApi';

import { getSectionInitialValues } from './SectionManagementInitialValues';
import { sectionManagementValidationSchema } from './SectionManagementValidationSchema';

import type { ISectionFormProps } from './type';

const SectionManagementForm: React.FC<ISectionFormProps> = ({ onClose, editData }) => {
  const [shelfCount, setShelfCount] = useState(editData?.numberOfColumns || 0);
  const [editingShelfIndex, setEditingShelfIndex] = useState<number | null>(null);
  const [shelfNames, setShelfNames] = useState<string[]>([]);
  const shelfInputRef = useRef<HTMLInputElement>(null);

  // Get academicYearId from Redux state
  const { currentAcademicYearId } = useSelector((state: RootState) => state.globalState);

  // Add section mutation hook
  const { addSectionManagement } = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddSectionManagementMutation,
  });

  // Update section mutation hook
  const { updateSectionManagement } = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateSectionManagementMutation,
  });

  const formik = useFormik({
    initialValues: {
      ...getSectionInitialValues(editData),
      shelfNames: editData?.shelfNames || [],
    },
    validationSchema: sectionManagementValidationSchema,
    onSubmit: async (values) => {
      // Construct payload matching API specification
      const payload = {
        sectionName: values.sectionName,
        numberOfColumns: Number(values.numberOfColumns),
      };

      if (editData) {
        // Update existing section - PUT /library/settings/sections/{sectionId}
        await updateSectionManagement({
          sectionId: editData.id,
          data: payload,
        });
        shikshaMitraToast.success({
          message: `${values.sectionName} Section updated successfully`,
        });
      } else {
        // Create new section - POST /library/settings/sections?academicYearId={academicYearId}
        await addSectionManagement({
          data: payload,
          academicYearId: currentAcademicYearId,
        });
        shikshaMitraToast.success({
          message: `${values.sectionName} Section added successfully`,
        });
      }
      onClose(null, true);
    },
  });

  // Update shelf display only when numberOfColumns changes (avoid resetting during edit)
  useEffect(() => {
    const raw = formik.values.numberOfColumns;
    const newCount = Number(raw);
    if (raw && !Number.isNaN(newCount)) {
      setShelfCount(newCount);
      setShelfNames((prev) =>
        Array.from({ length: newCount }, (_, i) =>
          prev[i] !== undefined
            ? prev[i]
            : formik.values.shelfNames[i] !== undefined
              ? formik.values.shelfNames[i]
              : `Shelf ${i + 1}`
        )
      );
    } else {
      setShelfCount(0);
      setShelfNames([]);
    }
  }, [formik.values.numberOfColumns, formik.values.shelfNames]); // removed shelfNames from deps

  // Handle shelf name editing
  const handleShelfClick = (index: number) => {
    setEditingShelfIndex(index);
    // select all text on next tick
    setTimeout(() => {
      shelfInputRef.current?.select();
    }, 0);
  };

  const handleShelfNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (editingShelfIndex === null) return;
    const { value } = event.target;
    setShelfNames((prev) => {
      const copy = [...prev];
      copy[editingShelfIndex] = value; // allow empty string
      return copy;
    });
    formik.setFieldValue('shelfNames', (prevFormik: string[]) => {
      const copy = [...(prevFormik || shelfNames)];
      copy[editingShelfIndex] = value;
      return copy;
    });
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
                    .replace(/[^a-zA-Z0-9\s]/g, '')
                    .replace(/\s+/g, ' ')
                    .replace(/^\d+/, '')
                    .trimStart();
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

        {/* Shelves List - Simple Cards */}
        {shelfCount > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Shelves ({shelfCount})
            </Typography>
            <Grid container spacing={2}>
              {Array.from({ length: shelfCount }).map((_, index) => (
                <Grid key={`shelf-${index}`} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      backgroundColor: 'transparent',
                      transition: 'border-color 0.2s',
                      minHeight: 48,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      '&:hover': { borderColor: 'text.disabled' },
                    }}
                  >
                    {editingShelfIndex === index ? (
                      <TextField
                        inputRef={shelfInputRef}
                        size="small"
                        fullWidth
                        value={
                          shelfNames[index] !== undefined ? shelfNames[index] : `Shelf ${index + 1}`
                        }
                        onChange={handleShelfNameChange}
                        onBlur={saveShelfName}
                        onKeyDown={handleShelfNameKeyDown}
                        autoFocus
                        variant="standard"
                        InputProps={{ disableUnderline: false }}
                        sx={{
                          maxWidth: 160,
                          '& .MuiInputBase-root': {
                            fontWeight: 600,
                            lineHeight: 1.2,
                            py: 0,
                          },
                          '& input': {
                            textAlign: 'center',
                            p: 0,
                          },
                        }}
                      />
                    ) : (
                      <Typography
                        fontWeight={600}
                        sx={{
                          cursor: 'pointer',
                          textAlign: 'center',
                          userSelect: 'none',
                          m: 0,
                          lineHeight: 1.2,
                          fontSize: '0.9rem',
                          width: '100%',
                        }}
                        onDoubleClick={() => handleShelfClick(index)}
                      >
                        {shelfNames[index] !== undefined ? shelfNames[index] : `Shelf ${index + 1}`}
                      </Typography>
                    )}
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
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
