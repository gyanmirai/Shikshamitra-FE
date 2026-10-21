import Add from '@mui/icons-material/Add';
import Remove from '@mui/icons-material/Remove';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Grid, Stack, TextField, IconButton, Typography } from '@mui/material';

import type { RoomFormik } from '../types/room-form';

export function RoomColumnRows({ formik }: { formik: RoomFormik }) {
  if (!formik.values.columnRows.length) return null;
  return (
    <Stack spacing={1.5} sx={{ pt: 2, borderTop: 1, borderColor: 'divider' }}>
      <Typography variant="subtitle2">Rows in each column</Typography>
      <Grid container spacing={1.5}>
        {formik.values.columnRows.map((rows, index) => {
          const name = `columnRows[${index}]`;
          const field = formik.getFieldMeta<number | ''>(name);
          const error = field.touched || formik.submitCount > 0 ? field.error : undefined;
          const count = Number(rows);
          const valid = Number.isInteger(count) && count >= 1 && count <= 100;
          const capacity = Number(formik.values.benchCapacity);
          return (
            <Grid size={{ xs: 12, sm: 6 }} key={index}>
              <Box
                component="fieldset"
                sx={{
                  m: 0,
                  p: 1.5,
                  minWidth: 0,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1.5,
                  bgcolor: 'background.neutral',
                }}
              >
                <Typography component="legend" variant="subtitle2" sx={{ px: 0.75 }}>
                  Column {index + 1}
                </Typography>
                <Stack direction="row" spacing={0.5} alignItems="flex-start">
                  <CustomTooltip title={`Decrease rows in column ${index + 1}`}>
                    <span>
                      <IconButton
                        type="button"
                        aria-label={`Decrease rows in column ${index + 1}`}
                        disabled={!valid || count <= 1}
                        onClick={() => formik.setFieldValue(name, count - 1)}
                        sx={{ width: 44, height: 44 }}
                      >
                        <Remove fontSize="small" />
                      </IconButton>
                    </span>
                  </CustomTooltip>
                  <TextField
                    fullWidth
                    size="small"
                    required
                    type="number"
                    label="Rows"
                    name={name}
                    value={rows}
                    inputProps={{
                      min: 1,
                      max: 100,
                      step: 1,
                      'aria-label': `Column ${index + 1} rows`,
                    }}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={Boolean(error)}
                    helperText={error}
                  />
                  <CustomTooltip title={`Increase rows in column ${index + 1}`}>
                    <span>
                      <IconButton
                        type="button"
                        aria-label={`Increase rows in column ${index + 1}`}
                        disabled={valid && count >= 100}
                        onClick={() => formik.setFieldValue(name, valid ? count + 1 : 1)}
                        sx={{ width: 44, height: 44 }}
                      >
                        <Add fontSize="small" />
                      </IconButton>
                    </span>
                  </CustomTooltip>
                </Stack>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mt: 1 }}
                  aria-live="polite"
                >
                  {valid
                    ? `${count} benches${capacity > 0 ? ` · ${count * capacity} students` : ''}`
                    : 'Enter the rows for this column'}
                </Typography>
              </Box>
            </Grid>
          );
        })}
      </Grid>
    </Stack>
  );
}
