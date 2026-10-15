'use client';

import type { UseBooleanReturn } from 'src/hooks/use-boolean';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import React, { useState, useEffect } from 'react';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { useGetRoomTypesQuery } from 'src/redux/InstituteSetup/RoomTypeApi/roomTypeApi';
import { useGetBuildingsQuery } from 'src/redux/InstituteSetup/BuildingApi/BuildingApi';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';
import { Grid, Button, Checkbox, TextField, DialogActions, FormControlLabel } from '@mui/material';
import {
  useAddRoomMutation,
  useUpdateRoomMutation,
} from 'src/redux/InstituteSetup/RoomApi/RoomApi';

interface IRoomFormProps {
  open: UseBooleanReturn;
  onClose: (_e: any, isSubmit?: boolean) => void;
  editData?: any;
}

const featureOptions = [
  'Air Conditioning',
  'Whiteboard',
  'CCTV',
  'Power Backup',
  'Emergency Exit',
  'Projector',
  'WiFi',
  'Audio System',
  'Wheelchair Access',
  'First Aid Kit',
];

const calculatedBenches = (rows: number | string, columns: number | string) =>
  Number(rows) * Number(columns);

const effectiveBenches = (
  totalBenches: number | string,
  rows: number | string,
  columns: number | string
) => (totalBenches === '' ? calculatedBenches(rows, columns) : Number(totalBenches));

const RoomForm: React.FC<IRoomFormProps> = ({ open, onClose, editData }) => {
  const [addRoom, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddRoomMutation,
  });
  const [updateRoom, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateRoomMutation,
  });
  const { data: buildings, isLoading: isBuldingLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBuildingsQuery,
  });
  const { data: roomTypes, isLoading: isRoomTypeLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetRoomTypesQuery,
  });

  const [floorsOptions, setFloorsOptions] = useState([]);
  const formik = useFormik({
    initialValues: {
      roomName: editData?.roomName || '',
      capacity: editData?.capacity || '',
      building: editData?.buildingId || '',
      floor: editData?.floorId || editData?.floor || '',
      roomType: editData?.roomTypeId || '',
      totalBenches:
        editData?.totalBenches &&
        editData.totalBenches !==
          calculatedBenches(editData.benchesPerRow, editData.benchesPerColumn)
          ? editData.totalBenches
          : '',
      benchCapacity: editData?.benchCapacity || '',
      benchesPerRow: editData?.benchesPerRow || '',
      benchesPerColumn: editData?.benchesPerColumn || '',
      features: editData?.features ? editData.features : [],
    },
    validationSchema: Yup.object().shape({
      roomName: Yup.string().required('Room Name/No. is required'),
      capacity: Yup.number().required('Capacity (Total) is required'),
      building: Yup.string().required('Building is required'),
      floor: Yup.string().required('Floor is required'),
      roomType: Yup.string().required('Room Type is required'),
      totalBenches: Yup.number()
        .transform((value, originalValue) => (originalValue === '' ? undefined : value))
        .test(
          'whole-positive',
          'Total Benches must be a whole number of at least 1',
          function (value) {
            const total =
              value ?? calculatedBenches(this.parent.benchesPerRow, this.parent.benchesPerColumn);
            return Number.isInteger(total) && total >= 1;
          }
        )
        .test(
          'within-grid',
          'Total Benches cannot exceed Class Benches Rows × Class Benches Columns',
          function (value) {
            if (value === undefined) return true;
            const grid = calculatedBenches(this.parent.benchesPerRow, this.parent.benchesPerColumn);
            return !Number.isFinite(grid) || grid < 1 || value <= grid;
          }
        ),
      benchCapacity: Yup.number().required('Bench Capacity is required'),
      benchesPerRow: Yup.number().required('Class Benches Rows is required'),
      benchesPerColumn: Yup.number().required('Class Benches Columns is required'),
    }),
    onSubmit: (values) => {
      const totalBenches = effectiveBenches(
        values.totalBenches,
        values.benchesPerRow,
        values.benchesPerColumn
      );
      const selectedBuilding: any = buildings?.find((b: any) => b.id === values.building);
      const selectedFloor: any = floorsOptions?.find((f: any) => f.id === values.floor);
      const selectedRoomType: any = roomTypes?.items?.find((r: any) => r.id === values.roomType);

      const payload = {
        roomName: values.roomName,
        capacity: totalBenches * Number(values.benchCapacity),
        buildingId: values.building,
        buildingName: selectedBuilding?.buildingName || '',
        floorId: values.floor,
        floorName: selectedFloor?.floorName || '',
        roomTypeId: values.roomType,
        roomTypeName: selectedRoomType?.roomTypeName || '',
        totalBenches,
        benchCapacity: Number(values.benchCapacity),
        benchesPerRow: Number(values.benchesPerRow),
        benchesPerColumn: Number(values.benchesPerColumn),
        features: values.features,
      };

      if (editData) {
        updateRoom({
          id: editData.id,
          body: {
            id: editData.id,
            creationTime: editData.creationTime,
            creatorId: editData.creatorId,
            lastModificationTime: editData.lastModificationTime,
            lastModifierId: editData.lastModifierId,
            ...payload,
          },
        });
        shikshaMitraToast.success({
          message: `"${values.roomName}" Room updated successfully`,
        });
        onClose(null, true);
        return;
      }
      addRoom(payload);
      shikshaMitraToast.success({
        message: `"${values.roomName}" Room added successfully`,
      });
      onClose(null, true);
    },
  });

  const handleFeatureChange = (feature: string) => {
    const current = formik.values.features;
    if (current.includes(feature)) {
      formik.setFieldValue(
        'features',
        current.filter((f: any) => f !== feature)
      );
    } else {
      formik.setFieldValue('features', [...current, feature]);
    }
  };

  useEffect(() => {
    setFloorsOptions(
      buildings?.find((building: any) => building.id === formik.values.building)?.floors || []
    );
  }, [buildings, formik.values.building]);

  useEffect(() => {
    const total =
      effectiveBenches(
        formik.values.totalBenches,
        formik.values.benchesPerRow,
        formik.values.benchesPerColumn
      ) * Number(formik.values.benchCapacity);
    formik.setFieldValue('capacity', total > 0 ? total : '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    formik.values.totalBenches,
    formik.values.benchCapacity,
    formik.values.benchesPerRow,
    formik.values.benchesPerColumn,
  ]);

  const gridBenches = calculatedBenches(
    formik.values.benchesPerRow,
    formik.values.benchesPerColumn
  );
  const totalBenchesError =
    formik.touched.totalBenches || formik.values.totalBenches !== ''
      ? formik.errors.totalBenches
      : undefined;

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }} mb={-3}>
            <SectionCard title="Basic Details">
              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField error={formik.touched.roomName && !!formik.errors.roomName}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Room Name/No. *"
                    name="roomName"
                    value={formik.values.roomName}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^a-zA-Z-:0-9\s]/g, '');
                      formik.setFieldValue('roomName', value);
                    }}
                    onBlur={formik.handleBlur}
                    error={formik.touched.roomName && Boolean(formik.errors.roomName)}
                    helperText={(formik.touched.roomName && formik.errors.roomName) as string}
                  />
                </ShakingTextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField error={formik.touched.building && !!formik.errors.building}>
                  <CustomSelect
                    label="Building *"
                    name="building"
                    size="small"
                    isLoading={isBuldingLoading}
                    options={buildings || []}
                    labelKey="buildingName"
                    valueKey="id"
                    value={formik.values.building}
                    onChange={(value) => {
                      formik.setFieldValue('building', value);
                      setFloorsOptions(
                        buildings?.find((building: any) => building.id === value)?.floors || []
                      );
                    }}
                    onBlur={formik.handleBlur}
                    formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                    error={formik.touched.building && Boolean(formik.errors.building)}
                    helperText={(formik.touched.building && formik.errors.building) as string}
                  />
                </ShakingTextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField error={formik.touched.floor && !!formik.errors.floor}>
                  <CustomSelect
                    label="Floor *"
                    name="floor"
                    size="small"
                    options={floorsOptions || []}
                    labelKey="floorName"
                    valueKey="id"
                    value={formik.values.floor}
                    onChange={(value) => formik.setFieldValue('floor', value)}
                    onBlur={formik.handleBlur}
                    formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                    error={formik.touched.floor && Boolean(formik.errors.floor)}
                    helperText={(formik.touched.floor && formik.errors.floor) as string}
                  />
                </ShakingTextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField error={formik.touched.roomType && !!formik.errors.roomType}>
                  <CustomSelect
                    label="Room Type *"
                    name="roomType"
                    size="small"
                    isLoading={isRoomTypeLoading}
                    options={roomTypes?.items || []}
                    labelKey="roomTypeName"
                    valueKey="id"
                    value={formik.values.roomType}
                    onChange={(value) => formik.setFieldValue('roomType', value)}
                    onBlur={formik.handleBlur}
                    formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                    error={formik.touched.roomType && Boolean(formik.errors.roomType)}
                    helperText={(formik.touched.roomType && formik.errors.roomType) as string}
                  />
                </ShakingTextField>
              </Grid>
            </SectionCard>
          </Grid>

          <Grid size={{ xs: 12 }} mb={-3}>
            <SectionCard title="Benches Details">
              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField
                  error={formik.touched.benchesPerRow && !!formik.errors.benchesPerRow}
                >
                  <TextField
                    fullWidth
                    size="small"
                    label="Class Benches Rows *"
                    name="benchesPerRow"
                    type="number"
                    value={formik.values.benchesPerRow}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.benchesPerRow && Boolean(formik.errors.benchesPerRow)}
                    helperText={
                      (formik.touched.benchesPerRow && formik.errors.benchesPerRow) as string
                    }
                  />
                </ShakingTextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField
                  error={formik.touched.benchesPerColumn && !!formik.errors.benchesPerColumn}
                >
                  <TextField
                    fullWidth
                    size="small"
                    label="Class Benches Columns *"
                    name="benchesPerColumn"
                    type="number"
                    value={formik.values.benchesPerColumn}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.benchesPerColumn && Boolean(formik.errors.benchesPerColumn)
                    }
                    helperText={
                      (formik.touched.benchesPerColumn && formik.errors.benchesPerColumn) as string
                    }
                  />
                </ShakingTextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField
                  error={formik.touched.benchCapacity && !!formik.errors.benchCapacity}
                >
                  <TextField
                    fullWidth
                    size="small"
                    label="Bench Capacity *"
                    name="benchCapacity"
                    type="number"
                    value={formik.values.benchCapacity}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.benchCapacity && Boolean(formik.errors.benchCapacity)}
                    helperText={
                      (formik.touched.benchCapacity && formik.errors.benchCapacity) as string
                    }
                  />
                </ShakingTextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField error={!!totalBenchesError}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Total Benches *"
                    name="totalBenches"
                    type="text"
                    value={formik.values.totalBenches}
                    placeholder={gridBenches > 0 ? String(gridBenches) : ''}
                    InputLabelProps={{
                      shrink: gridBenches > 0 || formik.values.totalBenches !== '',
                      sx: { '&.Mui-focused': { color: 'text.secondary' } },
                    }}
                    inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                    onFocus={(event) => {
                      const input = event.currentTarget;
                      if (input.value) {
                        requestAnimationFrame(() => {
                          if (document.activeElement !== input) return;
                          const end = input.value.length;
                          input.setSelectionRange(end, end);
                        });
                      }
                    }}
                    onChange={(event) => {
                      if (/^\d*$/.test(event.target.value)) formik.handleChange(event);
                    }}
                    onBlur={formik.handleBlur}
                    error={Boolean(totalBenchesError)}
                    helperText={totalBenchesError as string}
                  />
                </ShakingTextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField error={formik.touched.capacity && !!formik.errors.capacity}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Capacity (Total) *"
                    name="capacity"
                    type="number"
                    value={formik.values.capacity}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    inputProps={{ min: 0, max: 100 }}
                    disabled
                    error={formik.touched.capacity && Boolean(formik.errors.capacity)}
                    helperText={(formik.touched.capacity && formik.errors.capacity) as string}
                  />
                </ShakingTextField>
              </Grid>
            </SectionCard>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <SectionCard title="Features">
              <Grid container spacing={1} ml={2} mt={1}>
                {featureOptions.map((feature) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={feature}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formik.values.features.includes(feature)}
                          onChange={() => handleFeatureChange(feature)}
                        />
                      }
                      label={feature}
                    />
                  </Grid>
                ))}
              </Grid>
            </SectionCard>
          </Grid>
        </Grid>
      </DialogScrollContent>

      <DialogActions>
        <Button
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          variant="outlined"
          size="small"
          onClick={() => onClose(null, false)}
        >
          Cancel
        </Button>
        <LoadingButton
          size="small"
          variant="contained"
          loading={isUpdateLoading || isLoading}
          startIcon={
            <Iconify
              icon={editData ? GlobalIcons.edit : GlobalIcons.submit}
              width={editData ? 16 : 20}
              height={editData ? 16 : 20}
            />
          }
          onClick={(e: any) => {
            formik.handleSubmit(e);
          }}
          type="submit"
        >
          {editData ? 'Update' : 'Submit'}
        </LoadingButton>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default RoomForm;
