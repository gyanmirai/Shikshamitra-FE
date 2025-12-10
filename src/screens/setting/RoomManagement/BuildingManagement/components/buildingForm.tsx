import React from 'react';
import { isNaN } from 'lodash';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Editor } from 'src/components/editor';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, Grid, Button, TextField, DialogActions } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  useAddBuildingMutation,
  useUpdateBuildingMutation,
} from 'src/redux/InstituteSetup/BuildingApi/BuildingApi';

import { getBuildingInitialValues } from './initialValues';
import { buildingValidationSchema } from './validationSchema';

import type { IBuildingFormProps } from '../types';

const BuildingForm = ({ open, onClose, editData }: IBuildingFormProps) => {
  const [addBuilding, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddBuildingMutation,
  });
  const [updateBuilding, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateBuildingMutation,
  });
  const formik = useFormik({
    initialValues: getBuildingInitialValues(editData),
    validationSchema: buildingValidationSchema,
    onSubmit(values) {
      console.log('values----', values);
      if (editData) {
        updateBuilding({
          id: editData.id,
          body: {
            buildingName: values.buildingName,
            totalFloors: values.totalFloors,
            description: values.description,
            floors: values.floors,
          },
        });
        shikshaMitraToast.success({
          message: `"${values.buildingName}" Building updated successfully`,
        });
        onClose(null, true);
        return;
      }
      addBuilding({
        buildingName: values.buildingName,
        totalFloors: values.totalFloors,
        description: values.description,
        floors: values.floors,
      });
      shikshaMitraToast.success({
        message: `"${values.buildingName}" Building added successfully`,
      });
      onClose(null, true);
    },
  });
  console.log('formik---', formik.values);
  console.log('formik---', formik.errors);

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
            floorNo: index + 1,
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
                          id: 'floorNo',
                          label: 'Floor No.',
                          render: (_value, row) => row.floorNo,
                          isSort: false,
                          isFilter: false,
                        },
                        {
                          id: 'floorName',
                          label: 'Floor Name',
                          isSort: false,
                          isFilter: false,
                          render: (_value, row) => {
                            const idx = formik.values.floors.indexOf(row as any);

                            return (
                              <ShakingTextField
                                error={
                                  !!(
                                    formik.touched.floors?.[idx]?.floorName &&
                                    (formik.errors.floors?.[idx] as any)?.floorName
                                  )
                                }
                              >
                                <TextField
                                  fullWidth
                                  label="Floor Name *"
                                  name={`floors.${idx}.floorName`}
                                  value={formik.values.floors[idx]?.floorName || ''}
                                  onChange={(e) => {
                                    const val = e.target.value.replace(/[^a-zA-Z0-9\s]/g, '');
                                    formik.setFieldValue(`floors.${idx}.floorName`, val);
                                  }}
                                  size="small"
                                  error={
                                    !!(
                                      formik.touched.floors?.[idx]?.floorName &&
                                      (formik.errors.floors?.[idx] as any)?.floorName
                                    )
                                  }
                                  helperText={
                                    formik.touched.floors?.[idx]?.floorName &&
                                    (formik.errors.floors?.[idx] as any)?.floorName
                                  }
                                  sx={{ minWidth: '100px', width: '100%', mb: 1.5 }}
                                />
                              </ShakingTextField>
                            );
                          },
                        },
                        {
                          id: 'totalRoom',
                          label: 'Total Room',
                          isSort: false,
                          isFilter: false,
                          render: (_value, row) => {
                            const idx = formik.values.floors.indexOf(row as any);

                            return (
                              <ShakingTextField
                                error={
                                  !!(
                                    formik.touched.floors?.[idx]?.totalRoom &&
                                    (formik.errors.floors?.[idx] as any)?.totalRoom
                                  )
                                }
                              >
                                <TextField
                                  fullWidth
                                  label="Total Room *"
                                  name={`floors.${idx}.totalRoom`}
                                  value={formik.values.floors[idx]?.totalRoom || ''}
                                  onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9]/g, '');
                                    formik.setFieldValue(`floors.${idx}.totalRoom`, val);
                                  }}
                                  size="small"
                                  error={
                                    !!(
                                      formik.touched.floors?.[idx]?.totalRoom &&
                                      (formik.errors.floors?.[idx] as any)?.totalRoom
                                    )
                                  }
                                  helperText={
                                    formik.touched.floors?.[idx]?.totalRoom &&
                                    (formik.errors.floors?.[idx] as any)?.totalRoom
                                  }
                                  sx={{ minWidth: '100px', width: '100%', mb: 1.5 }}
                                />
                              </ShakingTextField>
                            );
                          },
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
            <LoadingButton
              size="small"
              type="submit"
              variant="contained"
              loading={isUpdateLoading || isLoading}
              startIcon={
                <Iconify
                  icon={editData ? GlobalIcons.edit : GlobalIcons.submit}
                  width={editData ? 16 : 20}
                  height={editData ? 16 : 20}
                />
              }
            >
              {editData ? 'Update' : 'Submit'}
            </LoadingButton>
          </DialogActions>
        </Box>
      </form>
    </BackPopUpChecked>
  );
};

export default BuildingForm;
