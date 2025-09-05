import { useFormik } from 'formik';
import { PDFViewer } from '@react-pdf/renderer';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import { Box, Grid, Button, TextField, DialogActions } from '@mui/material';
import { CertificateDocument } from 'src/templates/student-certificates/bonofied-certificate-1';

import type { AssignGradeProps } from './type';

export const AssignGrade: React.FC<AssignGradeProps> = ({
  isBulk,
  data,
  onSubmit,
}: AssignGradeProps) => {
  const formik = useFormik({
    initialValues: {
      grade: data?.grade || '',
      feedback: data?.feedback || '',
    },
    onSubmit(values) {
      onSubmit(values);
    },
  });

  return (
    <Box display="flex" flexDirection="column" gap={2} p={1}>
      <form onSubmit={formik.handleSubmit}>
        <Scrollbar
          sx={{ p: 2, bgcolor: 'background.neutral', height: !isBulk ? '500px' : '200px' }}
        >
          {!isBulk && (
            <PDFViewer width="100%" height="600">
              <CertificateDocument />
            </PDFViewer>
          )}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <CustomSelect
                options={[
                  { value: 'A+', label: 'A+' },
                  { value: 'A', label: 'A' },
                  { value: 'A-', label: 'A-' },
                  { value: 'B+', label: 'B+' },
                  { value: 'B', label: 'B' },
                  { value: 'B-', label: 'B-' },
                  { value: 'C+', label: 'C+' },
                  { value: 'C', label: 'C' },
                  { value: 'C-', label: 'C-' },
                  { value: 'D', label: 'D' },
                  { value: 'F', label: 'F' },
                ]}
                label="Grade"
                name="grade"
                value={formik.values.grade}
                onChange={(val) => formik.setFieldValue('grade', val)}
                formControlProps={{ sx: { minWidth: 180, width: '100%' } }}
                error={formik.touched.grade && Boolean(formik.errors.grade)}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                placeholder="Detailed Feedback"
                multiline
                rows={3}
                fullWidth
                name="feedback"
                value={formik.values.feedback}
                onChange={formik.handleChange}
              />
            </Grid>
          </Grid>
        </Scrollbar>
        <DialogActions>
          <Button type="submit" variant="contained">
            Submit
          </Button>
        </DialogActions>
      </form>
    </Box>
  );
};
