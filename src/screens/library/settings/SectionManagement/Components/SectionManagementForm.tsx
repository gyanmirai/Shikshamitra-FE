import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import React, { useRef, useState, useEffect } from 'react';
import { Add, Delete, ExpandMore } from '@mui/icons-material';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  Box,
  Grid,
  Button,
  TextField,
  Accordion,
  Typography,
  IconButton,
  DialogActions,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import { getSectionInitialValues } from './SectionManagementInitialValues';
import { sectionManagementValidationSchema } from './SectionManagementValidationSchema';

import type { ISectionFormProps } from './type';

interface ShelfRow {
  id: string;
  name: string;
}

interface ShelfData {
  id: string;
  name: string;
  rows: ShelfRow[];
}

const SectionManagementForm: React.FC<ISectionFormProps> = ({ onClose, editData }) => {
  const [shelfCount, setShelfCount] = useState(editData?.numberOfColumns || 0);
  const [editingShelfIndex, setEditingShelfIndex] = useState<number | null>(null);
  const [shelfNames, setShelfNames] = useState<string[]>([]);
  const [shelvesData, setShelvesData] = useState<ShelfData[]>([]);
  const [expandedShelf, setExpandedShelf] = useState<string | false>(false);
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
      const newCount = Number(formik.values.numberOfColumns);
      setShelfCount(newCount);

      // Initialize shelves data
      const newShelvesData = Array.from({ length: newCount }, (_, index) => ({
        id: `shelf-${index}`,
        name: shelfNames[index] || `Shelf ${index + 1}`,
        rows: [],
      }));
      setShelvesData(newShelvesData);
    } else {
      setShelfCount(0);
      setShelvesData([]);
    }
  }, [formik.values.numberOfColumns, shelfNames]);

  // Handle shelf name editing
  const handleShelfClick = (index: number) => {
    setEditingShelfIndex(index);
  };

  const handleShelfNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (editingShelfIndex === null) return;

    const newShelfNames = [...shelfNames];
    newShelfNames[editingShelfIndex] = event.target.value;
    setShelfNames(newShelfNames);

    // Update shelves data
    const newShelvesData = [...shelvesData];
    if (newShelvesData[editingShelfIndex]) {
      newShelvesData[editingShelfIndex].name = event.target.value;
      setShelvesData(newShelvesData);
    }
  };

  const saveShelfName = () => {
    setEditingShelfIndex(null);
  };

  const handleShelfNameKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      saveShelfName();
    }
  };

  // Handle accordion expansion
  const handleAccordionChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpandedShelf(isExpanded ? panel : false);
    };

  // Add new row to shelf
  const addRowToShelf = (shelfIndex: number) => {
    const newShelvesData = [...shelvesData];
    const rowId = `row-${Date.now()}`;
    const newRow: ShelfRow = {
      id: rowId,
      name: `Row ${newShelvesData[shelfIndex].rows.length + 1}`,
    };

    newShelvesData[shelfIndex].rows.push(newRow);
    setShelvesData(newShelvesData);
  };

  // Remove row from shelf
  const removeRowFromShelf = (shelfIndex: number, rowIndex: number) => {
    const newShelvesData = [...shelvesData];
    newShelvesData[shelfIndex].rows.splice(rowIndex, 1);
    setShelvesData(newShelvesData);
  };

  // Update row name
  const updateRowName = (shelfIndex: number, rowIndex: number, newName: string) => {
    const newShelvesData = [...shelvesData];
    newShelvesData[shelfIndex].rows[rowIndex].name = newName;
    setShelvesData(newShelvesData);
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

        {/* Shelves Accordion */}
        <Box sx={{ mt: 2 }}>
          {shelvesData.map((shelf, shelfIndex) => (
            <Accordion
              key={shelf.id}
              expanded={expandedShelf === shelf.id}
              onChange={handleAccordionChange(shelf.id)}
              sx={{
                mb: 1,
                border: '1px solid #e0e0e0',
                borderRadius: '8px !important',
                '&:before': {
                  display: 'none',
                },
                boxShadow: 'none',
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMore />}
                sx={{
                  backgroundColor: 'background.paper',
                  borderRadius: '8px',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                {editingShelfIndex === shelfIndex ? (
                  <TextField
                    inputRef={shelfInputRef}
                    size="small"
                    value={shelf.name}
                    onChange={handleShelfNameChange}
                    onBlur={saveShelfName}
                    onKeyDown={handleShelfNameKeyDown}
                    autoFocus
                    variant="outlined"
                    onClick={(e) => e.stopPropagation()}
                    sx={{ mr: 2 }}
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
                      cursor: 'pointer',
                    }}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      handleShelfClick(shelfIndex);
                    }}
                  >
                    {shelf.name}
                  </Typography>
                )}
              </AccordionSummary>

              <AccordionDetails>
                <Box>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 2,
                    }}
                  >
                    <Typography variant="subtitle2" color="text.secondary">
                      Rows ({shelf.rows.length})
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<Add />}
                      onClick={() => addRowToShelf(shelfIndex)}
                      variant="outlined"
                    >
                      Add Row
                    </Button>
                  </Box>

                  {/* Rows List */}
                  {shelf.rows.map((row, rowIndex) => (
                    <Box
                      key={row.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 1,
                        p: 1,
                        border: '1px solid #f0f0f0',
                        borderRadius: 1,
                        backgroundColor: '#fafafa',
                      }}
                    >
                      <TextField
                        size="small"
                        value={row.name}
                        onChange={(e) => updateRowName(shelfIndex, rowIndex, e.target.value)}
                        variant="outlined"
                        sx={{ flexGrow: 1 }}
                      />
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => removeRowFromShelf(shelfIndex, rowIndex)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}

                  {shelf.rows.length === 0 && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ textAlign: 'center', py: 2 }}
                    >
                      No rows added yet. Click &quot;Add Row&quot; to create rows.
                    </Typography>
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
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
