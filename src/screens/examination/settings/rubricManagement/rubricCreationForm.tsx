import dayjs from 'dayjs';
import React, { useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { AcademicDatePicker as DatePicker } from 'src/components/academic-date-picker';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, Grid, Button, TextField, DialogActions } from '@mui/material';

const RubricCreationForm = ({ onClose }: { onClose?: () => void }) => {
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });
  const [classes, setClasses] = useState<string>('');
  // const [division, setDivision] = useState<string>('');
  const [, setDivisionOptions] = useState<any[]>([]);

  return (
    <Box display="flex" flexDirection="column" gap={1}>
      <form onSubmit={() => {}}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '300px' }}>
          <Grid container spacing={1}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomSelect
                options={classData?.items || []}
                value={classes}
                onChange={(val) => {
                  const selectedClass = classData?.items?.find((i: any) => i.id === val);
                  setClasses(val as string);
                  setDivisionOptions(selectedClass?.divisions || []);
                }}
                label="Class"
                isLoading={isLoading}
                labelKey="name"
                valueKey="id"
                formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <CustomSelect
                label="Subject"
                options={[
                  { value: 'math', label: 'Mathematics' },
                  { value: 'science', label: 'Science' },
                  { value: 'history', label: 'History' },
                  { value: 'english', label: 'English' },
                ]}
                value=""
                onChange={(val) => {
                  // formik.setFieldValue('subject', val)
                }}
                formControlProps={{ fullWidth: true }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <CustomSelect
                label="Point Scale"
                options={[
                  { value: '3', label: '3' },
                  { value: '4', label: '4' },
                  { value: '5', label: '5' },
                  { value: '6', label: '6' },
                  { value: '7', label: '7' },
                ]}
                value=""
                onChange={(val) => {
                  // formik.setFieldValue('subject', val)
                }}
                formControlProps={{ fullWidth: true }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Rubric Objective"
                name="objective"
                value=""
                size="small"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Rubric Description"
                name="description"
                value=""
                size="small"
                multiline
                rows={3}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <DatePicker
                label="Date"
                value={dayjs()}
                standardId={classes || null}
                validationType="ExamSchedule"
                onChange={(val) => {
                  // formik.setFieldValue('dueDate', val);
                }}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                  },
                }}
                disablePast
              />
            </Grid>
          </Grid>
        </Scrollbar>
        <DialogActions>
          <Button startIcon={<Iconify icon={GlobalIcons.rubricFile} />} variant="contained">
            Generate Rubric
          </Button>
        </DialogActions>
      </form>
    </Box>
  );
};

export default RubricCreationForm;
