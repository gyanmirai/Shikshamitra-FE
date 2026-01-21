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
  Grid,
  Radio,
  TextField,
  FormLabel,
  RadioGroup,
  Typography,
  FormControl,
  FormHelperText,
  FormControlLabel,
} from '@mui/material';

import { CollapsibleFormSection } from '../common/CollapsibleFormSection';

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

  const basicDetailsError =
    (!!touched.academicYear && !!errors.academicYear) ||
    (!!touched.board && !!errors.board) ||
    (!!touched.medium && !!errors.medium) ||
    (!!touched.class && !!errors.class) ||
    (!!touched.firstName && !!errors.firstName) ||
    (!!touched.lastName && !!errors.lastName) ||
    (!!touched.dateOfBirth && !!errors.dateOfBirth) ||
    (!!touched.gender && !!errors.gender);

  if (isGetLoading) {
    // Return skeleton or null, managed by parent usually but sections can have internal loading states
    // The parent implementation used an array of skeletons. We can do that here or let parent handle high level loading.
    // For now, let's render the form and use skeletons for fields if needed, or rely on parent blocking.
    // The original code rendered skeletons INSIDE the section.
    return (
      <CollapsibleFormSection
        title="Basic Student Details"
        defaultExpanded
        step="Step 1 of 4"
        error={false}
      >
        Loading...
      </CollapsibleFormSection>
    );
  }

  return (
    <CollapsibleFormSection
      title="Basic Student Details"
      defaultExpanded
      step="Step 1 of 4"
      error={basicDetailsError}
    >
      <Grid size={{ xs: 12, md: 3 }}>
        <ShakingTextField error={!!(touched.academicYear && errors.academicYear) || false}>
          <CustomSelect
            name="academicYear"
            label="Academic Year *"
            isLoading={yearLoading}
            options={academicYear?.items || []}
            value={values.academicYear}
            labelKey="name"
            valueKey="id"
            disabled // Auto-filled behavior
            onChange={(value) => {
              // const findBoards = board?.items.filter(
              //   (item: Board) => item.academicYearId === value
              // );
              // This logic is duplicated slightly from hook, but onChange handlers in UI usually trigger state updates
              // Ideally the hook handles the state update reactive to values.academicYear
              setFieldValue('board', '');
              setFieldValue('medium', '');
              setFieldValue('class', '');
              setFieldValue('academicYear', value);
            }}
            error={!!(touched.academicYear && errors.academicYear) || false}
            helperText={(touched.academicYear && errors.academicYear) || 'Auto-filled'}
            formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
          />
        </ShakingTextField>
      </Grid>
      <Grid size={{ xs: 12, md: 3 }}>
        <ShakingTextField error={!!(touched.board && errors.board) || false}>
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
            error={!!(touched.board && errors.board) || false}
            helperText={(touched.board && errors.board) || ''}
            formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
            disabled={!values.academicYear}
          />
        </ShakingTextField>
      </Grid>
      <Grid size={{ xs: 12, md: 3 }}>
        <ShakingTextField error={!!(touched.medium && errors.medium) || false}>
          <CustomSelect
            name="medium"
            label="Medium *"
            disabled={!values.board}
            options={
              board?.items?.find((item: Board) => item.id === values.board)?.educationMediums || []
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
            error={!!(touched.medium && errors.medium) || false}
            helperText={(touched.medium && errors.medium) || ''}
            formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
          />
        </ShakingTextField>
      </Grid>
      <Grid size={{ xs: 12, md: 3 }}>
        <ShakingTextField error={!!(touched.class && errors.class) || false}>
          <CustomSelect
            name="class"
            label="Class Seeking Admission *"
            disabled={!values.medium}
            isLoading={classLoading}
            labelKey="name"
            valueKey="id"
            options={classes || []}
            value={values.class}
            onChange={(value) => {
              setFieldValue('class', value);
            }}
            error={!!(touched.class && errors.class) || false}
            helperText={(touched.class && errors.class) || ''}
            formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
          />
        </ShakingTextField>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
          Student Name
        </Typography>
        <Box display="flex" gap={2}>
          <Box flex={1}>
            <ShakingTextField error={!!(touched.firstName && errors.firstName) || false}>
              <TextField
                fullWidth
                size="small"
                name="firstName"
                label="First Name *"
                error={!!(touched.firstName && errors.firstName) || false}
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
          </Box>
          <Box flex={1}>
            <ShakingTextField error={!!(touched.middleName && errors.middleName) || false}>
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
          </Box>
          <Box flex={1}>
            <ShakingTextField error={!!(touched.lastName && errors.lastName) || false}>
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
          </Box>
        </Box>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <ShakingTextField error={!!(touched.dateOfBirth && errors.dateOfBirth) || false}>
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
                error: !!(touched.dateOfBirth && errors.dateOfBirth) || false,
                helperText: (touched.dateOfBirth && errors.dateOfBirth) || '',
              },
            }}
          />
        </ShakingTextField>
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <ShakingTextField error={!!(touched.gender && errors.gender) || false}>
          <Box>
            <FormControl
              component="fieldset"
              fullWidth
              sx={{
                border: (theme) =>
                  `1px solid ${touched.gender && errors.gender ? theme.palette.error.main : theme.palette.divider}`,
                borderRadius: 1,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
              error={!!(touched.gender && errors.gender) || false}
            >
              <FormLabel id="gender-group" sx={{ mr: 2, fontSize: '0.875rem' }}>
                Gender *
              </FormLabel>
              <RadioGroup
                row
                aria-labelledby="gender-group"
                name="gender"
                value={values.gender}
                onChange={handleChange}
              >
                <FormControlLabel value={0} control={<Radio size="small" />} label="Male" />
                <FormControlLabel value={1} control={<Radio size="small" />} label="Female" />
              </RadioGroup>
            </FormControl>
            {!!(touched.gender && errors.gender) && (
              <FormHelperText error sx={{ px: 1, ml: '0 !important' }}>
                {errors.gender}
              </FormHelperText>
            )}
          </Box>
        </ShakingTextField>
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <ShakingTextField error={!!(touched.previousSchool && errors.previousSchool) || false}>
          <TextField
            fullWidth
            value={values.previousSchool}
            onChange={(e) => {
              const onlyLetters = e.target.value.replace(/[^a-zA-Z0-9\s]/g, '');
              if (onlyLetters.length <= 50) setFieldValue('previousSchool', onlyLetters);
            }}
            inputProps={{ maxLength: 50 }}
            size="small"
            name="previousSchool"
            label="Previous School (Optional)"
            placeholder="e.g. St. Xavier's High School"
            error={!!touched.previousSchool && !!errors.previousSchool}
            helperText={touched.previousSchool && errors.previousSchool}
          />
        </ShakingTextField>
      </Grid>
    </CollapsibleFormSection>
  );
};
