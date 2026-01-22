import type { FormikProps } from 'formik';
import type { Board } from 'src/types/school';

import dayjs from 'dayjs';
import { capitalize } from 'lodash';
import { DatePicker } from '@mui/x-date-pickers';
// Utils
import calculateAge from 'src/utils/calculate-age';
import CustomSelect from 'src/components/custom-select';
// Components
import ShakingTextField from 'src/components/shaking-text-field';
import {
  Box,
  Card,
  Grid,
  Radio,
  Divider,
  TextField,
  RadioGroup,
  Typography,
  FormControl,
  FormHelperText,
  FormControlLabel,
} from '@mui/material';

import type { IInquiryFormValues } from '../../type';

interface BasicStudentDetailsProps {
  formik: FormikProps<IInquiryFormValues>;
  data: {
    academicYear: any;
    boards: any[];
    board: any;
    classes: any[];
  };
  loading: {
    yearLoading: boolean;
    boardLoading: boolean;
    classLoading: boolean;
    isGetLoading: boolean;
  };
  actions: {
    getClassByMedium: (id: string) => Promise<any>;
    updateBoards?: (boards: any[]) => void;
  };
}

export const BasicStudentDetails = ({
  formik,
  data,
  loading,
  actions,
}: BasicStudentDetailsProps) => {
  const { values, touched, errors, setFieldValue, setFieldTouched, handleChange } = formik;
  const { academicYear, boards, board, classes } = data;
  const { yearLoading, boardLoading, classLoading, isGetLoading } = loading;

  if (isGetLoading) {
    return (
      <>
        <Card sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight={600} color="text.primary">
            Inquiry & Admission
          </Typography>
          <Divider sx={{ my: 2, borderStyle: 'dashed' }} />
          <Typography color="text.secondary">Loading...</Typography>
        </Card>
        <Card sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight={600} color="text.primary">
            Student
          </Typography>
          <Divider sx={{ my: 2, borderStyle: 'dashed' }} />
          <Typography color="text.secondary">Loading...</Typography>
        </Card>
      </>
    );
  }

  return (
    <>
      {/* Section 1: Inquiry & Admission */}
      <Card
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 2,
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08)',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="h6" fontWeight={600} color="text.primary">
          Inquiry & Admission
        </Typography>
        <Divider sx={{ my: 2, borderStyle: 'dashed', borderColor: 'divider' }} />

        <Grid container spacing={2.5}>
          {/* Academic Year */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <ShakingTextField error={!!(touched.academicYear && errors.academicYear)}>
              <CustomSelect
                name="academicYear"
                label="Academic Year *"
                isLoading={yearLoading}
                options={academicYear?.items || []}
                value={values.academicYear}
                labelKey="name"
                valueKey="id"
                disabled
                onChange={(value) => {
                  setFieldValue('board', '');
                  setFieldValue('medium', '');
                  setFieldValue('class', '');
                  setFieldValue('academicYear', value);
                }}
                error={!!(touched.academicYear && errors.academicYear)}
                helperText={(touched.academicYear && errors.academicYear) || ''}
                formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
              />
            </ShakingTextField>
          </Grid>

          {/* Board */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <ShakingTextField error={!!(touched.board && errors.board)}>
              <CustomSelect
                name="board"
                label="Board *"
                isLoading={boardLoading}
                options={boards || []}
                labelKey="name"
                valueKey="id"
                value={values.board}
                onChange={(value) => {
                  setFieldValue('medium', '');
                  setFieldValue('class', '');
                  setFieldValue('board', value);
                }}
                error={!!(touched.board && errors.board)}
                helperText={(touched.board && errors.board) || ''}
                formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                disabled={!values.academicYear}
              />
            </ShakingTextField>
          </Grid>

          {/* Medium */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <ShakingTextField error={!!(touched.medium && errors.medium)}>
              <CustomSelect
                name="medium"
                label="Medium *"
                disabled={!values.board}
                options={
                  board?.items?.find((item: Board) => item.id === values.board)?.educationMediums ||
                  []
                }
                value={values.medium}
                labelKey="name"
                valueKey="id"
                onChange={async (value) => {
                  setFieldValue('medium', value);
                  setFieldValue('class', '');
                  setFieldTouched('medium', false);
                  await actions.getClassByMedium(value as string);
                }}
                error={!!(touched.medium && errors.medium)}
                helperText={(touched.medium && errors.medium) || ''}
                formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
              />
            </ShakingTextField>
          </Grid>

          {/* Class */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <ShakingTextField error={!!(touched.class && errors.class)}>
              <CustomSelect
                name="class"
                label="Class *"
                disabled={!values.medium}
                isLoading={classLoading}
                labelKey="name"
                valueKey="id"
                options={classes || []}
                value={values.class}
                onChange={(value) => {
                  setFieldValue('class', value);
                }}
                error={!!(touched.class && errors.class)}
                helperText={(touched.class && errors.class) || ''}
                formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
              />
            </ShakingTextField>
          </Grid>

          {/* previous school */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <ShakingTextField error={!!(touched.previousSchool && errors.previousSchool)}>
              <TextField
                name="previousSchool"
                fullWidth
                size="small"
                label="Previous School"
                value={values.previousSchool}
                onChange={(e) => {
                  const { value } = e.target;
                  if (value.length <= 50) {
                    setFieldValue('previousSchool', value);
                  }
                }}
                error={!!(touched.previousSchool && errors.previousSchool)}
                helperText={(touched.previousSchool && errors.previousSchool) || ''}
                inputProps={{ maxLength: 50 }}
              />
            </ShakingTextField>
          </Grid>
        </Grid>
      </Card>

      {/* Section 2: Student */}
      <Card
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 2,
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08)',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="h6" fontWeight={600} color="text.primary">
          Student
        </Typography>
        <Divider sx={{ my: 2, borderStyle: 'dashed', borderColor: 'divider' }} />

        <Grid container spacing={2.5}>
          {/* First Name */}
          <Grid size={{ xs: 12, sm: 4 }}>
            <ShakingTextField error={!!(touched.firstName && errors.firstName)}>
              <TextField
                fullWidth
                size="small"
                name="firstName"
                label="First Name *"
                error={!!(touched.firstName && errors.firstName)}
                helperText={(touched.firstName && errors.firstName) || ''}
                value={values.firstName}
                onChange={(e) => {
                  const onlyLetters = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                  const capitalized = capitalize(onlyLetters);
                  if (capitalized.length <= 30) setFieldValue('firstName', capitalized);
                }}
                inputProps={{ maxLength: 30 }}
              />
            </ShakingTextField>
          </Grid>

          {/* Middle Name */}
          <Grid size={{ xs: 12, sm: 4 }}>
            <ShakingTextField error={!!(touched.middleName && errors.middleName)}>
              <TextField
                fullWidth
                size="small"
                name="middleName"
                label="Middle Name"
                error={touched.middleName && Boolean(errors.middleName)}
                helperText={touched.middleName && errors.middleName}
                value={values.middleName}
                onChange={(e) => {
                  const onlyLetters = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                  const capitalized = capitalize(onlyLetters);
                  if (capitalized.length <= 30) setFieldValue('middleName', capitalized);
                }}
                inputProps={{ maxLength: 30 }}
              />
            </ShakingTextField>
          </Grid>

          {/* Last Name */}
          <Grid size={{ xs: 12, sm: 4 }}>
            <ShakingTextField error={!!(touched.lastName && errors.lastName)}>
              <TextField
                fullWidth
                size="small"
                name="lastName"
                label="Last Name *"
                error={touched.lastName && Boolean(errors.lastName)}
                helperText={touched.lastName && errors.lastName}
                value={values.lastName}
                onChange={(e) => {
                  const onlyLetters = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                  const capitalized = capitalize(onlyLetters);
                  if (capitalized.length <= 30) setFieldValue('lastName', capitalized);
                }}
                inputProps={{ maxLength: 30 }}
              />
            </ShakingTextField>
          </Grid>

          {/* Date of Birth */}
          <Grid size={{ xs: 12, sm: 4 }}>
            <ShakingTextField error={!!(touched.dateOfBirth && errors.dateOfBirth)}>
              <DatePicker
                label="Date of Birth *"
                name="dateOfBirth"
                value={values.dateOfBirth}
                format="DD-MM-YYYY"
                onChange={(newValue) => {
                  const date = newValue?.format();
                  if (date) {
                    const age = calculateAge(date);
                    setFieldValue('age', age);
                  }
                  setFieldValue('dateOfBirth', newValue);
                }}
                disableFuture
                minDate={dayjs('1947-01-01')}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                    error: !!(touched.dateOfBirth && errors.dateOfBirth),
                    helperText: (touched.dateOfBirth && errors.dateOfBirth) || '',
                  },
                }}
              />
            </ShakingTextField>
          </Grid>

          {/* Gender */}
          <Grid size={{ xs: 12, sm: 8 }}>
            <ShakingTextField error={!!(touched.gender && errors.gender)}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, height: 40 }}>
                <Typography
                  variant="body2"
                  color={touched.gender && errors.gender ? 'error.main' : 'text.secondary'}
                  sx={{ fontWeight: 500 }}
                >
                  Gender *
                </Typography>
                <FormControl component="fieldset" error={!!(touched.gender && errors.gender)}>
                  <RadioGroup
                    row
                    aria-labelledby="gender-group"
                    name="gender"
                    value={values.gender}
                    onChange={handleChange}
                  >
                    <FormControlLabel
                      value={0}
                      control={<Radio size="small" />}
                      label="Male"
                      sx={{ mr: 3 }}
                    />
                    <FormControlLabel value={1} control={<Radio size="small" />} label="Female" />
                  </RadioGroup>
                </FormControl>
              </Box>
              {!!(touched.gender && errors.gender) && (
                <FormHelperText error sx={{ ml: 0 }}>
                  {errors.gender}
                </FormHelperText>
              )}
            </ShakingTextField>
          </Grid>
        </Grid>
      </Card>
    </>
  );
};
