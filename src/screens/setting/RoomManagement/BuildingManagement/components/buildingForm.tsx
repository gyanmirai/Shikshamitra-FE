import React from 'react';
import { isNaN } from 'lodash';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Editor } from 'src/components/editor';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, Grid, Button, TextField, Typography } from '@mui/material';
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
  const confirmDialog = useBoolean();
  const [floorToDelete, setFloorToDelete] = React.useState<number | null>(null);
  const formik = useFormik({
    initialValues: getBuildingInitialValues(editData),
    validationSchema: buildingValidationSchema,
    onSubmit(values) {
      console.log('Form submitted with values:', values);

      // Simple validation check
      if (!values.buildingName) {
        shikshaMitraToast.error({ message: 'Please enter building name' });
        return;
      }

      if (values.floors.length === 0) {
        shikshaMitraToast.error({ message: 'Please add at least one floor' });
        return;
      }


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

      // Show success message
      shikshaMitraToast.success({
        message: `"${values.buildingName}" Building added successfully`,
      });

      // Close the form
      onClose(null, true);
    },
  });



  const handleDeleteFloor = (idx: number) => {
    const updatedFloors = formik.values.floors
      .filter((_, i) => i !== idx)
      .map((floor, index) => ({
        ...floor,
        id: index + 1,
      }));
    formik.setFieldValue('floors', updatedFloors);
    formik.setFieldValue('totalFloors', updatedFloors.length.toString());
    confirmDialog.onFalse();
    setFloorToDelete(null);
  };

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <Box display="flex" flexDirection="column" gap={2} height="100%">
          <Scrollbar sx={{ p: 3, height: '100%' }}>
            {/* Header Section */}
            <Grid container spacing={3}>
              {/* Building Information Card */}
              <Grid size={{ xs: 12 }}>
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                  }}
                >
                  <Typography variant="h6" fontWeight="600" gutterBottom sx={{ mb: 2.5 }}>
                    Building Information
                  </Typography>
                  <Grid container spacing={2.5}>
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

                    <Grid size={{ xs: 12 }}>
                      <Editor
                        value={formik.values.description}
                        onChange={(value) => formik.setFieldValue('description', value)}
                        placeholder="Add building description..."
                        error={!!(formik.touched.description && formik.errors.description)}
                        helperText={formik.touched.description && formik.errors.description}
                      />
                    </Grid>
                  </Grid>
                </Box>
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
              {/* Floors Management Card */}
              <Grid size={{ xs: 12 }}>
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                  }}
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 2.5 }}
                  >
                    <Typography variant="h6" fontWeight="600">
                      Floor Management
                    </Typography>
                    <Button
                      size="medium"
                      variant="contained"
                      onClick={() => {
                        const newFloor = {
                          id: formik.values.floors.length + 1,
                          floorName: '',
                          totalRoom: '',
                        };
                        const updatedFloors = [...formik.values.floors, newFloor].map(
                          (floor, index) => ({
                            ...floor,
                            id: index + 1,
                          })
                        );
                        formik.setFieldValue('floors', updatedFloors);
                        formik.setFieldValue('totalFloors', updatedFloors.length.toString());
                      }}
                      startIcon={<Iconify icon={GlobalIcons.addIcon} />}
                      sx={{
                        px: 3,
                        borderRadius: 1.5,
                        textTransform: 'none',
                        fontWeight: 600,
                      }}
                    >
                      Floor
                    </Button>
                  </Box>

                  {formik.values.floors.length > 0 ? (
                    <Box
                      display="flex"
                      flexDirection="column"
                      gap={2}
                      maxHeight="500px"
                      height="auto"
                      key={formik.values.floors.length}
                    >
                      <CustomizableTable
                        key={`table-floors-${formik.values.floors.length}`}
                        tableId="table-floors-list"
                        isSearch={false}
                        isShowedDense={false}
                        noDataText={<>No Floor&apos;s Found</>}
                        isFilter={false}
                        columns={[
                          {
                            id: 'id',
                            label: 'Sr No.',
                            isSort: false,
                            isFilter: false,
                            render: (_value, row) => {
                              const idx = formik.values.floors.indexOf(row as any);
                              return idx + 1;
                            },
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
                          {
                            id: 'actions',
                            label: 'Action',
                            isSort: false,
                            isFilter: false,
                            render: (_value, row) => {
                              const idx = formik.values.floors.indexOf(row as any);
                              const hasData = row.floorName || row.totalRoom;
                              return (
                                <Button
                                  size="small"
                                  color="error"
                                  sx={{ minWidth: 'auto', p: 0.5 }}
                                  onClick={() => {
                                    if (hasData) {
                                      setFloorToDelete(idx);
                                      confirmDialog.onTrue();
                                    } else {
                                      handleDeleteFloor(idx);
                                    }
                                  }}
                                >
                                  <Iconify icon={GlobalIcons.delete} width={20} />
                                </Button>
                              );
                            },
                          },
                        ]}
                        data={formik.values.floors}
                      />
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        py: 6,
                        textAlign: 'center',
                        borderRadius: 2,
                        border: '2px dashed',
                        borderColor: 'divider',
                        bgcolor: 'action.hover',
                      }}
                    >
                      <Iconify
                        icon="mdi:floor-plan"
                        width={64}
                        color="text.disabled"
                        sx={{ mb: 2 }}
                      />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No Floors Added Yet
                      </Typography>
                      <Typography variant="body2" color="text.disabled">
                        Click the &quot;Add Floor&quot; button to start adding floors to this
                        building
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Scrollbar>

          <Box
            sx={{
              p: 2.5,
              borderTop: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.neutral',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 2,
            }}
          >
            <Button
              onClick={() => {
                onClose?.(null, false);
              }}
              size="medium"
              variant="outlined"
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
              sx={{
                px: 3,
                borderRadius: 1.5,
                textTransform: 'none',
                fontWeight: 600,
              }}
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
              sx={{
                px: 4,
                borderRadius: 1.5,
                textTransform: 'none',
                fontWeight: 600,
                minWidth: '120px',
              }}
            >
              {editData ? 'Update' : 'Submit'}
            </LoadingButton>
          </Box>
        </Box>
      </form>

      <ConfirmDialog
        open={confirmDialog.value}
        onClose={confirmDialog.onFalse}
        title="Delete Floor"
        content="Are you sure you want to delete this floor?"
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              if (floorToDelete !== null) {
                handleDeleteFloor(floorToDelete);
              }
            }}
          >
            Delete
          </Button>
        }
      />
    </BackPopUpChecked>
  );
};

export default BuildingForm;
