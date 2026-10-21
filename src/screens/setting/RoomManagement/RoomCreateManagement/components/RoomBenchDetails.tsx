import { Grid, TextField } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';

import { RoomColumnRows } from './RoomColumnRows';
import { totalRoomBenches } from '../services/room-layout';

import type { RoomFormik } from '../types/room-form';

export function RoomBenchDetails({ formik }: { formik: RoomFormik }) {
  const total = totalRoomBenches(formik.values.columnRows);
  return (
    <FormSectionCard
      title="Bench Layout"
      icon="mdi:table-chair"
      descriptionTooltip="Set the number of columns, then enter the bench rows in each column. Each row contains one bench in that column."
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            size="small"
            required
            type="number"
            label="Columns"
            name="columns"
            value={formik.values.columns}
            inputProps={{ min: 1, max: 50, step: 1 }}
            onBlur={formik.handleBlur}
            error={Boolean(formik.touched.columns && formik.errors.columns)}
            helperText={formik.touched.columns && formik.errors.columns}
            onChange={(event) => {
              const count = event.target.value === '' ? '' : Number(event.target.value);
              formik.setFieldValue('columns', count);
              if (count === '') formik.setFieldValue('columnRows', []);
              else if (Number.isInteger(count) && count >= 1 && count <= 50) {
                formik.setFieldValue(
                  'columnRows',
                  Array.from({ length: count }, (_, index) => formik.values.columnRows[index] ?? '')
                );
              }
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            size="small"
            required
            type="number"
            label="Students per bench"
            name="benchCapacity"
            value={formik.values.benchCapacity}
            inputProps={{ min: 1, max: 20, step: 1 }}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={Boolean(formik.touched.benchCapacity && formik.errors.benchCapacity)}
            helperText={formik.touched.benchCapacity && formik.errors.benchCapacity}
          />
        </Grid>
        <Grid size={12}>
          <RoomColumnRows formik={formik} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            size="small"
            label="Total benches"
            value={total}
            slotProps={{ input: { readOnly: true } }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            size="small"
            label="Total student capacity"
            value={total * Number(formik.values.benchCapacity)}
            slotProps={{ input: { readOnly: true } }}
          />
        </Grid>
      </Grid>
    </FormSectionCard>
  );
}
