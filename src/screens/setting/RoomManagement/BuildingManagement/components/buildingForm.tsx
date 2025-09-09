import React from 'react';
import { isNaN } from 'lodash';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Editor } from 'src/components/editor';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Grid, Button, TextField, DialogActions } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { getBuildingInitialValues } from './initialValues';
import { buildingValidationSchema } from './validationSchema';

import type { IBuildingFormProps } from '../types';

const BuildingForm = ({ open, onClose, editData }: IBuildingFormProps) => {
  const formik = useFormik({
    initialValues: getBuildingInitialValues(editData),
    validationSchema: buildingValidationSchema,
    onSubmit(values) {},
  });

  const handleTotalFloors = (e: any) => {
    const inputValue = e.target.value;
    const floorsCount = parseInt(inputValue, 10);
    formik.setFieldValue('totalFloors', inputValue);
    formik.setFieldTouched('totalFloors', false);

    // Check if floorsCount is a valid number
    if (!isNaN(floorsCount) && floorsCount > 0) {
      const currentFloors = formik.values.floors || [];
      const newFloors = Array.from(
        { length: floorsCount },
        (_, index) =>
          currentFloors[index] || {
            id: index,
            floorName: '',
            totalRoom: '',
          }
      );
      formik.setFieldValue('floors', newFloors);
    } else {
      // Clear floors if invalid input or 0
      formik.setFieldValue('floors', []);
    }
  };

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <Box display="flex" flexDirection="column" gap={2} height="100%">
          <Scrollbar sx={{ p: 2, height: '100%' }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField
                  error={!!(formik.touched.buildingName && formik.errors.buildingName)}
                >
                  <TextField
                    fullWidth
                    label="Building Name *"
                    name="buildingName"
                    value={formik.values.buildingName}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^a-zA-Z0-9\s]/g, '');
                      formik.setFieldValue('buildingName', value);
                    }}
                    size="small"
                    error={!!(formik.touched.buildingName && formik.errors.buildingName)}
                    helperText={formik.touched.buildingName && formik.errors.buildingName}
                  />
                </ShakingTextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField
                  error={!!(formik.touched.totalFloors && formik.errors.totalFloors)}
                >
                  <TextField
                    fullWidth
                    type="number"
                    label="Total Floors *"
                    name="totalFloors"
                    value={formik.values.totalFloors}
                    onChange={handleTotalFloors}
                    onKeyDown={(e) => {
                      if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault();
                    }}
                    inputProps={{ min: 0 }}
                    size="small"
                    error={!!(formik.touched.totalFloors && formik.errors.totalFloors)}
                    helperText={formik.touched.totalFloors && formik.errors.totalFloors}
                  />
                </ShakingTextField>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Editor
                  value={formik.values.description}
                  onChange={(value) => formik.setFieldValue('description', value)}
                  placeholder="Description"
                  error={!!(formik.touched.description && formik.errors.description)}
                  helperText={formik.touched.description && formik.errors.description}
                />
              </Grid>

              {formik.values.floors.length > 0 && (
                <Grid size={{ xs: 12 }}>
                  <Box
                    display="flex"
                    flexDirection="column"
                    gap={2}
                    maxHeight="500px"
                    height="100%"
                  >
                    <CustomizableTable
                      tableId="table-floors-list"
                      isSearch={false}
                      isShowedDense={false}
                      noDataText={<>No Floor&apos;s Found</>}
                      isFilter={false}
                      columns={[
                        {
                          id: 'id',
                          label: 'Sr No.',
                          render: (_value, row) => row.id + 1, // 1-based serial number
                        },
                        {
                          id: 'floorName',
                          label: 'Floor Name',
                          isFilter: false,
                          render: (_value, row) => (
                            <ShakingTextField
                              error={
                                !!(
                                  formik.touched.floors?.[row.id]?.floorName &&
                                  (formik.errors.floors?.[row.id] as any)?.floorName
                                )
                              }
                            >
                              <TextField
                                fullWidth
                                label="Floor Name *"
                                name={`floors.${row.id}.floorName`}
                                value={formik.values.floors[row.id]?.floorName || ''}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/[^a-zA-Z0-9\s]/g, '');
                                  formik.setFieldValue(`floors.${row.id}.floorName`, val);
                                }}
                                size="small"
                                error={
                                  !!(
                                    formik.touched.floors?.[row.id]?.floorName &&
                                    (formik.errors.floors?.[row.id] as any)?.floorName
                                  )
                                }
                                helperText={
                                  formik.touched.floors?.[row.id]?.floorName &&
                                  (formik.errors.floors?.[row.id] as any)?.floorName
                                }
                                sx={{ minWidth: '100px', width: '100%', mb: 1.5 }}
                              />
                            </ShakingTextField>
                          ),
                        },
                        {
                          id: 'totalRoom',
                          label: 'Total Room',
                          isSort: false,
                          isFilter: false,
                          render: (_value, row) => (
                            <ShakingTextField
                              error={
                                !!(
                                  formik.touched.floors?.[row.id]?.totalRoom &&
                                  (formik.errors.floors?.[row.id] as any)?.totalRoom
                                )
                              }
                            >
                              <TextField
                                fullWidth
                                label="Total Room *"
                                name={`floors.${row.id}.totalRoom`}
                                value={formik.values.floors[row.id]?.totalRoom || ''}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/[^0-9]/g, '');
                                  formik.setFieldValue(`floors.${row.id}.totalRoom`, val);
                                }}
                                size="small"
                                error={
                                  !!(
                                    formik.touched.floors?.[row.id]?.totalRoom &&
                                    (formik.errors.floors?.[row.id] as any)?.totalRoom
                                  )
                                }
                                helperText={
                                  formik.touched.floors?.[row.id]?.totalRoom &&
                                  (formik.errors.floors?.[row.id] as any)?.totalRoom
                                }
                                sx={{ minWidth: '100px', width: '100%', mb: 1.5 }}
                              />
                            </ShakingTextField>
                          ),
                        },
                      ]}
                      data={formik.values.floors}
                    />
                  </Box>
                </Grid>
              )}
            </Grid>
          </Scrollbar>

          <DialogActions>
            <Button
              onClick={() => {
                onClose?.(null, false);
              }}
              size="small"
              variant="outlined"
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
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
              form="dialog-form"
              onClick={() => formik.handleSubmit()}
              size="small"
              variant="contained"
            >
              {editData ? 'Update' : 'Submit'}
            </Button>
          </DialogActions>
        </Box>
      </form>
    </BackPopUpChecked>
  );
};

export default BuildingForm;
