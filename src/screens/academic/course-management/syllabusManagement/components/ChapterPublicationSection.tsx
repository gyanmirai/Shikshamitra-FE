import type { FormikProps } from 'formik';

import { Grid, MenuItem, TextField } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';

import { visibilityOptions, publishStatusOptions } from '../syllabusPlanningData';

import type { IChapterFormValues } from '../type';

export function ChapterPublicationSection({ formik }: { formik: FormikProps<IChapterFormValues> }) {
  return (
    <FormSectionCard
      icon="mdi:book-open-outline"
      title="Publication and Audience"
      descriptionTooltip="Publish the chapter and choose its audience to make it available in the mobile syllabus."
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            select
            fullWidth
            size="small"
            name="publishStatus"
            label="Publication status"
            value={formik.values.publishStatus}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            disabled={formik.isSubmitting}
            helperText="Only published chapters appear in the mobile syllabus."
          >
            {publishStatusOptions.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            select
            fullWidth
            size="small"
            name="visibility"
            label="Visible to"
            value={formik.values.visibility}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            disabled={formik.isSubmitting}
            helperText={
              formik.values.visibility === 'Teacher'
                ? 'Teacher-only chapters stay hidden from students and parents.'
                : 'Choose All to include both students and parents.'
            }
          >
            {visibilityOptions.map((visibility) => (
              <MenuItem key={visibility} value={visibility}>
                {visibility}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>
    </FormSectionCard>
  );
}
